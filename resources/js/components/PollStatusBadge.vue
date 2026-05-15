<script setup>
defineProps({
    poll: { type: Object, required: true },
});
</script>

<template>
    <span
        :class="[
            'inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium',
            poll.is_draft
                ? 'bg-gray-100 text-gray-800'
                : poll.has_ended
                  ? 'bg-gray-100 text-gray-800'
                  : !poll.has_started
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800',
        ]"
    >
        {{
            poll.is_draft
                ? "Brouillon"
                : poll.has_ended
                  ? "Terminé"
                  : !poll.has_started
                    ? "Programmé"
                    : "Actif"
        }}
    </span>
</template>
