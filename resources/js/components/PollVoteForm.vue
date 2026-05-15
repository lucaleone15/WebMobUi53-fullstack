<script setup>
defineProps({
    poll: { type: Object, required: true },
    selectedOptions: { type: Array, required: true },
});

const emit = defineEmits(["toggle", "submit"]);
</script>

<template>
    <div class="mb-8 space-y-4">
        <p class="mb-4 text-sm font-medium text-gray-600">
            {{
                poll.allow_multiple_choices
                    ? "Sélectionnez une ou plusieurs options"
                    : "Sélectionnez votre réponse"
            }}
        </p>

        <div
            v-for="option in poll.options"
            :key="option.id"
            @click="emit('toggle', option.id)"
            :class="[
                'relative flex cursor-pointer items-center rounded-xl border-2 p-5 transition-all',
                selectedOptions.includes(String(option.id))
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50',
            ]"
        >
            <input
                v-if="poll.allow_multiple_choices"
                type="checkbox"
                :value="String(option.id)"
                :checked="selectedOptions.includes(String(option.id))"
                class="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                @click.stop
            />
            <input
                v-else
                type="radio"
                :value="String(option.id)"
                :checked="selectedOptions.includes(String(option.id))"
                class="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                @click.stop
            />
            <span class="ml-4 text-lg font-medium text-gray-800">{{
                option.label
            }}</span>
        </div>

        <button
            @click="emit('submit')"
            :disabled="selectedOptions.length === 0"
            class="mt-8 w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
            Confirmer mon vote
        </button>
    </div>
</template>
