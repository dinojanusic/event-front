<template>
  <div class="event-list">
    <h1>Events</h1>

    <p v-if="error" class="event-list__error">{{ error }}</p>

    <div v-else-if="loading" class="event-list__state">Loading events…</div>

    <div v-else-if="events.length === 0" class="event-list__state">No events found.</div>

    <div v-else class="event-list__grid">
      <EventCard v-for="event in events" :key="event.id" :event="event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import EventCard from '../components/EventCard.vue'
import { fetchEvents } from '../api/events'
import type { Event } from '../types'

const events = ref<Event[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    events.value = await fetchEvents()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.event-list {
  padding: 0 32px 64px;
  text-align: left;
}

.event-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.event-list__state {
  color: var(--text);
  padding: 48px 0;
}

.event-list__error {
  color: #e53e3e;
  padding: 48px 0;
}

@media (max-width: 1024px) {
  .event-list {
    padding: 0 20px 48px;
  }
}
</style>
