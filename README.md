# event-front

Vue 3 single-page application for the Event ticketing platform. Handles event browsing, ticket selection, reservation countdown, and checkout.

---

## Stack

| | |
|---|---|
| Framework | Vue 3.5 (`<script setup>`) |
| Build tool | Vite 8 |
| State management | Pinia 3 |
| Routing | Vue Router 5 |
| HTTP | Native `fetch` (thin wrappers in `src/api/`) |
| Persistence | `sessionStorage` (reservation cart) |

No UI component library. No TypeScript. Minimal dependencies by design.

---

## Pages and Routing

```
/                    EventList   — grid of published events
/events/:slug        EventDetail — event info, ticket tier selector, reserve button
/checkout            Checkout    — order summary, countdown timer, order form
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Browser                           │
│                                                          │
│  ┌──────────┐   ┌─────────────────┐   ┌─────────────┐  │
│  │EventList │   │  EventDetail    │   │  Checkout   │  │
│  │          │   │                 │   │             │  │
│  │ fetches  │   │ fetches event + │   │ displays    │  │
│  │ event    │   │ live inventory  │   │ countdown   │  │
│  │ list     │   │ from API        │   │ places      │  │
│  └────┬─────┘   └────────┬────────┘   │ order       │  │
│       │                  │            └──────┬──────┘  │
│       │          reserve() call              │          │
│       │                  │            consume via       │
│       │                  ▼            POST /orders      │
│       │         ┌─────────────────┐          │          │
│       │         │ useReservation- │          │          │
│       │         │    Store        │          │          │
│       │         │  (Pinia)        │◄─────────┘          │
│       │         │                 │                     │
│       │         │ items[]         │                     │
│       │         │ expiresAt       │  persisted to       │
│       │         │ isActive        │  sessionStorage     │
│       │         └────────┬────────┘                     │
│       │                  │                              │
│       │         ┌────────▼────────┐                     │
│       │         │ useReservation  │                     │
│       │         │  (composable)   │                     │
│       │         │                 │                     │
│       │         │ countdown tick  │                     │
│       │         │ expiry handler  │                     │
│       │         └─────────────────┘                     │
│       │                                                 │
└───────┼─────────────────────────────────────────────────┘
        │ fetch()
        ▼
   event-back API  (http://localhost/api/v1/...)
```

---

## Setup

### Prerequisites

- Node.js ≥ 20

### Install and run

```bash
cd event-front
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend. Ensure the backend is running at `http://localhost` (Docker Compose).

### Build for production

```bash
npm run build    # output in dist/
npm run preview  # local preview of the built output
```

---

## Reservation State

### Pinia store — `src/stores/reservation.js`

The store holds the in-flight reservation cart and is the single source of truth for the checkout flow.

```
items[]       Array of { uuid, expiresAt, tierId, tierName, quantity, price, currency }
expiresAt     Computed: the soonest expiresAt across all items (drives the countdown)
isActive      Computed: hasReservation && expiresAt is in the future
```

State is persisted to `sessionStorage` under the key `event:reservation` on every mutation. On load, the store hydrates from `sessionStorage`, so a page reload does not lose the cart. `sessionStorage` is tab-scoped, so multiple tabs do not share carts.

### Composable — `src/composables/useReservation.js`

`useReservation()` mounts a 1-second interval that ticks down `secondsLeft` from the wall clock. It is used exclusively on the Checkout page.

**Lifecycle:**

| Event | Action |
|---|---|
| `onMounted`, `secondsLeft > 0` | Start `setInterval(tick, 1000)` |
| `onMounted`, `secondsLeft ≤ 0` and store has items | Call `handleExpiry()` immediately — stale data from a previous session |
| Every tick, `secondsLeft → 0` | Call `handleExpiry()` |
| `handleExpiry()` | Clear interval → clear store + sessionStorage → set `expired = true` → fire `DELETE /api/v1/reservations/{uuid}` for every held UUID (best-effort, `Promise.allSettled`) |
| `onUnmounted` | Clear interval; leave store intact |

The `onUnmounted` behaviour is intentional: if the user navigates away from `/checkout` mid-countdown (back button, accidental click), the hold is still live in `sessionStorage`. When they return, the composable remounts, recomputes `secondsLeft` from the original `expiresAt`, and resumes counting down from wherever it left off.

The backend's 10-minute Redis TTL is the authoritative expiry. The client-side `DELETE` calls on expiry are a best-effort optimisation — they return inventory sooner so other buyers see accurate counts immediately.

---

## Checkout Flow

1. User selects quantity on `EventDetail` and clicks **Reserve**.
2. `POST /api/v1/reservations` is called once per tier selected.
3. Returned `{ uuid, expiresAt }` values are saved to the Pinia store (and `sessionStorage`).
4. Router pushes to `/checkout`.
5. `Checkout.vue` mounts `useReservation()` — countdown starts.
6. User enters email and clicks **Place Order**.
7. `POST /api/v1/orders` is called once per reserved item, passing `{ reservationUuid, email }`.
   - `410 Gone` → reservation expired mid-checkout: clear store, show expiry message.
   - `201 Created` → collect `orderNumber`, continue.
8. On all orders confirmed: clear store, display confirmation with order numbers.

---

## API Layer

`src/api/` contains thin `fetch` wrappers — no external HTTP library.

```
src/api/
├── events.js        getEvents(), getEvent(slug)
└── reservations.js  createReservation(tierId, qty), releaseReservation(uuid)
```

Order creation is called directly from `Checkout.vue` using `fetch` to avoid coupling the API module to the order flow.

---

## Project Structure

```
src/
├── api/
│   ├── events.js
│   └── reservations.js
├── composables/
│   └── useReservation.js   # countdown, expiry handling
├── stores/
│   └── reservation.js      # Pinia store + sessionStorage sync
├── views/
│   ├── EventList.vue
│   ├── EventDetail.vue
│   └── Checkout.vue
├── router/
│   └── index.js
└── App.vue
```
