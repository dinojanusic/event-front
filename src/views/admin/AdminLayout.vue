<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <div class="admin-sidebar__brand">
        <RouterLink to="/" class="admin-sidebar__logo">Eventful</RouterLink>
        <span class="admin-sidebar__badge">Staff</span>
      </div>

      <nav class="admin-sidebar__nav">
        <RouterLink
          to="/admin/orders"
          class="admin-sidebar__link"
          active-class="admin-sidebar__link--active"
        >
          Orders
        </RouterLink>
        <RouterLink
          to="/admin/inventory"
          class="admin-sidebar__link"
          active-class="admin-sidebar__link--active"
        >
          Inventory
        </RouterLink>
      </nav>

      <button class="admin-sidebar__logout" @click="logout">Sign out</button>
    </aside>

    <div class="admin-content">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAdminStore } from '../../stores/admin'

const adminStore = useAdminStore()
const router = useRouter()

function logout(): void {
  adminStore.clear()
  router.push({ name: 'AdminLogin' })
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  position: fixed;
  inset: 0;
  background: var(--bg);
  overflow: hidden;
}

.admin-sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  background: var(--bg);
}

.admin-sidebar__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 16px;
}

.admin-sidebar__logo {
  font-weight: 700;
  font-size: 16px;
  color: var(--text-h);
  text-decoration: none;
}

.admin-sidebar__badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 4px;
  padding: 2px 6px;
}

.admin-sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 12px;
}

.admin-sidebar__link {
  display: block;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.admin-sidebar__link:hover,
.admin-sidebar__link--active {
  background: var(--accent-bg);
  color: var(--accent);
}

.admin-sidebar__logout {
  margin: 0 12px;
  padding: 9px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  text-align: left;
  font-family: var(--sans);
  transition: background 0.15s, color 0.15s;
}

.admin-sidebar__logout:hover {
  background: rgba(229, 62, 62, 0.08);
  color: #e53e3e;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  min-width: 0;
}
</style>
