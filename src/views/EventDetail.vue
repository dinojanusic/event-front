<template>
  <div class="event-detail">
    <div v-if="loading" class="event-detail__state">Loading…</div>
    <p v-else-if="error" class="event-detail__error">{{ error }}</p>

    <template v-else-if="event">
      <div v-if="event.heroImage" class="event-detail__hero">
        <img :src="event.heroImage" :alt="event.name" />
      </div>

      <div class="event-detail__content">
        <header class="event-detail__header">
          <h1>{{ event.name }}</h1>
          <div class="event-detail__meta">
            <span class="event-detail__date">{{ formattedDates }}</span>
            <span v-if="event.venue" class="event-detail__venue">{{ event.venue }}</span>
          </div>
        </header>

        <section v-if="event.description" class="event-detail__description">
          <!-- eslint-disable-next-line vue/no-v-html -->
          <div v-html="event.description" />
        </section>

        <section v-if="event.ticketTiers?.length" class="event-detail__tickets">
          <h2>Tickets</h2>

          <div v-if="reservationStore.isActive" class="reserve-notice">
            You have an active hold.
            <RouterLink to="/checkout" class="reserve-notice__link">Continue to checkout →</RouterLink>
          </div>

          <div class="tier-list">
            <div
              v-for="tier in event.ticketTiers"
              :key="tier.id"
              class="tier"
              :class="{ 'tier--soldout': tier.available === 0 }"
            >
              <div class="tier__info">
                <p class="tier__name">{{ tier.name }}</p>
                <p class="tier__price">{{ formatPrice(tier.price, tier.currency) }}</p>
                <p v-if="tier.salesEnd" class="tier__window">
                  Sale ends {{ formatDate(tier.salesEnd) }}
                </p>
                <p v-if="tier.available === 0" class="tier__availability tier__availability--soldout">
                  Sold out
                </p>
                <p v-else-if="tier.available != null && tier.available <= 10" class="tier__availability tier__availability--low">
                  Only {{ tier.available }} left
                </p>
                <p v-else-if="tier.available != null" class="tier__availability">
                  {{ tier.available }} remaining
                </p>
              </div>
              <div v-if="tier.available !== 0" class="tier__qty">
                <button
                  class="tier__qty-btn"
                  aria-label="Decrease quantity"
                  :disabled="quantities[tier.id] <= 0 || reservationStore.isActive"
                  @click="decrement(tier)"
                >−</button>
                <span class="tier__qty-value">{{ quantities[tier.id] }}</span>
                <button
                  class="tier__qty-btn"
                  aria-label="Increase quantity"
                  :disabled="quantities[tier.id] >= maxQty(tier) || reservationStore.isActive"
                  @click="increment(tier)"
                >+</button>
              </div>
            </div>
          </div>

          <div v-if="totalSelected > 0 && !reservationStore.isActive" class="reserve-bar">
            <p v-if="reserveError" class="reserve-bar__error">{{ reserveError }}</p>
            <button
              class="reserve-bar__btn"
              :disabled="reserving"
              @click="reserve"
            >
              {{ reserving ? 'Reserving…' : `Reserve ${totalSelected} ticket${totalSelected !== 1 ? 's' : ''}` }}
            </button>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { fetchEventBySlug } from '../api/events'
import { createReservation, releaseReservation } from '../api/reservations'
import { useReservationStore } from '../stores/reservation'
import type { Event, Tier, ReservationItem } from '../types'

const route = useRoute()
const router = useRouter()
const reservationStore = useReservationStore()

const event = ref<Event | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const quantities = ref<Record<string, number>>({})
const reserving = ref(false)
const reserveError = ref<string | null>(null)

onMounted(async () => {
  try {
    event.value = await fetchEventBySlug(route.params.slug as string)
    for (const tier of event.value.ticketTiers ?? []) {
      quantities.value[tier.id] = 0
    }
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})

const formattedDates = computed(() => {
  if (!event.value?.startDate) return 'Date TBA'
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  const start = fmt(event.value.startDate)
  if (!event.value.endDate || event.value.endDate === event.value.startDate) return start
  return `${start} – ${fmt(event.value.endDate)}`
})

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
  }).format(price)
}

