<script setup>
import { usePollShow } from "./composables/usePollShow";
import PollHeader from "./components/PollHeader.vue";
import PollStatusBadge from "./components/PollStatusBadge.vue";
import PollStatusMessage from "./components/PollStatusMessage.vue";
import PollVoteForm from "./components/PollVoteForm.vue";
import PollResults from "./components/PollResults.vue";

const props = defineProps({
    token: { type: String, required: true },
    loginUrl: { type: String, default: null },
});

const {
    poll,
    loading,
    error,
    hasVoted,
    selectedOptions,
    pollStartDate,
    pollEndDate,
    showVotingForm,
    canSeeResults,
    submitVote,
    toggleOption,
} = usePollShow(props.token, props.loginUrl);
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <PollHeader close-tab />

        <div class="px-4 py-12">
            <div class="mx-auto max-w-2xl">
                <!-- LOADING -->
                <div
                    v-if="loading && !poll"
                    class="rounded-lg bg-white p-12 text-center shadow"
                >
                    <div
                        class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
                    />
                    <p class="mt-4 font-medium text-gray-600">
                        Chargement du sondage...
                    </p>
                </div>

                <!-- ERROR -->
                <div
                    v-else-if="error"
                    class="rounded-lg border border-red-200 bg-red-50 p-8 text-center shadow-sm"
                >
                    <p class="mb-4 text-2xl font-bold text-red-600">
                        Attention
                    </p>
                    <p class="text-lg font-bold text-red-800">{{ error }}</p>
                    <a
                        :href="homeUrl"
                        class="mt-6 inline-block rounded border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
                    >
                        Retour à l'accueil
                    </a>
                </div>

                <!-- POLL -->
                <div
                    v-else-if="poll"
                    class="overflow-hidden rounded-xl bg-white shadow-lg"
                >
                    <div class="p-8">
                        <div class="mb-4">
                            <PollStatusBadge :poll="poll" />
                        </div>

                        <h1 class="mb-2 text-3xl font-extrabold text-gray-900">
                            {{ poll.question }}
                        </h1>
                        <p v-if="poll.title" class="mb-8 italic text-gray-500">
                            {{ poll.title }}
                        </p>

                        <PollStatusMessage
                            :poll="poll"
                            :poll-start-date="pollStartDate"
                            class="mb-6"
                        />

                        <PollVoteForm
                            v-if="showVotingForm"
                            :poll="poll"
                            :selected-options="selectedOptions"
                            @toggle="toggleOption"
                            @submit="submitVote"
                        />

                        <PollResults
                            v-if="canSeeResults || poll.has_ended"
                            :poll="poll"
                            :has-voted="hasVoted"
                        />

                        <div
                            v-if="!canSeeResults && !poll.has_ended"
                            class="rounded-lg bg-gray-100 p-6 text-center"
                        >
                            <p class="font-medium text-gray-600">
                                Les résultats seront disponibles une fois que
                                vous aurez voté ou que le sondage sera terminé.
                            </p>
                            <a
                                v-if="loginUrl"
                                :href="loginUrl"
                                class="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            >
                                Se connecter pour voter
                            </a>
                        </div>
                    </div>

                    <div
                        class="flex flex-wrap justify-between gap-2 border-t border-gray-100 bg-gray-50 px-8 py-4 text-xs text-gray-400"
                    >
                        <span>Token : {{ token }}</span>
                        <span v-if="pollEndDate"
                            >Expire le :
                            {{ pollEndDate.toLocaleDateString("fr-FR") }}</span
                        >
                        <span
                            v-if="poll.user_is_owner"
                            class="font-semibold text-blue-600"
                            >Propriétaire du sondage</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
