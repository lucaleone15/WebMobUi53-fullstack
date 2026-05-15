<script setup>
import { ref, watch } from "vue";

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue"]);

const options = ref([]);
const newOption = ref("");

// Sync depuis le parent uniquement si le contenu change vraiment
watch(
    () => props.modelValue,
    (value) => {
        if (JSON.stringify(value) !== JSON.stringify(options.value)) {
            options.value = Array.isArray(value) ? [...value] : [];
        }
    },
    { immediate: true },
);

// Émet vers le parent à chaque mutation locale
watch(options, (value) => emit("update:modelValue", value), { deep: true });

function addOption() {
    const label = newOption.value.trim();
    if (!label || options.value.some((o) => o.label === label)) return;
    options.value.push({ label });
    newOption.value = "";
}

function removeOption(index) {
    options.value.splice(index, 1);
}

function updateOption(index, label) {
    options.value[index].label = label;
}
</script>

<template>
    <div class="rounded border border-gray-300 bg-gray-50 p-4">
        <label class="text-sm font-medium text-gray-700"
            >Options de réponse *</label
        >

        <div v-if="options.length" class="mt-3 space-y-2">
            <div
                v-for="(option, index) in options"
                :key="index"
                class="flex items-center gap-2 rounded border border-gray-200 bg-white p-3"
            >
                <span class="flex-shrink-0 text-sm font-medium text-gray-500"
                    >{{ index + 1 }}.</span
                >
                <input
                    :value="option.label"
                    @input="updateOption(index, $event.target.value)"
                    type="text"
                    class="flex-1 rounded border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                    type="button"
                    @click="removeOption(index)"
                    title="Supprimer cette option"
                    class="flex-shrink-0 rounded px-2 py-1 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                    ✕
                </button>
            </div>
        </div>

        <div class="mt-3 flex gap-2">
            <input
                v-model="newOption"
                @keydown.enter.prevent="addOption"
                type="text"
                placeholder="Ajouter une nouvelle option..."
                class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
                type="button"
                @click="addOption"
                class="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
                Ajouter
            </button>
        </div>

        <p class="mt-2 text-xs text-gray-500">
            {{ options.length }}
            {{ options.length === 1 ? "option" : "options" }}
        </p>
    </div>
</template>
