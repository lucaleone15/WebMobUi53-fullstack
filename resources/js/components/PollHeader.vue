<script setup>
defineProps({
    homeUrl: { type: String, default: null },
    closeTab: { type: Boolean, default: false },
});

function close() {
    window.close();
}
</script>

<template>
    <header class="border-b border-gray-200 bg-white px-6 py-3">
        <div class="mx-auto flex max-w-4xl items-center gap-4">
            <a
                v-if="homeUrl && !closeTab"
                :href="homeUrl"
                class="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                ← Accueil
            </a>
            <button
                v-if="closeTab"
                type="button"
                @click="close"
                class="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900"
            >
                ✕ Fermer
            </button>
        </div>
    </header>
</template>
