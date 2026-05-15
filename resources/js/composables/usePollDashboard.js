import { ref, computed, watch } from 'vue';
import { useFetchApi } from './useFetchApi';
import { usePolling } from './usePolling';

export function usePollDashboard(loginUrl) {
    const { fetchApiToRef, fetchApi } = useFetchApi();

    const { data: polls, error, loading, fetchNow } = fetchApiToRef({ url: 'polls' });

    // Utilise les champs calculés par le backend pour éviter toute divergence
    const drafts = computed(() => (polls.value ?? []).filter(p => p.is_draft));
    const scheduled = computed(() => (polls.value ?? []).filter(p => !p.is_draft && !p.has_started && !p.has_ended));
    const active = computed(() => (polls.value ?? []).filter(p => !p.is_draft && p.has_started && !p.has_ended));
    const ended = computed(() => (polls.value ?? []).filter(p => p.has_ended));

    watch(error, (err) => {
        if (!err) return;
        if (err?.status === 401 && loginUrl) window.location.href = loginUrl;
        else console.error(err);
    });

    const mutationError = ref(null);
    const isMutating = ref(false);

    usePolling(() => { if (!isMutating.value) fetchNow(); }, 10000);

    async function mutate(request, fallbackMessage) {
        mutationError.value = null;
        isMutating.value = true;
        try {
            await request();
            await fetchApi({ url: 'polls' }).then(res => { polls.value = res; });
        } catch (err) {
            mutationError.value = err?.data?.message ?? fallbackMessage;
            throw err;
        } finally {
            isMutating.value = false;
        }
    }

    const createPoll = (payload) =>
        mutate(() => fetchApi({ url: 'polls', method: 'POST', data: payload }), 'Erreur lors de la création.');

    const updatePoll = (id, payload) =>
        mutate(() => fetchApi({ url: `polls/${id}`, method: 'PUT', data: payload }), 'Erreur lors de la mise à jour.');

    const deletePoll = (id) =>
        mutate(() => fetchApi({ url: `polls/${id}`, method: 'DELETE' }), 'Erreur lors de la suppression.');

    const launchPoll = (id) =>
        mutate(() => fetchApi({ url: `polls/${id}/launch`, method: 'POST' }), 'Erreur lors du lancement.');

    return { polls, error, loading, mutationError, drafts, scheduled, active, ended, fetchNow, createPoll, updatePoll, deletePoll, launchPoll };
}
