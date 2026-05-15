<script setup>
import { ref, watch } from "vue";
import PollOptionsManager from "./PollOptionsManager.vue";
import { toDatetimeLocal, toBoolean, toIsoLocal } from "../utils/dateUtils.js";

const props = defineProps({
    initialData: { type: Object, default: null },
});

const emit = defineEmits(["save", "cancel"]);

function buildForm(data) {
    return {
        title: data?.title ?? "",
        question: data?.question ?? "",
        options: (data?.options ?? []).map((o) => ({ label: o.label })),
        is_draft: toBoolean(data?.is_draft, true),
        allow_multiple_choices: toBoolean(data?.allow_multiple_choices),
        allow_vote_change: toBoolean(data?.allow_vote_change),
        results_public: toBoolean(data?.results_public),
        started_at: toDatetimeLocal(data?.started_at),
        ends_at: toDatetimeLocal(data?.ends_at),
    };
}

const form = ref(buildForm(props.initialData));
const errors = ref({});

watch(
    () => props.initialData,
    (data) => {
        form.value = buildForm(data);
        errors.value = {};
    },
    { immediate: true, deep: true },
);

function validate() {
    const e = {};

    if (!form.value.question?.trim()) e.question = "La question est requise.";

    if (!form.value.options.length)
        e.options = "Au moins une option est requise.";
    else if (form.value.options.some((o) => !o.label?.trim()))
        e.options = "Toutes les options doivent avoir un libellé.";

    errors.value = e;
    return !Object.keys(e).length;
}

function submit() {
    if (!validate()) return;

    emit("save", {
        ...form.value,
        started_at: toIsoLocal(form.value.started_at),
        ends_at: toIsoLocal(form.value.ends_at),
    });
}

const FIELD_CLASS =
    "w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none";

const checkboxes = {
    allow_multiple_choices: {
        label: "Réponses multiples",
        desc: "Plusieurs choix autorisés",
    },
    allow_vote_change: {
        label: "Modifier son vote",
        desc: "Les participants peuvent changer leur réponse",
    },
    results_public: { label: "Résultats publics", desc: "Visibles par tous" },
    is_draft: { label: "Brouillon", desc: "Ne pas publier maintenant" },
};
</script>

<template>
    <div class="mb-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">
            {{
                initialData ? "Modifier le sondage" : "Créer un nouveau sondage"
            }}
        </h2>

        <form @submit.prevent="submit" class="space-y-6">
            <section class="space-y-4 border-b border-gray-200 pb-6">
                <h3 class="font-semibold text-gray-900">Question et options</h3>

                <label class="block">
                    <span class="text-sm font-medium text-gray-700"
                        >Question *</span
                    >
                    <textarea
                        v-model="form.question"
                        rows="2"
                        placeholder="Posez votre question..."
                        :class="FIELD_CLASS + ' mt-2'"
                    />
                    <p v-if="errors.question" class="mt-1 text-sm text-red-600">
                        {{ errors.question }}
                    </p>
                </label>

                <div>
                    <PollOptionsManager v-model="form.options" />
                    <p v-if="errors.options" class="mt-1 text-sm text-red-600">
                        {{ errors.options }}
                    </p>
                </div>
            </section>

            <section class="space-y-4 border-b border-gray-200 pb-6">
                <h3 class="font-semibold text-gray-900">Paramètres</h3>

                <label class="block">
                    <span class="text-sm font-medium text-gray-700"
                        >Titre (optionnel)</span
                    >
                    <input
                        v-model="form.title"
                        type="text"
                        placeholder="Titre du sondage..."
                        :class="FIELD_CLASS + ' mt-2'"
                    />
                </label>

                <div class="grid gap-4 sm:grid-cols-2">
                    <label class="block">
                        <span class="text-sm font-medium text-gray-700"
                            >Début</span
                        >
                        <input
                            v-model="form.started_at"
                            type="datetime-local"
                            :class="FIELD_CLASS + ' mt-2'"
                        />
                        <p class="mt-1 text-xs text-gray-400">
                            Laisser vide pour démarrer immédiatement
                        </p>
                    </label>
                    <label class="block">
                        <span class="text-sm font-medium text-gray-700"
                            >Fin</span
                        >
                        <input
                            v-model="form.ends_at"
                            type="datetime-local"
                            :class="FIELD_CLASS + ' mt-2'"
                        />
                        <p class="mt-1 text-xs text-gray-400">
                            Laisser vide pour une durée illimitée
                        </p>
                    </label>
                </div>
            </section>

            <section class="space-y-3">
                <h3 class="font-semibold text-gray-900">Comportement</h3>

                <label
                    v-for="(item, key) in checkboxes"
                    :key="key"
                    class="flex cursor-pointer items-center gap-3"
                >
                    <input
                        v-model="form[key]"
                        type="checkbox"
                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-sm text-gray-700">
                        <span class="font-medium">{{ item.label }}</span>
                        <span class="ml-2 text-gray-500">{{ item.desc }}</span>
                    </span>
                </label>
            </section>

            <div class="flex gap-3 border-t border-gray-200 pt-6">
                <button
                    type="submit"
                    class="rounded bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                >
                    {{
                        initialData
                            ? "Enregistrer les modifications"
                            : "Créer le sondage"
                    }}
                </button>
                <button
                    type="button"
                    @click="emit('cancel')"
                    class="rounded border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    Annuler
                </button>
            </div>
        </form>
    </div>
</template>
