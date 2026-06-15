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
          <div class="tier-list">
            <div v-for="tier in event.ticketTiers" :key="tier.id" class="tier">
              <div class="tier__info">
                <p class="tier__name">{{ tier.name }}</p>
                <p class="tier__price">{{ formatPrice(tier.price, tier.currency) }}</p>
                <p v-if="tier.salesEnd" class="tier__window">
                  Sale ends {{ formatDate(tier.salesEnd) }}
                </p>
              </div>
              <div class="tier__qty">
                <button
                  class="tier__qty-btn"
                  aria-label="Decrease quantity"
                  :disabled="quantities[tier.id] <= 0"
                  @click="decrement(tier)"
                >−</button>
                <span class="tier__qty-value">{{ quantities[tier.id] }}</span>
                <button
                  class="tier__qty-btn"
                  aria-label="Increase quantity"
                  :disabled="quantities[tier.id] >= maxQty(tier)"
                  @click="increment(tier)"
                >+</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchEventBySlug } from '../api/events.js'

const route = useRoute()
const event = ref(null)
const loading = ref(true)
const error = ref(null)
const quantities = ref({})

onMounted(async () => {
  try {
    event.value = await fetchEventBySlug(route.params.slug)
    for (const tier of event.value.ticketTiers ?? []) {
      quantities.value[tier.id] = 0
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const formattedDates = computed(() => {
  if (!event.value?.startDate) return 'Date TBA'
  const fmt = d =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  const start = fmt(event.value.startDate)
  if (!event.value.endDate || event.value.endDate === event.value.startDate) return start
  return `${start} – ${fmt(event.value.endDate)}`
})

function formatPrice(price, currency) {
  if (price == null) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency ?? 'USD',
  }).format(price)
}

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function maxQty(tier) {
  return tier.quota != null ? Math.min(tier.quota, 10) : 10
}

function increment(tier) {
  if (quantities.value[tier.id] < maxQty(tier)) quantities.value[tier.id]++
}

function decrement(tier) {
  if (quantities.value[tier.id] > 0) quantities.value[tier.id]--
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
