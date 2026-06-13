<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import brandLogo from '@/assets/brand/brand-logo-light-transparent.png'
import useProfileStore from '@/profile/application/profile.store.js'
import useAuthStore from '@/auth/application/auth.store.js'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const profileStore = useProfileStore()
const { profile, fullName } = storeToRefs(profileStore)
const mobileMenuOpen = ref(false)

const navItems = [
    { labelKey: 'dashboard.nav.home',         icon: 'dashboard',          path: '/home' },
    { labelKey: 'dashboard.nav.products',     icon: 'inventory_2',        path: '/inventory-products' },
    { labelKey: 'dashboard.nav.lots',         icon: 'category',           path: '/inventory-lots' },
    { labelKey: 'dashboard.nav.sales',        icon: 'receipt_long',       path: '/sales' },
    { labelKey: 'dashboard.nav.subscription', icon: 'credit_card',        path: '/subscription' },
    { labelKey: 'dashboard.nav.orders',       icon: 'shopping_cart',      path: '/chatbot/orders' },
    { labelKey: 'dashboard.nav.chatbot',      icon: 'smart_toy',          path: '/chatbot' },
    { labelKey: 'dashboard.nav.help',         icon: 'help_outline',       path: '/help' },
]

function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
}

function closeMobileMenu() {
    mobileMenuOpen.value = false
}

function logout() {
    closeMobileMenu()
    authStore.logout()
    router.push('/login')
}

watch(() => route.fullPath, () => closeMobileMenu())
</script>

<template>
    <div class="dashboard-shell" :class="{ 'dashboard-shell--menu-open': mobileMenuOpen }">
        <header class="mobile-topbar">
            <img class="brand-logo brand-logo--mobile" :src="brandLogo" alt="Entreprenly" />
            <button
                class="mobile-menu-button"
                type="button"
                aria-controls="dashboard-sidebar"
                :aria-expanded="mobileMenuOpen"
                :aria-label="mobileMenuOpen ? t('dashboard.menu.close') : t('dashboard.menu.open')"
                @click="toggleMobileMenu"
            >
                <span class="material-icons" aria-hidden="true">
                    {{ mobileMenuOpen ? 'close' : 'menu' }}
                </span>
            </button>
        </header>

        <button
            v-if="mobileMenuOpen"
            class="sidebar-backdrop"
            type="button"
            :aria-label="t('dashboard.menu.close')"
            @click="closeMobileMenu"
        ></button>

        <aside
            id="dashboard-sidebar"
            class="sidebar"
            :class="{ 'sidebar--open': mobileMenuOpen }"
            :aria-label="t('dashboard.sidebarLabel')"
        >
            <div class="brand">
                <img class="brand-logo" :src="brandLogo" alt="Entreprenly" />
            </div>

            <router-link
                class="profile"
                active-class=""
                exact-active-class="profile--active"
                to="/profile"
                :aria-label="t('dashboard.currentUserLabel')"
                @click="closeMobileMenu"
            >
                <span class="profile__avatar" aria-hidden="true">
                    <img
                        v-if="profile.avatarUrl"
                        :src="profile.avatarUrl"
                        :alt="t('profile.userInfo.avatarAlt')"
                        class="profile__avatar-img"
                    />
                    <span v-else class="material-icons">person</span>
                </span>
                <strong>{{ fullName || t('dashboard.welcome') }}</strong>
            </router-link>

            <nav>
                <ul class="navigation-list">
                    <li v-for="item in navItems" :key="item.labelKey">
                        <router-link
                            class="navigation-link"
                            active-class=""
                            exact-active-class="navigation-link--active"
                            :to="item.path"
                            :aria-label="t(item.labelKey)"
                            @click="closeMobileMenu"
                        >
                            <span class="material-icons" aria-hidden="true">{{ item.icon }}</span>
                            <span>{{ t(item.labelKey) }}</span>
                        </router-link>
                    </li>
                </ul>
            </nav>

            <button class="logout-button" type="button" @click="logout">
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

.mobile-topbar,
.sidebar-backdrop {
    display: none;
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
    width: 100%;
    min-height: clamp(40px, 5.19dvh, 56px);
    align-items: center;
    justify-content: center;
    border: 1px solid var(--color-card-border);
    border-radius: 999px;
    background: var(--color-logout-bg);
    margin-bottom: clamp(12px, 2dvh, 24px);
    padding: 0 16px;
}

.brand-logo {
    display: block;
    width: min(100%, 132px);
    height: auto;
    object-fit: contain;
}

.brand-logo--mobile {
    width: 156px;
    max-height: 38px;
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
.profile__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 999px;
}
.profile--active .profile__avatar {
    outline: 3px solid var(--color-sidebar-item-active-bg);
    outline-offset: 3px;
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
    .dashboard-shell {
        grid-template-columns: 1fr;
    }

    .mobile-topbar {
        position: sticky;
        top: 0;
        z-index: 30;
        display: flex;
        min-height: 64px;
        align-items: center;
        justify-content: space-between;
        background: var(--color-sidebar-bg);
        padding: 0 16px;
        box-shadow: 0 8px 24px rgb(0 0 0 / 14%);
    }

    .mobile-menu-button {
        display: grid;
        width: 44px;
        height: 44px;
        place-items: center;
        border: 1px solid rgb(255 255 255 / 34%);
        border-radius: 12px;
        background: var(--color-sidebar-item-bg);
        color: var(--color-sidebar-item-text);
        cursor: pointer;
    }

    .mobile-menu-button .material-icons {
        width: 24px;
        height: 24px;
        font-size: 24px;
    }

    .mobile-menu-button:focus-visible {
        outline: 3px solid rgb(12 15 18 / 28%);
        outline-offset: 3px;
    }

    .sidebar-backdrop {
        position: fixed;
        inset: 0;
        z-index: 35;
        display: block;
        border: 0;
        background: rgb(0 0 0 / 42%);
        cursor: pointer;
    }

    .sidebar {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        z-index: 40;
        width: min(312px, 86vw);
        height: 100dvh;
        padding: 22px;
        transform: translateX(-104%);
        transition: transform 180ms ease;
    }

    .sidebar--open {
        transform: translateX(0);
    }

    .brand {
        justify-content: flex-start;
    }

    .profile {
        justify-items: start;
        text-align: left;
    }

    .navigation-list {
        grid-template-columns: 1fr;
    }

    .dashboard-content { padding: 16px 14px 28px; }
}
@media (max-width: 620px) {
    .navigation-list { grid-template-columns: 1fr; }
    .dashboard-content { padding: 12px 10px 24px; }
}
</style>
