<template>
  <div class="checkout">
    <!-- No active reservation at all -->
    <div v-if="!expired && !store.hasReservation" class="checkout__empty">
      <p>No active reservation.</p>
      <RouterLink class="checkout__back-link" to="/">Browse events</RouterLink>
    </div>

    <!-- Reservation expired during this session -->
    <div v-else-if="expired" class="checkout__expired">
      <div class="checkout__expired-icon">⏱</div>
      <h1>Reservation Expired</h1>
      <p>Your 10-minute hold has ended and the tickets have been released.</p>
      <RouterLink class="checkout__btn checkout__btn--secondary" to="/">Browse Events</RouterLink>
    </div>

    <!-- Active reservation -->
    <template v-else>
      <header class="checkout__header">
        <h1>Complete Your Order</h1>
        <div class="checkout__timer" :class="{ 'checkout__timer--urgent': secondsLeft < 60 }">
          Hold expires in
          <span class="checkout__countdown">{{ countdownDisplay }}</span>
        </div>
      </header>

      <div class="checkout__body">
        <!-- Order summary -->
        <section class="checkout__summary">
          <h2>Your Tickets</h2>
          <div class="checkout__item-list">
            <div v-for="item in store.items" :key="item.uuid" class="checkout__item">
              <div class="checkout__item-info">
                <p class="checkout__item-name">{{ item.tierName }}</p>
                <p class="checkout__item-qty">× {{ item.quantity }}</p>
              </div>
              <p class="checkout__item-price">
                {{ formatPrice(item.price * item.quantity, item.currency) }}
              </p>
            </div>
          </div>
          <div class="checkout__total">
            <span>Total</span>
            <span>{{ formatTotal() }}</span>
          </div>
        </section>

        <!-- Order form -->
        <section v-if="!confirmed" class="checkout__form">
          <h2>Contact Details</h2>
          <form @submit.prevent="placeOrder">
            <div class="checkout__field">
              <label for="email" class="checkout__label">Email address</label>
              <input
                id="email"
                v-model="email"
                class="checkout__input"
                type="email"
                required
                autocomplete="email"
                placeholder="you@example.com"
                :disabled="placing"
              />
            </div>
            <p v-if="orderError" class="checkout__error">{{ orderError }}</p>
            <button
              type="submit"
              class="checkout__btn checkout__btn--primary"
              :disabled="placing"
            >
              {{ placing ? 'Placing order…' : 'Place Order' }}
            </button>
          </form>
        </section>

        <!-- Confirmation -->
        <section v-else class="checkout__confirmed">
          <div class="checkout__confirmed-icon">✓</div>
          <h2>Order Confirmed</h2>
          <p>
            Order <strong>{{ orderNumber }}</strong> — confirmation sent to
            <strong>{{ email }}</strong>
          </p>
          <RouterLink class="checkout__btn checkout__btn--secondary" to="/">
            Back to Events
          </RouterLink>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, onBeforeRouteLeave } from 'vue-router'
import { useReservation } from '../composables/useReservation.js'
import { placeOrder as apiPlaceOrder, releaseReservation } from '../api/reservations.js'

const { secondsLeft, countdownDisplay, expired, store } = useReservation()

const email = ref('')
const placing = ref(false)
const orderError = ref(null)
const confirmed = ref(false)
const orderNumber = ref(null)

function formatPrice(amount, currency) {
  if (amount == null || amount === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
  }).format(amount)
}

function formatTotal() {
  const items = store.items
  if (!items.length) return ''
  const currency = items[0].currency ?? 'USD'
  const total = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0)
  return formatPrice(total, currency)
}

async function placeOrder() {
  placing.value = true
  orderError.value = null

  try {
    let lastOrderNumber = null
    // Backend is one-reservation-per-order; place sequentially for multi-tier
    for (const item of store.items) {
      const data = await apiPlaceOrder(item.uuid, email.value)
      lastOrderNumber = data.orderNumber
    }
    store.clear()
    orderNumber.value = lastOrderNumber
    confirmed.value = true
  } catch (e) {
    if (e.code === 'RESERVATION_EXPIRED') {
      store.clear()
      expired.value = true
    } else {
      orderError.value = e.message
    }
  } finally {
    placing.value = false
  }
}

// Release the hold when the user navigates away without completing the order.
// Fire-and-forget: Vue Router won't await this; backend TTL is the safety net.
onBeforeRouteLeave(() => {
  if (confirmed.value || !store.hasReservation) return
  const uuids = store.items.map(i => i.uuid)
  store.clear()
  Promise.allSettled(uuids.map(releaseReservation))
})
</script>

<style scoped>
.checkout {
  padding: 0 32px 64px;
  text-align: left;
  max-width: 680px;
}

.checkout__empty,
.checkout__expired {
  padding: 64px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
}

.checkout__expired-icon {
  font-size: 40px;
  line-height: 1;
}

.checkout__expired h1 {
  margin: 0;
}

.checkout__expired p {
  color: var(--text);
}

.checkout__header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.checkout__header h1 {
  margin-bottom: 12px;
}

.checkout__timer {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: var(--text);
  background: var(--code-bg);
  border-radius: 8px;
  padding: 8px 14px;
  transition: background 0.3s, color 0.3s;
}

.checkout__timer--urgent {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.checkout__countdown {
  font-family: var(--mono);
  font-size: 17px;
  font-weight: 600;
  color: inherit;
  min-width: 3.2ch;
}

.checkout__body {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.checkout__summary h2,
.checkout__form h2 {
  margin-bottom: 16px;
}

.checkout__item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.checkout__item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
}

.checkout__item-name {
  font-weight: 500;
  color: var(--text-h);
  margin-bottom: 2px;
}

.checkout__item-qty {
  font-size: 14px;
  color: var(--text);
}

.checkout__item-price {
  font-weight: 600;
  color: var(--text-h);
  font-size: 18px;
}

.checkout__total {
  display: flex;
  justify-content: space-between;
  padding: 12px 20px 0;
  font-weight: 600;
  font-size: 17px;
  color: var(--text-h);
  border-top: 1px solid var(--border);
}

.checkout__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.checkout__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
}

.checkout__input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 16px;
  font-family: var(--sans);
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.checkout__input:focus {
  outline: none;
  border-color: var(--accent);
}

.checkout__input:disabled {
  opacity: 0.5;
}

.checkout__error {
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 12px;
}

.checkout__btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.15s;
  border: none;
}

.checkout__btn--primary {
  width: 100%;
  background: var(--accent);
  color: #fff;
  box-sizing: border-box;
}

.checkout__btn--secondary {
  background: var(--code-bg);
  color: var(--text-h);
}

.checkout__btn:hover:not(:disabled) {
  opacity: 0.85;
}

.checkout__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.checkout__confirmed {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkout__confirmed-icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(56, 161, 105, 0.15);
  color: #38a169;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout__confirmed h2 {
  margin: 0;
}

.checkout__back-link {
  color: var(--accent);
  font-size: 15px;
}

@media (max-width: 1024px) {
  .checkout {
    padding: 0 20px 48px;
  }
}
</style>
