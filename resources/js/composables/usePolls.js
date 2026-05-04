export function usePolls() {
    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTotalVotes = (poll) => {
        if (!poll.options) return 0;
        return poll.options.reduce((sum, option) => sum + (option.votes_count || 0), 0);
    };

    const getTopOption = (poll) => {
        if (!poll.options || poll.options.length === 0) return null;
        return poll.options.reduce((max, option) =>
            (option.votes_count || 0) > (max.votes_count || 0) ? option : max
        );
    };

    const getStatusBadge = (poll) => {
        if (poll.is_draft) return { text: 'Brouillon', class: 'bg-gray-100 text-gray-800' };
        if (poll.ends_at && new Date(poll.ends_at) <= new Date()) return { text: 'Terminé', class: 'bg-gray-100 text-gray-800' };
        if (poll.started_at && new Date(poll.started_at) > new Date()) return { text: 'Programmé', class: 'bg-blue-100 text-blue-800' };
        if (poll.started_at && (!poll.ends_at || new Date(poll.ends_at) > new Date())) return { text: 'Actif', class: 'bg-green-100 text-green-800' };
        return { text: 'Inconnu', class: 'bg-gray-100 text-gray-800' };
    };

    return { formatDate, getTotalVotes, getTopOption, getStatusBadge };
}
