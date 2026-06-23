<template>
  <div class="admin-orders">
    <div class="admin-orders__header">
      <h1 class="admin-orders__title">Orders</h1>

      <select v-model="statusFilter" class="admin-orders__filter" @change="onFilterChange">
        <option value="">All statuses</option>
        <option value="confirmed">Confirmed</option>
        <option value="cancelled">Cancelled</option>
        <option value="pending">Pending</option>
        <option value="expired">Expired</option>
      </select>
    </div>

    <p v-if="error" class="admin-orders__error">{{ error }}</p>

    <div v-else-if="loading" class="admin-orders__state">Loading…</div>

    <div v-else-if="orders.length === 0" class="admin-orders__state">No orders found.</div>

    <template v-else>
      <div class="admin-orders__table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Email</th>
              <th>Event</th>
              <th>Tier</th>
              <th>Qty</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders"
              :key="order.orderNumber"
              class="admin-table__row"
              @click="goToDetail(order.orderNumber)"
            >
              <td class="admin-table__mono">{{ order.orderNumber }}</td>
              <td>{{ order.email }}</td>
              <td>{{ order.eventName }}</td>
              <td>{{ order.tierName }}</td>
              <td>{{ order.quantity }}</td>
              <td>{{ formatPrice(order.totalPrice, order.currency) }}</td>
              <td>
                <span class="admin-status" :class="`admin-status--${order.status}`">
                  {{ order.status }}
                </span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="admin-pagination">
        <button
          class="admin-pagination__btn"
          :disabled="page === 1"
          @click="goToPage(page - 1)"
        >
          &larr; Prev
        </button>

        <span class="admin-pagination__info">
          Page {{ page }} of {{ totalPages }}
          <span class="admin-pagination__total">({{ total }} orders)</span>
        </span>

        <button
          class="admin-pagination__btn"
          :disabled="page >= totalPages"
          @click="goToPage(page + 1)"
        >
          Next &rarr;
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import { fetchAdminOrders, AdminAuthError } from '../../api/admin'
import type { AdminOrder } from '../../types'

const router = useRouter()
const adminStore = useAdminStore()

const orders = ref<AdminOrder[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const statusFilter = ref('')
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

async function loadOrders(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const result = await fetchAdminOrders(
      adminStore.apiKey!,
      page.value,
      statusFilter.value || undefined,
    )
    orders.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } catch (e) {
    if (e instanceof AdminAuthError) {
      adminStore.clear()
      router.push({ name: 'AdminLogin' })
    } else {
      error.value = e instanceof Error ? e.message : 'Failed to load orders'
    }
  } finally {
    loading.value = false
  }
}

function onFilterChange(): void {
  page.value = 1
  loadOrders()
}

function goToPage(p: number): void {
  page.value = p
  loadOrders()
}

function goToDetail(orderNumber: string): void {
  router.push({ name: 'AdminOrderDetail', params: { orderNumber } })
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

onMounted(loadOrders)
</script>

<style scoped>
.admin-orders__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-orders__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
}

.admin-orders__filter {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 14px;
  font-family: var(--sans);
  cursor: pointer;
}

.admin-orders__state {
  color: var(--text);
  padding: 48px 0;
  text-align: center;
}

.admin-orders__error {
  color: #e53e3e;
  font-size: 14px;
}

.admin-orders__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.admin-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-h);
}

.admin-table__row {
  cursor: pointer;
  transition: background 0.1s;
}

.admin-table__row:hover {
  background: var(--code-bg);
}

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-table__mono {
  font-family: var(--mono);
  font-size: 13px;
}

.admin-status {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
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

.admin-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.admin-pagination__btn {
  padding: 8px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 13px;
  font-weight: 500;
  font-family: var(--sans);
  cursor: pointer;
  transition: background 0.15s;
}

.admin-pagination__btn:hover:not(:disabled) {
  background: var(--code-bg);
}

.admin-pagination__btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.admin-pagination__info {
  font-size: 13px;
  color: var(--text-h);
}

.admin-pagination__total {
  color: var(--text);
  margin-left: 4px;
}
</style>
