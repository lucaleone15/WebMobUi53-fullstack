import { ref, computed, onMounted } from 'vue';
import { useFetchApi } from './useFetchApi';
import { usePolling } from './usePolling';

export function usePollShow(token, loginUrl) {
    const { fetchApi } = useFetchApi();

    const poll = ref(null);
    const loading = ref(true);
    const error = ref(null);
    const hasVoted = ref(false);
    const selectedOptions = ref([]);

    // --- Computed ---

    const pollStartDate = computed(() =>
        poll.value?.started_at ? new Date(poll.value.started_at) : null,
    );

    const pollEndDate = computed(() =>
        poll.value?.computed_ends_at ? new Date(poll.value.computed_ends_at) : null,
    );

    const showVotingForm = computed(() => {
        if (!poll.value) return false;
        if (poll.value.is_draft) return false;
        if (!poll.value.has_started) return false;
        if (poll.value.has_ended) return false;
        if (hasVoted.value && !poll.value.allow_vote_change) return false;
        return true;
    });

    const canSeeResults = computed(() =>
        !!poll.value && (poll.value.results_public || hasVoted.value || poll.value.user_is_owner),
    );

    // --- Actions ---

    async function loadPoll() {
        error.value = null;
        try {
            const data = await fetchApi({ url: `polls/${token}` });
            poll.value = data;
            hasVoted.value = data.user_has_voted ?? false;

            if (hasVoted.value && data.user_vote_option_ids) {
                selectedOptions.value = data.user_vote_option_ids.map(String);
            }
        } catch (err) {
            error.value = 'Impossible de charger le sondage. Il est peut-être expiré ou inexistant.';
            console.error(err);
        } finally {
            loading.value = false;
        }
    }

    async function submitVote() {
        if (!selectedOptions.value.length) return;

        const payload = poll.value.allow_multiple_choices
            ? { option_ids: selectedOptions.value.map(Number) }
            : { option_id: Number(selectedOptions.value[0]) };

        try {
            await fetchApi({ url: `polls/${token}/vote`, method: 'POST', data: payload });
            hasVoted.value = true;
            await loadPoll();
        } catch (err) {
            if (err.status === 401 && loginUrl) {
                window.location.href = loginUrl;
            } else {
                alert(err.data?.message ?? "Erreur lors de l'enregistrement du vote.");
            }
        }
    }

    function toggleOption(optionId) {
        const key = String(optionId);

        if (poll.value.allow_multiple_choices) {
            const idx = selectedOptions.value.indexOf(key);
            idx > -1
                ? selectedOptions.value.splice(idx, 1)
                : selectedOptions.value.push(key);
        } else {
            selectedOptions.value = [key];
        }
    }

    onMounted(loadPoll);
    usePolling(loadPoll, 5000);

    return { poll, loading, error, hasVoted, selectedOptions, pollStartDate, pollEndDate, showVotingForm, canSeeResults, submitVote, toggleOption };
}
