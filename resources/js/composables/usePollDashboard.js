import { computed, watch } from 'vue';
import { useFetchApi } from './useFetchApi';

export function usePollDashboard(loginUrl) {
    const { fetchApiToRef, fetchApi } = useFetchApi();

    const { data: polls, error, loading, fetchNow } = fetchApiToRef({ url: 'polls' });

    const drafts = computed(() => (polls.value ?? []).filter(p => p.is_draft));
    const scheduled = computed(() => (polls.value ?? []).filter(p => !p.is_draft && !p.has_started && !p.has_ended));
    const active = computed(() => (polls.value ?? []).filter(p => !p.is_draft && p.has_started && !p.has_ended));
    const ended = computed(() => (polls.value ?? []).filter(p => p.has_ended));

    watch(error, (err) => {
        if (!err) return;
        if (err?.status === 401 && loginUrl) window.location.href = loginUrl;
        else console.error(err);
    });

    async function createPoll(payload) {
        await fetchApi({ url: 'polls', method: 'POST', data: payload });
        fetchNow();
    }

    async function updatePoll(id, payload) {
        await fetchApi({ url: `polls/${id}`, method: 'PUT', data: payload });
        fetchNow();
    }

    async function deletePoll(id) {
        await fetchApi({ url: `polls/${id}`, method: 'DELETE' });
        fetchNow();
    }

    async function launchPoll(id) {
        await fetchApi({ url: `polls/${id}/launch`, method: 'POST' });
        fetchNow();
    }

    return { polls, error, loading, drafts, scheduled, active, ended, fetchNow, createPoll, updatePoll, deletePoll, launchPoll };
}
