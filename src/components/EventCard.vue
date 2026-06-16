<template>
  <RouterLink :to="{ name: 'EventDetail', params: { slug: event.slug } }" class="event-card">
    <div class="event-card__image">
      <img v-if="event.heroImage" :src="event.heroImage" :alt="event.name" />
      <div v-else class="event-card__image-placeholder" />
    </div>
    <div class="event-card__body">
      <h2>{{ event.name }}</h2>
      <p class="event-card__date">{{ formattedDate }}</p>
      <p v-if="event.venue" class="event-card__venue">{{ event.venue }}</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '../types'

const props = defineProps<{ event: Event }>()

const formattedDate = computed(() => {
  if (!props.event.startDate) return 'Date TBA'
  return new Date(props.event.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<style scoped>
.event-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.2s;
  background: var(--bg);
}

.event-card:hover {
  box-shadow: var(--shadow);
}

.event-card__image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--code-bg);
}

.event-card__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.event-card__image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-bg) 0%, var(--code-bg) 100%);
}

.event-card__body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-card__body h2 {
  font-size: 18px;
  letter-spacing: -0.2px;
  margin: 0;
}

.event-card__date {
  font-size: 14px;
  color: var(--accent);
  font-weight: 500;
}

.event-card__venue {
  font-size: 14px;
  color: var(--text);
}
</style>
