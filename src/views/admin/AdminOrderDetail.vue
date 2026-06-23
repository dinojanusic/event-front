<template>
  <div class="admin-order-detail">
    <div class="admin-order-detail__nav">
      <RouterLink :to="{ name: 'AdminOrders' }" class="admin-order-detail__back">
        &larr; All orders
      </RouterLink>
    </div>

    <div v-if="loading" class="admin-order-detail__state">Loading…</div>
    <p v-else-if="error" class="admin-order-detail__error">{{ error }}</p>

    <template v-else-if="order">
      <div class="admin-order-detail__header">
        <div>
          <h1 class="admin-order-detail__order-num">{{ order.orderNumber }}</h1>
          <p class="admin-order-detail__sub">{{ order.email }}</p>
        </div>
        <span class="admin-status" :class="`admin-status--${order.status}`">
          {{ order.status }}
        </span>
      </div>

      <div class="admin-card">
        <div class="admin-card__row">
          <span class="admin-card__label">Event</span>
          <span class="admin-card__value">{{ order.eventName }}</span>
        </div>
        <div class="admin-card__row">
          <span class="admin-card__label">Tier</span>
          <span class="admin-card__value">{{ order.tierName }}</span>
        </div>
        <div class="admin-card__row">
          <span class="admin-card__label">Quantity</span>
          <span class="admin-card__value">{{ order.quantity }}</span>
        </div>
        <div class="admin-card__row">
          <span class="admin-card__label">Total</span>
          <span class="admin-card__value admin-card__value--price">
            {{ formatPrice(order.totalPrice, order.currency) }}
          </span>
        </div>
        <div v-if="order.eventStartDate" class="admin-card__row">
          <span class="admin-card__label">Event date</span>
          <span class="admin-card__value">{{ formatDate(order.eventStartDate) }}</span>
        </div>
        <div v-if="order.venueName" class="admin-card__row">
          <span class="admin-card__label">Venue</span>
          <span class="admin-card__value">{{ order.venueName }}</span>
        </div>
        <div class="admin-card__row">
          <span class="admin-card__label">Ordered at</span>
          <span class="admin-card__value">{{ formatDate(order.createdAt) }}</span>
        </div>
      </div>

      <div v-if="order.status === 'confirmed'" class="admin-order-detail__actions">
        <button
          class="admin-btn admin-btn--danger"
          :disabled="cancelling"
          @click="confirmCancel"
        >
          {{ cancelling ? 'Cancelling…' : 'Cancel & Refund' }}
        </button>
      </div>

      <div v-if="showConfirmDialog" class="admin-dialog-backdrop" @click.self="showConfirmDialog = false">
        <div class="admin-dialog">
          <h2 class="admin-dialog__title">Cancel this order?</h2>
          <p class="admin-dialog__body">
            This will mark <strong>{{ order.orderNumber }}</strong> as cancelled
            and return {{ order.quantity }} ticket{{ order.quantity !== 1 ? 's' : '' }}
            to inventory. This action cannot be undone.
          </p>
          <div class="admin-dialog__actions">
            <button class="admin-btn admin-btn--ghost" @click="showConfirmDialog = false">
              Keep order
            </button>
            <button class="admin-btn admin-btn--danger" :disabled="cancelling" @click="doCancel">
              {{ cancelling ? 'Cancelling…' : 'Yes, cancel order' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import { fetchAdminOrder, cancelAdminOrder, AdminAuthError } from '../../api/admin'
import type { AdminOrderDetail } from '../../types'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const order = ref<AdminOrderDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const cancelling = ref(false)
const showConfirmDialog = ref(false)

const orderNumber = route.params.orderNumber as string

async function loadOrder(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    order.value = await fetchAdminOrder(adminStore.apiKey!, orderNumber)
  } catch (e) {
    if (e instanceof AdminAuthError) {
      adminStore.clear()
      router.push({ name: 'AdminLogin' })
    } else {
      error.value = e instanceof Error ? e.message : 'Failed to load order'
    }
  } finally {
    loading.value = false
  }
}

function confirmCancel(): void {
  showConfirmDialog.value = true
}

async function doCancel(): Promise<void> {
  cancelling.value = true
  showConfirmDialog.value = false

  try {
    order.value = await cancelAdminOrder(adminStore.apiKey!, orderNumber)
  } catch (e) {
    if (e instanceof AdminAuthError) {
      adminStore.clear()
      router.push({ name: 'AdminLogin' })
    } else {
      error.value = e instanceof Error ? e.message : 'Failed to cancel order'
    }
  } finally {
    cancelling.value = false
  }
}

function formatPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    parseFloat(amount),
  )
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

onMounted(loadOrder)
</script>

<style scoped>
.admin-order-detail__nav {
  margin-bottom: 20px;
}

.admin-order-detail__back {
  font-size: 14px;
  color: var(--text);
  text-decoration: none;
  transition: color 0.15s;
}

.admin-order-detail__back:hover {
  color: var(--accent);
}

.admin-order-detail__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.admin-order-detail__order-num {
  font-size: 20px;
  font-weight: 700;
  font-family: var(--mono);
  color: var(--text-h);
  margin: 0 0 4px;
}

.admin-order-detail__sub {
  font-size: 14px;
  color: var(--text);
  margin: 0;
}

.admin-order-detail__state {
  color: var(--text);
  padding: 48px 0;
}

.admin-order-detail__error {
  color: #e53e3e;
  font-size: 14px;
}

.admin-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  max-width: 600px;
  margin-bottom: 28px;
}

.admin-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
}

.admin-card__row:last-child {
  border-bottom: none;
}

.admin-card__label {
  font-size: 13px;
  color: var(--text);
}

.admin-card__value {
  font-weight: 500;
  color: var(--text-h);
  text-align: right;
}

.admin-card__value--price {
  font-size: 17px;
  font-weight: 600;
}

.admin-order-detail__actions {
  margin-top: 8px;
}

.admin-status {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
  flex-shrink: 0;
}

.admin-status--confirmed {
  background: rgba(56, 161, 105, 0.12);
  color: #38a169;
}

.admin-status--cancelled {
  background: rgba(229, 62, 62, 0.1);
  color: #e53e3e;
}

.admin-status--pending {
  background: rgba(214, 158, 46, 0.12);
  color: #d69e2e;
}

.admin-status--expired {
  background: var(--code-bg);
  color: var(--text);
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  padding: 11px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}

.admin-btn--danger {
  background: #e53e3e;
  color: #fff;
}

.admin-btn--ghost {
  background: var(--code-bg);
  color: var(--text-h);
}

.admin-btn:hover:not(:disabled) {
  opacity: 0.82;
}

.admin-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.admin-dialog-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.admin-dialog {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 32px;
  max-width: 420px;
  width: 100%;
  box-shadow: var(--shadow);
}

.admin-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0 0 12px;
}

.admin-dialog__body {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
  margin-bottom: 24px;
}

.admin-dialog__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
