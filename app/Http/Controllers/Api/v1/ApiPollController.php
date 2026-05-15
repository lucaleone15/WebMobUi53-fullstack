<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiPollController extends Controller
{
    private const POLL_RULES = [
        'title'                  => 'nullable|string|max:255',
        'question'               => 'required|string|max:1000',
        'options'                => 'array|min:1',
        'options.*.label'        => 'required|string|max:500',
        'is_draft'               => 'boolean',
        'allow_multiple_choices' => 'boolean',
        'allow_vote_change'      => 'boolean',
        'results_public'         => 'boolean',
        'started_at'             => 'nullable|date',
        'ends_at'                => 'nullable|date|after:started_at',
    ];

    public function index(Request $request): JsonResponse
    {
        $polls = $request->user()
            ->polls()
            ->with(['options' => fn($q) => $q->withCount('votes')])
            ->orderByDesc('created_at')
            ->get();

        return response()->json($polls);
    }

    public function show(string $token): JsonResponse
    {
        $poll = Poll::with(['options' => fn($q) => $q->withCount('votes')])
            ->where('secret_token', $token)
            ->firstOrFail();

        $user          = auth()->user();
        $isOwner       = $user && $user->id === $poll->user_id;
        $userVoteIds   = $user
            ? $poll->votes()->where('user_id', $user->id)->pluck('poll_option_id')->all()
            : [];
        $hasVoted      = ! empty($userVoteIds);
        $canSeeResults = $poll->results_public || $hasVoted || $isOwner;

        if (! $canSeeResults) {
            $poll->options->each(fn($o) => $o->votes_count = 0);
        }

        return response()->json([
            ...$poll->toArray(),
            'total_votes'          => $canSeeResults ? $poll->options->sum('votes_count') : 0,
            'user_has_voted'       => $hasVoted,
            'user_vote_option_ids' => $userVoteIds,
            'user_is_owner'        => $isOwner,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            ...self::POLL_RULES,
            'question' => 'required|string|max:1000',
            'options'  => 'required|array|min:1',
        ]);

        $poll = Poll::create([
            ...$validated,
            'user_id'      => $request->user()->id,
            'secret_token' => Str::random(32),
            'is_draft'     => $validated['is_draft'] ?? true,
        ]);

        $this->syncOptions($poll, $validated['options']);

        return response()->json($poll->load('options'), 201);
    }

    public function update(Request $request, Poll $poll): JsonResponse
    {
        abort_if($poll->user_id !== $request->user()->id, 403);

        $validated = $request->validate(self::POLL_RULES);

        $poll->fill($validated)->save();

        if (isset($validated['options'])) {
            $this->syncOptions($poll, $validated['options']);
        }

        return response()->json($poll->load('options'));
    }

    public function launch(Request $request, Poll $poll): JsonResponse
    {
        abort_if($poll->user_id !== $request->user()->id, 403);
        abort_if(! $poll->is_draft, 422, 'Ce sondage est déjà lancé.');

        $poll->is_draft   = false;
        $poll->started_at ??= now();
        $poll->save();

        return response()->json($poll->load('options'));
    }

    public function destroy(Request $request, Poll $poll): JsonResponse
    {
        abort_if($poll->user_id !== $request->user()->id, 403);
        $poll->delete();

        return response()->json(['message' => 'Sondage supprimé.']);
    }

    // --- Méthodes privées ---

    private function syncOptions(Poll $poll, array $options): void
    {
        $poll->options()->delete();
        $poll->options()->createMany(
            array_map(fn($o) => ['label' => $o['label']], $options)
        );
    }
}
