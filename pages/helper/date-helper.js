export function formatDeadline(d) {
    if (!d) return '—';
    const s = String(d);
    const m = s.match(/^Date\(\s*(\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\s*\)$/i);
    if (m) {
        const year = m[1];
        {/* Hard fix month by +1 because wrong data came from the API*/ }
        const month = String(parseInt(m[2]) + 1).padStart(2, '0');
        // const month = String(parseInt(m[2])).padStart(2, '0');
        const day = String(m[3]).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const parsed = new Date(s);
    if (!isNaN(parsed)) {
        const y = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${mm}-${dd}`;
    }
    return s;
}