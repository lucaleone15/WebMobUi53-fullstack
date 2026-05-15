<script setup>
defineProps({
    poll: { type: Object, required: true },
    pollStartDate: { type: Date, default: null },
});
</script>

<template>
    <div class="space-y-4">
        <div
            v-if="poll.is_draft"
            class="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
        >
            <p class="text-sm font-medium text-yellow-800">
                Ce sondage n'a pas encore été publié.
            </p>
        </div>

        <div
            v-if="!poll.has_started && !poll.is_draft"
            class="rounded-lg border border-blue-200 bg-blue-50 p-4"
        >
            <p class="text-sm font-medium text-blue-800">
                Ce sondage commencera le
                {{
                    pollStartDate
                        ? pollStartDate.toLocaleDateString("fr-FR")
                        : "prochainement"
                }}
            </p>
        </div>

        <div
            v-if="poll.has_ended"
            class="rounded-lg border border-gray-300 bg-gray-100 p-4"
        >
            <p class="text-sm font-medium text-gray-800">
                Ce sondage est maintenant terminé.
            </p>
        </div>
    </div>
</template>
