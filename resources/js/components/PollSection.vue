<script setup>
import PollTable from "./PollTable.vue";

defineProps({
    title: { type: String, required: true },
    polls: { type: Array, required: true },
    canLaunch: { type: Boolean, default: false },
});

const emit = defineEmits(["edit", "delete", "launch"]);
</script>

<template>
    <section v-if="polls.length">
        <h2 class="mb-4 text-xl font-semibold text-gray-900">
            {{ title }}
            <span class="text-gray-500">({{ polls.length }})</span>
        </h2>
        <PollTable
            :polls="polls"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
            @launch="canLaunch && emit('launch', $event)"
        />
    </section>
</template>
