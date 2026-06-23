<template>
  <div class="admin-login">
    <div class="admin-login__card">
      <h1 class="admin-login__title">Staff Access</h1>
      <p class="admin-login__sub">Enter your admin API key to continue.</p>

      <form class="admin-login__form" @submit.prevent="submit">
        <label for="apiKey" class="admin-login__label">API Key</label>
        <input
          id="apiKey"
          v-model="keyInput"
          type="password"
          class="admin-login__input"
          placeholder="Enter admin key"
          autocomplete="off"
          :disabled="loading"
          required
        />

        <p v-if="error" class="admin-login__error">{{ error }}</p>

        <button type="submit" class="admin-login__btn" :disabled="loading">
          {{ loading ? 'Verifying…' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'
import { fetchAdminOrders, AdminAuthError } from '../../api/admin'

const router = useRouter()
const adminStore = useAdminStore()

const keyInput = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

async function submit(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    await fetchAdminOrders(keyInput.value, 1)
    adminStore.setKey(keyInput.value)
    router.push({ name: 'AdminOrders' })
  } catch (e) {
    if (e instanceof AdminAuthError) {
      error.value = 'Invalid key. Please try again.'
    } else {
      error.value = e instanceof Error ? e.message : 'Something went wrong'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
}

.admin-login__card {
  width: 100%;
  max-width: 380px;
  padding: 40px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: var(--bg);
  box-shadow: var(--shadow);
}

.admin-login__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-h);
  margin: 0 0 6px;
}

.admin-login__sub {
  font-size: 14px;
  color: var(--text);
  margin-bottom: 28px;
}

.admin-login__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.admin-login__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-h);
}

.admin-login__input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 15px;
  font-family: var(--mono);
  box-sizing: border-box;
  transition: border-color 0.15s;
}

.admin-login__input:focus {
  outline: none;
  border-color: var(--accent);
}

.admin-login__input:disabled {
  opacity: 0.5;
}

.admin-login__error {
  color: #e53e3e;
  font-size: 13px;
  margin: 0;
}

.admin-login__btn {
  padding: 12px 24px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  transition: opacity 0.15s;
}

.admin-login__btn:hover:not(:disabled) {
  opacity: 0.85;
}

.admin-login__btn:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
