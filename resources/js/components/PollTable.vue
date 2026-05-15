<script setup>
import { ref } from "vue";
import PollStatusBadge from "./PollStatusBadge.vue";

defineProps({
    polls: { type: Array, default: () => [] },
});

const emit = defineEmits(["edit", "delete", "launch"]);

const copiedPollId = ref(null);

// Utilise duration_minutes retourné par l'API plutôt que de recalculer
function formatDate(isoString) {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function totalVotes(poll) {
    return poll.options?.reduce((sum, o) => sum + (o.votes_count ?? 0), 0) ?? 0;
}

function topOption(poll) {
    if (!poll.options?.length) return null;
    const top = poll.options.reduce((max, o) =>
        (o.votes_count ?? 0) > (max.votes_count ?? 0) ? o : max,
    );
    return (top.votes_count ?? 0) > 0 ? top : null;
}

async function copyLink(poll) {
    const url = `${location.origin}/polls/${poll.secret_token}`;
    try {
        await navigator.clipboard.writeText(url);
        copiedPollId.value = poll.id;
        setTimeout(() => {
            if (copiedPollId.value === poll.id) copiedPollId.value = null;
        }, 2000);
    } catch {
        alert("Impossible de copier le lien.");
    }
}

const BTN =
    "flex-1 rounded px-4 py-2 text-center text-sm font-medium transition-colors";
const BTN_PRIMARY = BTN + " bg-blue-500 text-white hover:bg-blue-600";
const BTN_GREEN = BTN + " bg-green-500 text-white hover:bg-green-600";
const BTN_DANGER = BTN + " bg-red-500 text-white hover:bg-red-600";
const BTN_SECONDARY =
    BTN + " border border-gray-300 bg-white text-gray-700 hover:bg-gray-50";
</script>

<template>
    <div class="space-y-4">
        <div
            v-for="poll in polls"
            :key="poll.id"
            class="rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
        >
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <h3 class="font-semibold text-gray-900">
                        {{ poll.question }}
                    </h3>
                    <p v-if="poll.title" class="text-sm text-gray-600">
                        {{ poll.title }}
                    </p>
                </div>
                <PollStatusBadge :poll="poll" />
            </div>

            <div class="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                    <p class="text-gray-600">Total votes</p>
                    <p class="text-lg font-bold text-gray-900">
                        {{ totalVotes(poll) }}
                    </p>
                </div>
                <div>
                    <p class="text-gray-600">Options</p>
                    <p class="text-lg font-bold text-gray-900">
                        {{ poll.options?.length ?? 0 }}
                    </p>
                </div>
                <div>
                    <p class="text-gray-600">Fin</p>
                    <!-- computed_ends_at prend en compte la durée, ends_at est la date explicite -->
                    <p class="text-sm font-medium text-gray-900">
                        {{ formatDate(poll.computed_ends_at ?? poll.ends_at) }}
                    </p>
                </div>
            </div>

            <div v-if="topOption(poll)" class="mt-4 rounded-lg bg-blue-50 p-3">
                <p class="text-xs text-gray-600">Option la plus votée</p>
                <p class="font-medium text-gray-900">
                    {{ topOption(poll).label }}
                </p>
                <div class="mt-2 flex items-center gap-3">
                    <div
                        class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
                    >
                        <div
                            class="h-full rounded-full bg-blue-500 transition-all"
                            :style="{
                                width: `${(topOption(poll).votes_count / totalVotes(poll)) * 100}%`,
                            }"
                        />
                    </div>
                    <span class="text-sm font-semibold text-gray-900"
                        >{{ topOption(poll).votes_count }} votes</span
                    >
                </div>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                <a
                    :href="`/polls/${poll.secret_token}`"
                    target="_blank"
                    rel="noopener noreferrer"
                    :class="BTN_PRIMARY"
                >
                    Voir le sondage
                </a>
                <button
                    type="button"
                    @click="copyLink(poll)"
                    :class="BTN_SECONDARY"
                >
                    {{
                        copiedPollId === poll.id
                            ? "Lien copié !"
                            : "Copier le lien"
                    }}
                </button>
                <button
                    v-if="poll.is_draft"
                    type="button"
                    @click="emit('launch', poll)"
                    :class="BTN_GREEN"
                >
                    Lancer
                </button>
                <button
                    type="button"
                    @click="emit('edit', poll)"
                    :class="BTN_SECONDARY"
                >
                    Modifier
                </button>
                <button
                    type="button"
                    @click="emit('delete', poll)"
                    :class="BTN_DANGER"
                >
                    Supprimer
                </button>
            </div>
        </div>
    </div>
</template>
