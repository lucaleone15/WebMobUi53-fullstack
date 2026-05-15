<script setup>
defineProps({
    poll: { type: Object, required: true },
    hasVoted: { type: Boolean, default: false },
});
</script>

<template>
    <div class="space-y-6">
        <!-- Confirmation messages -->
        <div
            v-if="hasVoted && poll.allow_vote_change"
            class="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center font-semibold text-blue-700"
        >
            Votre vote a été enregistré. Vous pouvez le modifier ci-dessous.
        </div>
        <div
            v-else-if="hasVoted"
            class="rounded-lg border border-green-200 bg-green-50 p-4 text-center font-semibold text-green-700"
        >
            Merci, votre vote a bien été pris en compte.
        </div>

        <!-- Chart -->
        <div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div class="mb-4 flex items-center justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-gray-900">
                        Aperçu graphique des résultats
                    </h2>
                    <p class="text-sm text-gray-500">
                        Mise à jour automatiquement toutes les 5 secondes.
                    </p>
                </div>
                <span class="text-sm font-medium text-gray-600"
                    >{{ poll.total_votes }} votes</span
                >
            </div>

            <div class="space-y-4">
                <div
                    v-for="option in poll.options"
                    :key="option.id"
                    class="space-y-2"
                >
                    <div
                        class="flex items-center justify-between text-sm font-semibold text-gray-700"
                    >
                        <span>{{ option.label }}</span>
                        <span>{{ option.votes_count }} voix</span>
                    </div>
                    <div
                        class="h-4 w-full overflow-hidden rounded-full bg-gray-200"
                    >
                        <div
                            class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000"
                            :style="{
                                width:
                                    poll.total_votes > 0
                                        ? `${(option.votes_count / poll.total_votes) * 100}%`
                                        : '0%',
                            }"
                        />
                    </div>
                </div>
            </div>
        </div>

        <p class="pt-4 text-center text-sm text-gray-400">
            Total : {{ poll.total_votes }} votes exprimés
        </p>
    </div>
</template>
