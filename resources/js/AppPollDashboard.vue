<script setup>
import { ref } from "vue";
import PollSection from "./components/PollSection.vue";
import PollForm from "./components/PollForm.vue";
import { usePollDashboard } from "./composables/usePollDashboard";

const props = defineProps({
    loginUrl: { type: String, default: null },
});

const {
    polls,
    error,
    loading,
    mutationError,
    drafts,
    scheduled,
    active,
    ended,
    createPoll,
    updatePoll,
    deletePoll,
    launchPoll,
} = usePollDashboard(props.loginUrl);

const showForm = ref(false);
const editingPoll = ref(null);

function openEdit(poll = null) {
    editingPoll.value = poll;
    showForm.value = true;
}

async function savePoll(payload) {
    try {
        await (editingPoll.value
            ? updatePoll(editingPoll.value.id, payload)
            : createPoll(payload));
        showForm.value = false;
    } catch {
        // mutationError est affiché dans le template
    }
}

async function removePoll(poll) {
    if (!confirm("Supprimer ce sondage ?")) return;
    await deletePoll(poll.id);
}

async function launch(poll) {
    if (!confirm(`Lancer "${poll.question}" maintenant ?`)) return;
    await launchPoll(poll.id);
}
</script>

<template>
    <main class="min-h-screen bg-gray-50 p-6">
        <div class="mx-auto max-w-4xl">
            <div
                class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">
                        Mes sondages
                    </h1>
                    <p class="mt-2 text-gray-600">
                        Gérez et consultez vos sondages
                    </p>
                </div>
                <button
                    type="button"
                    @click="openEdit()"
                    class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Créer un sondage
                </button>
            </div>

            <PollForm
                v-if="showForm"
                :initial-data="editingPoll"
                @save="savePoll"
                @cancel="showForm = false"
            />

            <p
                v-if="mutationError"
                class="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 font-medium text-red-700"
            >
                {{ mutationError }}
            </p>

            <div
                v-if="loading && !polls"
                class="rounded-lg bg-white p-8 text-center"
            >
                <p class="text-gray-600">Chargement de vos sondages...</p>
            </div>

            <div
                v-else-if="error"
                class="rounded-lg border border-red-300 bg-red-50 p-4"
            >
                <p class="text-red-700">
                    Erreur lors du chargement des sondages.
                </p>
                <p v-if="error.data" class="mt-2 text-sm text-red-600">
                    {{ error.data.message }}
                </p>
            </div>

            <div
                v-else-if="!polls?.length"
                class="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center"
            >
                <p class="text-gray-500">
                    Aucun sondage pour le moment. Créez votre premier sondage !
                </p>
            </div>

            <div v-else class="space-y-8">
                <PollSection
                    title="Brouillons"
                    :polls="drafts"
                    can-launch
                    @edit="openEdit"
                    @delete="removePoll"
                    @launch="launch"
                />
                <PollSection
                    title="Programmés"
                    :polls="scheduled"
                    @edit="openEdit"
                    @delete="removePoll"
                    @launch="launch"
                />
                <PollSection
                    title="Sondages actifs"
                    :polls="active"
                    @edit="openEdit"
                    @delete="removePoll"
                />
                <PollSection
                    title="Sondages terminés"
                    :polls="ended"
                    @edit="openEdit"
                    @delete="removePoll"
                />
            </div>
        </div>
    </main>
</template>
