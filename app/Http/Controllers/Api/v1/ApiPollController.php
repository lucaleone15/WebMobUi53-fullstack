<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use Illuminate\Http\Request;
use Illuminate\Support\Str;


class ApiPollController extends Controller
{
    /**
     * Display a listing of the authenticated user's polls.
     */
    public function index(Request $request)
    {
        $polls = $request->user()
            ->polls()
            ->with(['options' => function ($query) {
                $query->withCount('votes');
            }])
            ->orderBy('created_at', 'desc')
            ->get();

        return $polls;
    }

    /**
     * Display the specified poll by its secret token.
     */
    public function show(string $token)
    {
        $poll = Poll::with(['options' => function ($query) {
            $query->withCount('votes');
        }])->where('secret_token', $token)->first();

        if (!$poll) {
            return response()->json(['message' => 'Poll not found.'], 404);
        }

        return $poll;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'question' => 'required|string|max:1000',
            'is_draft' => 'boolean',
            'allow_multiple_choices' => 'boolean',
            'allow_vote_change' => 'boolean',
            'results_public' => 'boolean',
            'duration' => 'nullable|integer|min:0',
            'started_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        $poll = new Poll();
        $poll->user_id = $request->user()->id;
        $poll->title = $validated['title'] ?? null;
        $poll->question = $validated['question'];
        $poll->secret_token = Str::random(32);
        $poll->is_draft = $validated['is_draft'] ?? true;
        $poll->allow_multiple_choices = $validated['allow_multiple_choices'] ?? false;
        $poll->allow_vote_change = $validated['allow_vote_change'] ?? false;
        $poll->results_public = $validated['results_public'] ?? false;
        $poll->duration = $validated['duration'] ?? null;
        $poll->started_at = $validated['started_at'] ?? null;
        $poll->ends_at = $validated['ends_at'] ?? null;
        $poll->save();

        return $poll;
    }

    public function update(Request $request, Poll $poll)
    {
        if ($poll->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'question' => 'required|string|max:1000',
            'is_draft' => 'boolean',
            'allow_multiple_choices' => 'boolean',
            'allow_vote_change' => 'boolean',
            'results_public' => 'boolean',
            'duration' => 'nullable|integer|min:0',
            'started_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:started_at',
        ]);

        $poll->title = $validated['title'] ?? $poll->title;
        $poll->question = $validated['question'] ?? $poll->question;
        $poll->is_draft = $validated['is_draft'] ?? $poll->is_draft;
        $poll->allow_multiple_choices = $validated['allow_multiple_choices'] ?? $poll->allow_multiple_choices;
        $poll->allow_vote_change = $validated['allow_vote_change'] ?? $poll->allow_vote_change;
        $poll->results_public = $validated['results_public'] ?? $poll->results_public;
        $poll->duration = $validated['duration'] ?? $poll->duration;
        $poll->started_at = $validated['started_at'] ?? $poll->started_at;
        $poll->ends_at = $validated['ends_at'] ?? $poll->ends_at;
        $poll->save();

        return $poll;
    }

    public function destroy(Request $request, Poll $poll)
    {
        if ($poll->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $poll->delete();

        return response()->json(['message' => 'Poll deleted successfully.']);
        // return response()->noContent();
    }
}
