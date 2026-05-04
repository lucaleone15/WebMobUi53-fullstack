<script setup>
import { usePolls } from "../composables/usePolls";

const { formatDate, getTotalVotes, getTopOption, getStatusBadge } = usePolls();

const props = defineProps({
    polls: { type: Array, default: () => [] },
    onEdit: Function,
    onDelete: Function,
});
</script>

<template>
    <div>
        <p v-if="polls.length === 0" class="text-gray-600">
            Aucun sondage pour le moment.
        </p>

        <div v-else class="space-y-4">
            <div
                v-for="poll in polls"
                :key="poll.id"
                class="rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md transition-shadow"
            >
                <!-- Header -->
                <div class="flex items-start justify-between gap-4">
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-900">
                            {{ poll.question }}
                        </h3>
                        <p v-if="poll.title" class="text-sm text-gray-600">
                            {{ poll.title }}
                        </p>
                    </div>
                    <span
                        :class="`inline-block rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusBadge(poll).class}`"
                    >
                        {{ getStatusBadge(poll).text }}
                    </span>
                </div>

                <!-- Stats Row -->
                <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
                    <div>
                        <p class="text-gray-600">Total votes</p>
                        <p class="text-lg font-bold text-gray-900">
                            {{ getTotalVotes(poll) }}
                        </p>
                    </div>
                    <div>
                        <p class="text-gray-600">Options</p>
                        <p class="text-lg font-bold text-gray-900">
                            {{ poll.options?.length || 0 }}
                        </p>
                    </div>
                    <div>
                        <p class="text-gray-600">Fin</p>
                        <p class="text-sm font-medium text-gray-900">
                            {{ formatDate(poll.ends_at) }}
                        </p>
                    </div>
                </div>

                <!-- Top Option -->
                <div
                    v-if="getTopOption(poll)"
                    class="mt-4 rounded-lg bg-blue-50 p-3"
                >
                    <p class="text-xs text-gray-600">Option la plus votée</p>
                    <p class="font-medium text-gray-900">
                        {{ getTopOption(poll).text }}
                    </p>
                    <div class="mt-2 flex items-center justify-between">
                        <div class="h-2 flex-1 rounded-full bg-gray-200">
                            <div
                                class="h-2 rounded-full bg-blue-500"
                                :style="{
                                    width:
                                        getTotalVotes(poll) > 0
                                            ? ((getTopOption(poll)
                                                  .votes_count || 0) /
                                                  getTotalVotes(poll)) *
                                                  100 +
                                              '%'
                                            : '0%',
                                }"
                            ></div>
                        </div>
                        <span class="ml-3 text-sm font-semibold text-gray-900">
                            {{ getTopOption(poll).votes_count || 0 }} votes
                        </span>
                    </div>
                </div>

                <!-- Actions -->
                <div class="mt-4 flex gap-2">
                    <a
                        :href="`/polls/${poll.secret_token}`"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex-1 rounded bg-blue-500 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-600"
                    >
                        Voir le sondage
                    </a>
                    <button
                        type="button"
                        @click="onEdit && onEdit(poll)"
                        class="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Modifier
                    </button>
                    <button
                        type="button"
                        @click="onDelete && onDelete(poll)"
                        class="flex-1 rounded bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
