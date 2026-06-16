const BASE = '/api/v1';
export class ReservationExpiredError extends Error {
    constructor() {
        super('Your reservation has expired. Please try again.');
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'RESERVATION_EXPIRED'
        });
    }
}
export async function createReservation(tierId, quantity) {
    const res = await fetch(`${BASE}/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tierId, quantity }),
    });
    if (res.status === 409) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ??
            'Sorry, those tickets just sold out. Try selecting fewer or check back later.');
    }
    if (!res.ok)
        throw new Error(`Reservation failed (${res.status})`);
    return res.json();
}
export async function releaseReservation(uuid) {
    try {
        await fetch(`${BASE}/reservations/${encodeURIComponent(uuid)}`, { method: 'DELETE' });
    }
    catch {
        // Best-effort; backend TTL cleans up regardless
    }
}
export async function placeOrder(reservationUuid, email) {
    const res = await fetch(`${BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationUuid, email }),
    });
    if (res.status === 410)
        throw new ReservationExpiredError();
    if (!res.ok)
        throw new Error(`Order failed (${res.status})`);
    return res.json();
}
