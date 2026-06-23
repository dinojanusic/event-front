<template>
  <header class="site-header">
    <div class="site-header__inner">
      <RouterLink to="/" class="site-header__logo">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="14"
            cy="14"
            r="14"
            fill="var(--accent)"
            fill-opacity="0.15"
          />
          <circle cx="14" cy="14" r="6" fill="var(--accent)" />
        </svg>
        <span>Eventful</span>
      </RouterLink>

      <nav class="site-header__nav">
        <RouterLink to="/my-tickets" class="site-header__link">Find my tickets</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  backdrop-filter: blur(8px);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 32px;
}

.site-header__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 17px;
  color: var(--text-h);
  letter-spacing: -0.2px;
}

.site-header__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.site-header__link {
  font-size: 15px;
  font-weight: 500;
  color: var(--text);
  text-decoration: none;
  padding: 6px 12px;
  border-radius: 6px;
  transition:
    background 0.15s,
    color 0.15s;
}

.site-header__link:hover,
.site-header__link.router-link-active {
  background: var(--accent-bg);
  color: var(--accent);
}

@media (max-width: 1024px) {
  .site-header__inner {
    padding: 0 20px;
  }
}
</style>
