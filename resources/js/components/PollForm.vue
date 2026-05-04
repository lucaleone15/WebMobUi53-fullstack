<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    initialData: { type: Object, default: null },
    editing: { type: Boolean, default: false },
    onSave: Function,
    onCancel: Function,
});

const form = ref({
    title: "",
    question: "",
    is_draft: true,
    allow_multiple_choices: false,
    allow_vote_change: false,
    results_public: false,
    duration: null,
    started_at: "",
    ends_at: "",
});

function createFormData(data) {
    return {
        title: data?.title ?? "",
        question: data?.question ?? "",
        is_draft: data?.is_draft ?? true,
        allow_multiple_choices: data?.allow_multiple_choices ?? false,
        allow_vote_change: data?.allow_vote_change ?? false,
        results_public: data?.results_public ?? false,
        duration: data?.duration ?? null,
        started_at: data?.started_at ?? "",
        ends_at: data?.ends_at ?? "",
    };
}

watch(
    () => props.initialData,
    (next) => {
        form.value = createFormData(next);
    },
    { immediate: true, deep: true },
);

function submit() {
    props.onSave?.({ ...form.value });
}

function cancel() {
    props.onCancel?.();
}
</script>

<template>
    <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-semibold text-gray-900">
            {{ editing ? "Modifier le sondage" : "Nouveau sondage" }}
        </h2>

        <div class="grid gap-4">
            <label class="block">
                <span class="text-sm font-medium text-gray-700">Question</span>
                <input
                    v-model="form.question"
                    type="text"
                    class="mt-1 w-full rounded border px-3 py-2"
                />
            </label>

            <label class="block">
                <span class="text-sm font-medium text-gray-700">Titre</span>
                <input
                    v-model="form.title"
                    type="text"
                    class="mt-1 w-full rounded border px-3 py-2"
                />
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
                <label class="block">
                    <span class="text-sm font-medium text-gray-700">Début</span>
                    <input
                        v-model="form.started_at"
                        type="datetime-local"
                        class="mt-1 w-full rounded border px-3 py-2"
                    />
                </label>

                <label class="block">
                    <span class="text-sm font-medium text-gray-700">Fin</span>
                    <input
                        v-model="form.ends_at"
                        type="datetime-local"
                        class="mt-1 w-full rounded border px-3 py-2"
                    />
                </label>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
                <label class="inline-flex items-center gap-2">
                    <input v-model="form.is_draft" type="checkbox" />
                    <span class="text-sm text-gray-700">Brouillon</span>
                </label>

                <label class="inline-flex items-center gap-2">
                    <input v-model="form.results_public" type="checkbox" />
                    <span class="text-sm text-gray-700">Résultats publics</span>
                </label>
            </div>
        </div>

        <div class="mt-6 flex gap-3">
            <button
                type="button"
                @click="submit"
                class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
                {{ editing ? "Enregistrer" : "Créer" }}
            </button>
            <button
                type="button"
                @click="cancel"
                class="rounded border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
                Annuler
            </button>
        </div>
    </div>
</template>
