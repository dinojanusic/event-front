<template>
  <div class="my-tickets">
    <!-- Lookup form -->
    <template v-if="state === 'form'">
      <h1>Find My Tickets</h1>
      <p class="my-tickets__subtitle">Enter the email address and order number from your confirmation.</p>

      <form class="my-tickets__form" @submit.prevent="lookup">
        <div class="my-tickets__field">
          <label for="email" class="my-tickets__label">Email address</label>
          <input
            id="email"
            v-model="email"
            class="my-tickets__input"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            :disabled="loading"
          />
        </div>

        <div class="my-tickets__field">
          <label for="orderNumber" class="my-tickets__label">Order number</label>
          <input
            id="orderNumber"
            v-model="orderNumber"
            class="my-tickets__input my-tickets__input--mono"
            type="text"
            required
            autocomplete="off"
            placeholder="ORD-XXXXXXXXXX"
            :disabled="loading"
          />
        </div>

        <p v-if="lookupError" class="my-tickets__error">{{ lookupError }}</p>

        <button type="submit" class="my-tickets__btn my-tickets__btn--primary" :disabled="loading">
          {{ loading ? 'Looking up…' : 'Find my tickets' }}
        </button>
      </form>
    </template>

    <!-- Not found -->
    <template v-else-if="state === 'not-found'">
      <div class="my-tickets__not-found">
        <div class="my-tickets__icon my-tickets__icon--error">✕</div>
        <h1>Order Not Found</h1>
        <p>We couldn't find an order matching those details. Please check your email and order number and try again.</p>
        <button class="my-tickets__btn my-tickets__btn--secondary" @click="reset">Try again</button>
      </div>
    </template>

    <!-- Order detail -->
    <template v-else-if="state === 'result' && order">
      <div class="my-tickets__result">
        <div class="my-tickets__result-header">
          <div class="my-tickets__icon my-tickets__icon--success">✓</div>
          <div>
            <h1>{{ order.eventName }}</h1>
            <p class="my-tickets__order-num">Order <span>{{ order.orderNumber }}</span></p>
          </div>
        </div>

        <div class="my-tickets__card">
          <div class="my-tickets__row">
            <span class="my-tickets__row-label">Ticket tier</span>
            <span class="my-tickets__row-value">{{ order.tierName }}</span>
          </div>
          <div class="my-tickets__row">
            <span class="my-tickets__row-label">Quantity</span>
            <span class="my-tickets__row-value">{{ order.quantity }}</span>
          </div>
          <div class="my-tickets__row">
            <span class="my-tickets__row-label">Total paid</span>
            <span class="my-tickets__row-value my-tickets__row-value--price">
              {{ formatPrice(order.totalPrice, order.currency) }}
            </span>
          </div>
          <div v-if="order.eventStartDate" class="my-tickets__row">
            <span class="my-tickets__row-label">Event date</span>
            <span class="my-tickets__row-value">{{ formatDate(order.eventStartDate) }}</span>
          </div>
          <div v-if="order.venueName" class="my-tickets__row">
            <span class="my-tickets__row-label">Venue</span>
            <span class="my-tickets__row-value">{{ order.venueName }}</span>
          </div>
          <div class="my-tickets__row">
            <span class="my-tickets__row-label">Status</span>
            <span class="my-tickets__status">{{ order.status }}</span>
          </div>
        </div>

        <div class="my-tickets__actions">
          <RouterLink v-if="order.eventSlug" :to="`/events/${order.eventSlug}`" class="my-tickets__btn my-tickets__btn--secondary">
            View event
          </RouterLink>
          <button class="my-tickets__btn my-tickets__btn--ghost" @click="reset">Look up another order</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { fetchOrder, OrderNotFoundError } from '../api/orders'
import type { OrderDetail } from '../types'

type State = 'form' | 'not-found' | 'result'

const state = ref<State>('form')
const email = ref('')
const orderNumber = ref('')
const loading = ref(false)
const lookupError = ref<string | null>(null)
const order = ref<OrderDetail | null>(null)

async function lookup(): Promise<void> {
  loading.value = true
  lookupError.value = null

  try {
    order.value = await fetchOrder(orderNumber.value.trim(), email.value.trim())
    state.value = 'result'
  } catch (e) {
    if (e instanceof OrderNotFoundError) {
      state.value = 'not-found'
    } else {
      lookupError.value = e instanceof Error ? e.message : String(e)
    }
  } finally {
    loading.value = false
  }
}

function reset(): void {
  state.value = 'form'
  order.value = null
  lookupError.value = null
}

function formatPrice(amount: string, currency: string): string {
  const num = parseFloat(amount)
  if (num === 0) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency ?? 'USD' }).format(num)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}
</script>

<style scoped>
.my-tickets {
  padding: 0 32px 64px;
  max-width: 560px;
}

.my-tickets h1 {
  margin-bottom: 8px;
}

.my-tickets__subtitle {
  color: var(--text);
  margin-bottom: 32px;
}

.my-tickets__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.my-tickets__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.my-tickets__label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-h);
}

.my-tickets__input {
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

.my-tickets__input--mono {
  font-family: var(--mono);
  letter-spacing: 0.03em;
}

.my-tickets__input:focus {
  outline: none;
  border-color: var(--accent);
}

.my-tickets__input:disabled {
  opacity: 0.5;
}

.my-tickets__error {
  color: #e53e3e;
  font-size: 14px;
  margin: 0;
}

.my-tickets__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}

.my-tickets__btn--primary {
  background: var(--accent);
  color: #fff;
  width: 100%;
  font-size: 16px;
  padding: 14px 24px;
}

.my-tickets__btn--secondary {
  background: var(--code-bg);
  color: var(--text-h);
}

.my-tickets__btn--ghost {
  background: transparent;
  color: var(--accent);
  padding: 13px 0;
}

.my-tickets__btn:hover:not(:disabled) {
  opacity: 0.8;
}

.my-tickets__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

/* Not found state */
.my-tickets__not-found {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 32px 0;
}

.my-tickets__not-found h1 {
  margin: 0;
}

/* Icon badge */
.my-tickets__icon {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.my-tickets__icon--success {
  background: rgba(56, 161, 105, 0.15);
  color: #38a169;
}

.my-tickets__icon--error {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

/* Result state */
.my-tickets__result {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.my-tickets__result-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.my-tickets__result-header h1 {
  margin: 0 0 4px;
}

.my-tickets__order-num {
  font-size: 14px;
  color: var(--text);
  margin: 0;
}

.my-tickets__order-num span {
  font-family: var(--mono);
  color: var(--text-h);
}

.my-tickets__card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.my-tickets__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}

.my-tickets__row:last-child {
  border-bottom: none;
}

.my-tickets__row-label {
  font-size: 14px;
  color: var(--text);
}

.my-tickets__row-value {
  font-weight: 500;
  color: var(--text-h);
  text-align: right;
}

.my-tickets__row-value--price {
  font-size: 17px;
  font-weight: 600;
}

.my-tickets__status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  background: rgba(56, 161, 105, 0.12);
  color: #38a169;
  text-transform: capitalize;
}

.my-tickets__actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .my-tickets {
    padding: 0 20px 48px;
  }
}
</style>
