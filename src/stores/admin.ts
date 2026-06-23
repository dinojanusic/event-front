import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'admin:key'

function loadFromSession(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export const useAdminStore = defineStore('admin', () => {
  const apiKey = ref<string | null>(loadFromSession())

  const isAuthenticated = computed(() => apiKey.value !== null && apiKey.value.length > 0)

  function setKey(key: string): void {
    apiKey.value = key
    sessionStorage.setItem(STORAGE_KEY, key)
  }

  function clear(): void {
    apiKey.value = null
    sessionStorage.removeItem(STORAGE_KEY)
  }

  return { apiKey, isAuthenticated, setKey, clear }
})
