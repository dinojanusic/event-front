<template>
  <div class="admin-inventory">
    <div class="admin-inventory__header">
      <h1 class="admin-inventory__title">Live Inventory</h1>
      <button class="admin-btn admin-btn--secondary" :disabled="loading" @click="loadInventory">
        {{ loading ? 'Refreshing…' : 'Refresh' }}
      </button>
    </div>

    <p v-if="error" class="admin-inventory__error">{{ error }}</p>

    <div v-else-if="loading" class="admin-inventory__state">Loading…</div>

    <div v-else-if="tiers.length === 0" class="admin-inventory__state">No tiers found.</div>

    <template v-else>
      <div class="admin-inventory__table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Tier</th>
              <th>Price</th>
              <th>Quota</th>
              <th>Sold</th>
              <th>Available</th>
              <th>Utilization</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tier in tiers" :key="tier.tierId">
              <td>{{ tier.eventName || '—' }}</td>
              <td>{{ tier.tierName }}</td>
              <td>{{ formatPrice(tier.price, tier.currency) }}</td>
              <td>{{ tier.quota }}</td>
              <td>{{ tier.quota - tier.available }}</td>
              <td>
                <span :class="availabilityClass(tier)">{{ tier.available }}</span>
              </td>
              <td class="admin-table__bar-cell">
                <div class="util-bar">
                  <div
                    class="util-bar__fill"
                    :style="{ width: utilizationPct(tier) + '%' }"
                    :class="utilizationClass(tier)"
                  />
                </div>
                <span class="util-pct">{{ utilizationPct(tier) }}%</span>
              </td>
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
          <span class="admin-pagination__total">({{ total }} tiers)</span>
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
import { fetchInventory, AdminAuthError } from '../../api/admin'
import type { InventoryTier } from '../../types'

const router = useRouter()
const adminStore = useAdminStore()

const tiers = ref<InventoryTier[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const total = ref(0)
const totalPages = ref(1)

async function loadInventory(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const result = await fetchInventory(adminStore.apiKey!, page.value)
    tiers.value = result.data
    total.value = result.total
    totalPages.value = result.totalPages
  } catch (e) {
    if (e instanceof AdminAuthError) {
      adminStore.clear()
      router.push({ name: 'AdminLogin' })
    } else {
      error.value = e instanceof Error ? e.message : 'Failed to load inventory'
    }
  } finally {
    loading.value = false
  }
}

function goToPage(p: number): void {
  page.value = p
  loadInventory()
}

function utilizationPct(tier: InventoryTier): number {
  if (tier.quota === 0) return 0
  return Math.round(((tier.quota - tier.available) / tier.quota) * 100)
}

function utilizationClass(tier: InventoryTier): string {
  const pct = utilizationPct(tier)
  if (pct >= 90) return 'util-bar__fill--high'
  if (pct >= 60) return 'util-bar__fill--mid'
  return 'util-bar__fill--low'
}

function availabilityClass(tier: InventoryTier): string {
  if (tier.available === 0) return 'avail avail--none'
  if (tier.available <= 10) return 'avail avail--low'
  return ''
}

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return 'Free'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price)
}

onMounted(loadInventory)
</script>

<style scoped>
.admin-inventory__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.admin-inventory__title {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0;
}

.admin-inventory__state {
  color: var(--text);
  padding: 48px 0;
  text-align: center;
}

.admin-inventory__error {
  color: #e53e3e;
  font-size: 14px;
}

.admin-inventory__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-bottom: 16px;
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

.admin-table tbody tr:last-child td {
  border-bottom: none;
}

.admin-table__bar-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.util-bar {
  flex: 1;
  height: 6px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
  min-width: 80px;
}

.util-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.util-bar__fill--low {
  background: #38a169;
}

.util-bar__fill--mid {
  background: #d69e2e;
}

.util-bar__fill--high {
  background: #e53e3e;
}

.util-pct {
  font-size: 13px;
  color: var(--text);
  min-width: 34px;
  text-align: right;
  font-family: var(--mono);
}

.avail--low {
  color: #d97706;
  font-weight: 600;
}

.avail--none {
  color: #e53e3e;
  font-weight: 600;
}

.admin-btn {
  display: inline-flex;
  align-items: center;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  border: none;
  transition: opacity 0.15s;
}

.admin-btn--secondary {
  background: var(--code-bg);
  color: var(--text-h);
}

.admin-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.admin-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
