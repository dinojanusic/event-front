<template>
  <Header v-if="!isAdminRoute" />
  <main :class="{ 'main--admin': isAdminRoute }">
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Header from './components/Header.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>

<style scoped>
.main--admin {
  width: 100%;
  max-width: 100%;
  padding: 0;
  margin: 0;
}
</style>
