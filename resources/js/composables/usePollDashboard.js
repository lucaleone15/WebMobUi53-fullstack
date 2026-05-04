import { ref, computed, watch } from 'vue';
import { useFetchApi } from './useFetchApi';
import { usePolling } from './usePolling';

export function usePollDashboard(loginUrl) {
    const { fetchApiToRef, fetchApi } = useFetchApi();

    const {
        data: pollsData,
        error: pollsError,
        loading: pollsLoading,
        fetchNow,
    } = fetchApiToRef({ url: 'polls' });

    const drafts = computed(() =>
        (pollsData.value || []).filter((poll) => poll.is_draft),
    );

    const active = computed(() =>
        (pollsData.value || []).filter(
            (poll) =>
                !poll.is_draft &&
                poll.started_at &&
                (!poll.ends_at || new Date(poll.ends_at) > new Date()),
        ),
    );

    const ended = computed(() =>
        (pollsData.value || []).filter(
            (poll) => poll.ends_at && new Date(poll.ends_at) <= new Date(),
        ),
    );

    function handleError(err) {
        if (!err) return;
        if (err?.status === 401 && loginUrl) {
            window.location.href = loginUrl;
        } else {
            console.error(err);
        }
    }

    watch(pollsError, handleError);
    usePolling(fetchNow, 10000);

    async function createPoll(payload) {
        await fetchApi({ url: 'polls', method: 'POST', data: payload });
        await fetchNow();
    }

    async function updatePoll(id, payload) {
        await fetchApi({ url: `polls/${id}`, method: 'PUT', data: payload });
        await fetchNow();
    }

    async function deletePoll(id) {
        await fetchApi({ url: `polls/${id}`, method: 'DELETE' });
        await fetchNow();
    }

    return {
        pollsData,
        pollsError,
        pollsLoading,
        drafts,
        active,
        ended,
        fetchNow,
        createPoll,
        updatePoll,
        deletePoll,
    };
}
