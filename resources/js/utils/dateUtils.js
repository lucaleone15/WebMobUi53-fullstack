/**
 * Parse une valeur date vers un objet Date, ou null si invalide.
 */
export function parseDate(value) {
    if (!value) return null;
    const date = new Date(typeof value === 'string' ? value.replace(' ', 'T') : value);
    return isNaN(date) ? null : date;
}

/**
 * Convertit une date ISO vers le format attendu par <input type="datetime-local">.
 * Utilise l'heure locale — cohérent avec APP_TIMEZONE=Europe/Zurich côté serveur.
 */
export function toDatetimeLocal(value) {
    const date = parseDate(value);
    if (!date) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Convertit une valeur "datetime-local" (YYYY-MM-DDTHH:MM) en string ISO
 * sans conversion UTC — le serveur reçoit l'heure telle quelle et l'interprète
 * dans sa propre timezone (Europe/Zurich).
 *
 * On n'utilise PAS toISOString() qui convertirait en UTC et décalerait de 2h.
 */
export function toIsoLocal(value) {
    if (!value) return null;
    // "2026-05-05T14:00" → "2026-05-05T14:00:00" — pas de Z, pas d'offset
    return value.length === 16 ? value + ':00' : value;
}

/**
 * Interprète une valeur comme booléen, avec une valeur par défaut.
 */
export function toBoolean(value, fallback = false) {
    if (value == null) return fallback;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
    return Boolean(value);
}
