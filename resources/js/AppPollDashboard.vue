<script setup>
import { ref, computed } from "vue";
import PollTable from "./components/PollTable.vue";
import PollForm from "./components/PollForm.vue";
import { usePollDashboard } from "./composables/usePollDashboard";

const props = defineProps({
    polls: { type: Array, default: () => [] },
    loginUrl: { type: String, default: null },
});

const {
    pollsData,
    pollsError,
    pollsLoading,
    drafts,
    active,
    ended,
    createPoll,
    updatePoll,
    deletePoll,
} = usePollDashboard(props.loginUrl);

const showForm = ref(false);
const editingPoll = ref(null);

function openCreate() {
    editingPoll.value = null;
    showForm.value = true;
}

function openEdit(poll) {
    editingPoll.value = poll;
    showForm.value = true;
}

function closeForm() {
    showForm.value = false;
}

async function savePoll(payload) {
    if (editingPoll.value) {
        await updatePoll(editingPoll.value.id, payload);
    } else {
        await createPoll(payload);
    }

    closeForm();
}

async function removePoll(poll) {
    if (!confirm("Supprimer ce sondage ?")) return;
    await deletePoll(poll.id);
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
                    @click="openCreate"
                    class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Créer un sondage
                </button>
            </div>

            <PollForm
                v-if="showForm"
                :initialData="editingPoll"
                :editing="!!editingPoll"
                :onSave="savePoll"
                :onCancel="closeForm"
            />

            <div
                v-if="pollsLoading && !pollsData"
                class="rounded-lg bg-white p-8 text-center"
            >
                <p class="text-gray-600">Chargement de vos sondages...</p>
            </div>

            <div
                v-else-if="pollsError"
                class="rounded-lg border border-red-300 bg-red-50 p-4"
            >
                <p class="text-red-700">
                    Erreur lors du chargement des sondages
                </p>
                <p v-if="pollsError.data" class="mt-2 text-sm text-red-600">
                    {{ pollsError.data.message }}
                </p>
            </div>

            <div
                v-else-if="!pollsData || pollsData.length === 0"
                class="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center"
            >
                <p class="text-gray-500">
                    Aucun sondage pour le moment. Créez votre premier sondage !
                </p>
            </div>

            <div v-else class="space-y-8">
                <section v-if="drafts.length > 0">
                    <h2 class="mb-4 text-xl font-semibold text-gray-900">
                        Brouillons
                        <span class="text-gray-500">({{ drafts.length }})</span>
                    </h2>
                    <PollTable
                        :polls="drafts"
                        :onEdit="openEdit"
                        :onDelete="removePoll"
                    />
                </section>

                <section v-if="active.length > 0">
                    <h2 class="mb-4 text-xl font-semibold text-gray-900">
                        Sondages actifs
                        <span class="text-gray-500">({{ active.length }})</span>
                    </h2>
                    <PollTable
                        :polls="active"
                        :onEdit="openEdit"
                        :onDelete="removePoll"
                    />
                </section>

                <section v-if="ended.length > 0">
                    <h2 class="mb-4 text-xl font-semibold text-gray-900">
                        Sondages terminés
                        <span class="text-gray-500">({{ ended.length }})</span>
                    </h2>
                    <PollTable
                        :polls="ended"
                        :onEdit="openEdit"
                        :onDelete="removePoll"
                    />
                </section>
            </div>
        </div>
    </main>
</template>
