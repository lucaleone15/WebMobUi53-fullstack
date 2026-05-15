<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Models\Poll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiPollVoteController extends Controller
{
    public function vote(Request $request, string $token): JsonResponse
    {
        $poll = Poll::with('options')->where('secret_token', $token)->firstOrFail();

        abort_if($poll->is_draft,       403, "Le sondage n'est pas encore publié.");
        abort_if(! $poll->has_started,  403, "Le sondage n'a pas encore démarré.");
        abort_if($poll->has_ended,      403, 'Le sondage est terminé.');

        $validated = $request->validate([
            'option_id'    => 'required_without:option_ids|integer|exists:poll_options,id',
            'option_ids'   => 'required_without:option_id|array',
            'option_ids.*' => 'integer|exists:poll_options,id',
        ]);

        $selectedIds = $this->resolveOptionIds($poll, $validated);

        $this->validateOptionIds($poll, $selectedIds);

        $existingVotes = $poll->votes()->where('user_id', $request->user()->id);

        abort_if(
            ! $poll->allow_vote_change && $existingVotes->exists(),
            403,
            "Vous avez déjà voté et le sondage n'autorise pas le changement."
        );

        $existingVotes->delete();

        $poll->votes()->createMany(
            array_map(fn($id) => [
                'poll_option_id' => $id,
                'user_id'        => $request->user()->id,
            ], $selectedIds)
        );

        return response()->json(['message' => 'Vote enregistré avec succès.']);
    }

    private function resolveOptionIds(Poll $poll, array $validated): array
    {
        if ($poll->allow_multiple_choices) {
            return $validated['option_ids'] ?? [];
        }

        $id = $validated['option_id'] ?? ($validated['option_ids'][0] ?? null);
        abort_if(! $id, 422, 'Veuillez sélectionner une option.');

        return [$id];
    }

    private function validateOptionIds(Poll $poll, array $ids): void
    {
        abort_if(empty($ids), 422, 'Veuillez sélectionner au moins une option.');

        $validIds = $poll->options->pluck('id')->all();
        abort_if(! empty(array_diff($ids, $validIds)), 422, 'Option invalide pour ce sondage.');
    }
}