function formatDate(dt: string): string {
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function maxQty(tier: Tier): number {
  // Cap at live available count first, then static quota, then hard UI max of 10.
  const cap = tier.available ?? tier.quota ?? Infinity
  return Math.min(cap, 10)
}

function increment(tier: Tier): void {
  if (quantities.value[tier.id] < maxQty(tier)) quantities.value[tier.id]++
}

function decrement(tier: Tier): void {
  if (quantities.value[tier.id] > 0) quantities.value[tier.id]--
}

const totalSelected = computed(() =>
  Object.values(quantities.value).reduce((sum, q) => sum + q, 0),
)

async function reserve(): Promise<void> {
  const selectedTiers = (event.value?.ticketTiers ?? []).filter(
    t => quantities.value[t.id] > 0,
  )
  if (!selectedTiers.length) return

  reserving.value = true
  reserveError.value = null
  const createdUuids: string[] = []

  try {
    const items: ReservationItem[] = []
    for (const tier of selectedTiers) {
      const qty = quantities.value[tier.id]
      const result = await createReservation(tier.id, qty)
      createdUuids.push(result.uuid)
      items.push({
        uuid: result.uuid,
        expiresAt: result.expiresAt,
        tierId: tier.id,
        tierName: tier.name,
        quantity: qty,
        price: tier.price ?? 0,
        currency: tier.currency,
      })
    }
    reservationStore.set(items)
    router.push('/checkout')
  } catch (e) {
    // Roll back any holds that were successfully created before the failure
    await Promise.allSettled(createdUuids.map(releaseReservation))
    reserveError.value = e instanceof Error ? e.message : String(e)
  } finally {
    reserving.value = false
  }
}
</script>

<style scoped>
.event-detail {
  padding-bottom: 64px;
  text-align: left;
}

.event-detail__state {
  color: var(--text);
  padding: 48px 32px;
}

.event-detail__error {
  color: #e53e3e;
  padding: 48px 32px;
}

.event-detail__hero {
  width: 100%;
  aspect-ratio: 21 / 9;
  overflow: hidden;
  background: var(--code-bg);
}

.event-detail__hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-detail__content {
  padding: 0 32px;
}

.event-detail__header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.event-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  align-items: center;
}

.event-detail__date {
  font-size: 16px;
  font-weight: 500;
  color: var(--accent);
}

.event-detail__venue {
  font-size: 16px;
  color: var(--text);
}

.event-detail__description {
  margin-bottom: 48px;
  line-height: 160%;
  max-width: 680px;
}

.event-detail__tickets h2 {
  margin-bottom: 20px;
}

.tier-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 680px;
}

.tier {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 20px 24px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
}

.tier__name {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-h);
  margin-bottom: 4px;
}

.tier__price {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-h);
  margin-bottom: 4px;
}

.tier__window {
  font-size: 13px;
  color: var(--text);
}

.tier__availability {
  font-size: 13px;
  color: var(--text);
  margin-top: 6px;
}

.tier__availability--low {
  color: #d97706;
  font-weight: 500;
}

.tier__availability--soldout {
  color: #e53e3e;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 12px;
}

.tier--soldout {
  opacity: 0.6;
}

.tier__qty {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.tier__qty-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text-h);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
}

.tier__qty-btn:hover:not(:disabled) {
  background: var(--accent-bg);
  border-color: var(--accent-border);
  color: var(--accent);
}

.tier__qty-btn:disabled {
  opacity: 0.35;
  cursor: default;
}

.tier__qty-value {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-h);
  min-width: 24px;
  text-align: center;
  font-family: var(--mono);
}

.reserve-notice {
  font-size: 14px;
  color: var(--text);
  background: var(--accent-bg);
  border: 1px solid var(--accent-border);
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 16px;
  max-width: 680px;
}

.reserve-notice__link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 500;
  margin-left: 6px;
}

.reserve-bar {
  margin-top: 20px;
  max-width: 680px;
}

.reserve-bar__error {
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 10px;
}

.reserve-bar__btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.reserve-bar__btn:hover:not(:disabled) {
  opacity: 0.88;
}

.reserve-bar__btn:disabled {
  opacity: 0.5;
  cursor: default;
}

@media (max-width: 1024px) {
  .event-detail__content {
    padding: 0 20px;
  }

  .event-detail__hero {
    aspect-ratio: 16 / 9;
  }

  .tier {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
