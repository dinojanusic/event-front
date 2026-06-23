<template>
  <section class="hero">
    <div class="hero__content">
      <p class="hero__label">Discover &amp; Book</p>
      <h1 class="hero__title">Events worth<br />showing up for</h1>
      <p class="hero__sub">
        Find concerts, workshops, festivals, and more — then grab your spot in
        seconds.
      </p>
      <a href="#browse" class="hero__cta">Browse events</a>
    </div>
    <!-- <div class="hero__visual" aria-hidden="true">
      <img
        v-if="heroAsset"
        :src="heroAsset"
        alt=""
        class="hero__img"
      />
      <div v-else class="hero__blob" />
    </div> -->
  </section>

  <section id="browse" class="browse">
    <div class="browse__header">
      <h2 class="browse__title">Browse events</h2>
    </div>

    <p v-if="error" class="browse__error">{{ error }}</p>

    <div v-else-if="loading" class="browse__state">Loading events…</div>

    <div v-else-if="events.length === 0" class="browse__state">
      No events found.
    </div>

    <div v-else class="browse__grid">
      <EventCard v-for="event in events" :key="event.id" :event="event" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import EventCard from "../components/EventCard.vue";
import { fetchEvents } from "../api/events";
import type { Event } from "../types";

const events = ref<Event[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    events.value = await fetchEvents();
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* ── Hero ── */
.hero {
  display: flex;
  align-items: center;
  gap: 48px;
  padding: 72px 32px 80px;
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}

.hero__content {
  flex: 1 1 0;
  min-width: 0;
  text-align: left;
}

.hero__label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 16px;
}

.hero__title {
  font-size: 56px;
  letter-spacing: -2px;
  line-height: 1.05;
  color: var(--text-h);
  margin: 0 0 20px;
}

.hero__sub {
  font-size: 18px;
  color: var(--text);
  line-height: 1.6;
  max-width: 420px;
  margin-bottom: 36px;
}

.hero__cta {
  display: inline-block;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  transition:
    opacity 0.15s,
    box-shadow 0.15s;
}

.hero__cta:hover {
  opacity: 0.88;
  box-shadow: 0 4px 16px rgba(170, 59, 255, 0.35);
}

.hero__visual {
  flex: 0 0 420px;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
}

.hero__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.hero__blob {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-bg) 0%, var(--code-bg) 100%);
  border-radius: 16px;
}

/* ── Browse ── */
.browse {
  padding: 56px 32px 80px;
  text-align: left;
}

.browse__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
}

.browse__title {
  font-size: 28px;
  letter-spacing: -0.5px;
  margin: 0;
  color: var(--text-h);
}

.browse__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.browse__state {
  color: var(--text);
  padding: 48px 0;
}

.browse__error {
  color: #e53e3e;
  padding: 48px 0;
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .hero {
    flex-direction: column;
    padding: 48px 20px 56px;
    gap: 32px;
  }

  .hero__title {
    font-size: 36px;
    letter-spacing: -1px;
  }

  .hero__visual {
    flex: 0 0 auto;
    width: 100%;
    height: 220px;
  }

  .browse {
    padding: 40px 20px 56px;
  }
}
</style>
