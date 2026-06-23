# event-front

Vue 3 single-page application for the Event ticketing platform. Handles event browsing, ticket selection, reservation countdown, and checkout.

---

## Stack

| | |
|---|---|
| Framework | Vue 3.5 (`<script setup>`) |
| Build tool | Vite 8 |
| Language | TypeScript |
| State management | Pinia 3 |
| Routing | Vue Router 5 |
| HTTP | Native `fetch` (thin wrappers in `src/api/`) |
| Persistence | `sessionStorage` (reservation cart, admin key) |

No UI component library. Minimal dependencies by design.

---

## Pages and Routing

```
/                    EventList        — grid of published events
/events/:slug        EventDetail      — event info, ticket tier selector, reserve button
/checkout            Checkout         — order summary, countdown timer, order form
/my-tickets          MyTickets        — buyer order lookup by order number + email

/admin/login         AdminLogin       — staff API-key gate
/admin/orders        AdminOrders      — paginated order list with status filter
/admin/orders/:id    AdminOrderDetail — order detail + cancel action
/admin/inventory     AdminInventory   — live inventory table with utilization bar per tier
```

The `/admin` prefix is protected by a `beforeEnter` navigation guard that redirects to `/admin/login` when no key is held in the `admin` Pinia store.

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
├── events.ts        getEvents(), getEvent(slug)
├── reservations.ts  createReservation(tierId, qty), releaseReservation(uuid)
├── orders.ts        fetchOrder(orderNumber, email) — buyer ticket lookup; throws OrderNotFoundError on 404
└── admin.ts         fetchAdminOrders(), fetchAdminOrder(), cancelAdminOrder(), fetchInventory()
                     All functions accept the admin key as first argument and attach it as X-Admin-Key.
                     Throws AdminAuthError on 401 so callers can redirect to /admin/login.
```

`src/types.ts` contains all shared TypeScript interfaces (`Event`, `Tier`, `ReservationItem`, `OrderDetail`, `AdminOrder`, `AdminOrderDetail`, `InventoryTier`, `PaginatedResponse<T>`).

---

## Admin Panel

The admin section lives under `/admin` and is guarded by a session-scoped API key stored in the `admin` Pinia store (`src/stores/admin.ts`). The key is persisted to `sessionStorage` under `admin:key` so it survives page refreshes but is automatically cleared when the tab closes.

**Login flow:** `AdminLogin.vue` validates the key by attempting a real API call (`GET /admin/orders`). If the backend returns `401`, the `AdminAuthError` is shown inline. On success the key is saved and the router navigates to `AdminOrders`.

**Session expiry:** Every admin API call wraps the response through a shared `handleResponse<T>` helper. A `401` at any point clears the store and redirects back to `/admin/login`.

### Admin views

| View | Route | Description |
|---|---|---|
| `AdminOrders` | `/admin/orders` | Paginated order table with status filter (all/confirmed/cancelled/pending/expired). Clicking a row navigates to the detail view. |
| `AdminOrderDetail` | `/admin/orders/:orderNumber` | Full order card with cancel button. Cancel disables the button and shows inline feedback. |
| `AdminInventory` | `/admin/inventory` | Per-tier table showing quota, sold, available, and a colour-coded utilisation bar (green < 60%, amber 60–90%, red ≥ 90%). Manual Refresh button re-fetches live Redis counters. |

---

## My Tickets

`MyTickets.vue` (`/my-tickets`) is a buyer self-service lookup page. Users enter their order number and the email used at checkout. The form calls `GET /api/v1/orders/{orderNumber}?email=…`. The backend returns the order only when the email matches — preventing order number enumeration.

Three states are rendered: `form` (initial), `not-found` (404 response), and `result` (order detail card with event date, venue, tier, quantity, total, and status).

---

## Project Structure

```
src/
├── api/
│   ├── events.ts
│   ├── reservations.ts
│   ├── orders.ts            # buyer order lookup
│   └── admin.ts             # staff endpoints + AdminAuthError
├── composables/
│   └── useReservation.ts    # countdown, expiry handling
├── stores/
│   ├── reservation.ts       # Pinia store + sessionStorage sync
│   └── admin.ts             # admin key store + sessionStorage sync
├── views/
│   ├── EventList.vue
│   ├── EventDetail.vue
│   ├── Checkout.vue
│   ├── MyTickets.vue
│   └── admin/
│       ├── AdminLayout.vue
│       ├── AdminLogin.vue
│       ├── AdminOrders.vue
│       ├── AdminOrderDetail.vue
│       └── AdminInventory.vue
├── components/
│   ├── Header.vue
│   └── EventCard.vue
├── router/
│   └── index.ts
├── types.ts                 # shared TypeScript interfaces
└── App.vue
```
