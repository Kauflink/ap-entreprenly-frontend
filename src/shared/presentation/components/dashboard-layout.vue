<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()

const navItems = [
    { labelKey: 'dashboard.nav.home',         icon: 'dashboard',     path: '/home' },
    { labelKey: 'dashboard.nav.products',     icon: 'inventory_2',   path: '/products' },
    { labelKey: 'dashboard.nav.lots',         icon: 'category',      path: '/lots' },
    { labelKey: 'dashboard.nav.sales',        icon: 'receipt_long',  path: '/sales' },
    { labelKey: 'dashboard.nav.subscription', icon: 'credit_card',   path: '/subscription' },
    { labelKey: 'dashboard.nav.orders',       icon: 'shopping_cart', path: '/chatbot/orders' },
    { labelKey: 'dashboard.nav.chatbot',      icon: 'smart_toy',     path: '/chatbot' },
    { labelKey: 'dashboard.nav.help',         icon: 'help_outline',  path: '/help' },
]

</script>

<template>
    <div class="dashboard-shell">
        <aside class="sidebar" :aria-label="t('dashboard.sidebarLabel')">
            <div class="brand">
                <span class="brand-text">Entreprenly</span>
            </div>

            <a class="profile" href="#" @click.prevent>
                <span class="profile__avatar" aria-hidden="true">
                    <span class="material-icons">person</span>
                </span>
                <strong>{{ t('dashboard.welcome') }}</strong>
            </a>

            <nav>
                <ul class="navigation-list">
                    <li v-for="item in navItems" :key="item.labelKey">
                        <router-link
                            class="navigation-link"
                            active-class=""
                            exact-active-class="navigation-link--active"
                            :to="item.path"
                            :aria-label="t(item.labelKey)"
                        >
                            <span class="material-icons" aria-hidden="true">{{ item.icon }}</span>
                            <span>{{ t(item.labelKey) }}</span>
                        </router-link>
                    </li>
                </ul>
            </nav>

            <button class="logout-button" type="button">
                <span class="material-icons" aria-hidden="true">logout</span>
                <span>{{ t('dashboard.logout') }}</span>
            </button>
        </aside>

        <main class="dashboard-content">
            <router-view />
        </main>
    </div>
</template>

<style scoped>
.dashboard-shell {
    display: grid;
    min-height: 100dvh;
    grid-template-columns: 217px minmax(0, 1fr);
    background: var(--color-bg-page);
    color: var(--color-text-primary);
}

/* ── Sidebar ── */
.sidebar {
    position: sticky;
    top: 0;
    display: flex;
    height: 100dvh;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    background: var(--color-sidebar-bg);
    padding: clamp(16px, 2.78dvh, 30px) 29px;
    box-shadow: var(--color-sidebar-shadow);
    box-sizing: border-box;
}
.sidebar * { box-sizing: border-box; }

/* Brand */
.brand {
    display: flex;
    justify-content: center;
    margin-bottom: clamp(12px, 2dvh, 24px);
}
.brand-text {
    font-size: clamp(18px, 2dvh, 22px);
    font-weight: 700;
    color: var(--color-text-on-dark);
    letter-spacing: 0.5px;
}

/* Profile */
.profile {
    display: grid;
    justify-items: center;
    gap: clamp(10px, 1.85dvh, 20px);
    margin-block: clamp(10px, 3.97dvh, 43px) clamp(16px, 3.7dvh, 40px);
    text-align: center;
    text-decoration: none;
}
.profile__avatar {
    display: grid;
    width: clamp(60px, 9.26dvh, 100px);
    height: clamp(60px, 9.26dvh, 100px);
    place-items: center;
    border-radius: 999px;
    background: var(--color-sidebar-item-bg);
    box-shadow: 0px 2px 15px rgba(0, 0, 0, 0.2);
}
.profile__avatar .material-icons {
    width: clamp(32px, 4.76dvh, 51px);
    height: clamp(32px, 4.76dvh, 51px);
    color: #2b2927;
    font-size: clamp(32px, 4.76dvh, 51px);
}
.profile strong {
    font-size: clamp(16px, 2.22dvh, 24px);
    font-weight: 700;
    line-height: 1.3;
    color: var(--color-text-strong);
}

/* Nav */
.navigation-list {
    display: grid;
    gap: clamp(6px, 1.39dvh, 15px);
    margin: 0;
    padding: 0;
    list-style: none;
}
.navigation-link,
.logout-button {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: clamp(36px, 4.63dvh, 50px);
    align-items: center;
    gap: 12px;
    border: 0.6px solid #424242;
    border-radius: 11px;
    background: var(--color-sidebar-item-bg);
    color: var(--color-sidebar-item-text);
    cursor: pointer;
    font: inherit;
    font-size: clamp(13px, 1.48dvh, 16px);
    font-weight: 700;
    padding: 0 18px;
    text-align: left;
    text-decoration: none;
    transition: background 0.15s ease, color 0.15s ease;
}
.navigation-link:hover,
.navigation-link:focus-visible,
.logout-button:hover,
.logout-button:focus-visible {
    outline: 3px solid rgb(12 15 18 / 28%);
    outline-offset: 3px;
}
.navigation-link--active {
    border-color: var(--color-sidebar-item-active-bg);
    background: var(--color-sidebar-item-active-bg);
    color: var(--color-sidebar-item-active-text);
}
.navigation-link .material-icons,
.logout-button .material-icons {
    flex: 0 0 auto;
    width: 18px;
    height: 18px;
    font-size: 18px;
}
.navigation-link span:last-child,
.logout-button span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Logout */
.logout-button {
    justify-content: center;
    margin-top: auto;
    height: clamp(40px, 5.19dvh, 56px);
    border-color: var(--color-card-border);
    border-radius: 999px;
    background: var(--color-logout-bg);
    color: var(--color-logout-text);
    font-size: clamp(12px, 1.3dvh, 14px);
    font-weight: 600;
}

/* Content */
.dashboard-content {
    min-width: 0;
    padding: 42px 44px 56px;
    background: var(--color-bg-page);
    color: var(--color-text-primary);
}

/* Responsive */
@media (max-width: 1080px) {
    .dashboard-shell { grid-template-columns: 1fr; }
    .sidebar { position: relative; height: auto; padding: 22px; }
    .profile { margin-block: 8px; }
    .navigation-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .dashboard-content { padding: 24px 20px 36px; }
}
@media (max-width: 768px) {
    .dashboard-content { padding: 16px 14px 28px; }
}
@media (max-width: 620px) {
    .navigation-list { grid-template-columns: 1fr; }
    .dashboard-content { padding: 12px 10px 24px; }
}
</style>
