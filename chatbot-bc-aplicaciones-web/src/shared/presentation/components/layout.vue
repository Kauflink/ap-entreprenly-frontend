<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const drawerVisible = ref(false)

const navItems = [
  { label: 'nav.home',     path: '/home',              icon: 'pi-home' },
  { label: 'nav.pedidos',  path: '/chatbot-pedidos',   icon: 'pi-list' },
  { label: 'nav.catalogo', path: '/chatbot-catalogo',  icon: 'pi-shop' },
  { label: 'nav.chat',     path: '/chatbot-chat',      icon: 'pi-comments' },
  { label: 'nav.ayuda',    path: '/ayuda',             icon: 'pi-question-circle' }
]
</script>

<template>
  <pv-toast />
  <pv-confirm-dialog />

  <div class="header">
    <pv-toolbar style="background-color: #F38313; border-radius: 0;">
      <template #start>
        <pv-button
          icon="pi pi-bars"
          text
          style="color: white;"
          @click="drawerVisible = true"
        />
        <span style="color: white; font-weight: 700; font-size: 1.2rem; margin-left: 0.5rem;">
          Entreprenly
        </span>
      </template>
      <template #end>
        <div class="flex gap-2 mr-2">
          <router-link
            v-for="item in navItems"
            :key="item.label"
            :to="item.path"
            style="color: white; font-size: 0.9rem; padding: 0.4rem 0.75rem; border-radius: 4px; transition: background 0.2s;"
            active-class="nav-active"
          >
            {{ t(item.label) }}
          </router-link>
        </div>
      </template>
    </pv-toolbar>
  </div>

  <pv-drawer v-model:visible="drawerVisible" header="Menú">
    <div class="flex flex-column gap-1 mt-2">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.path"
        class="flex align-items-center gap-2 p-3"
        style="border-radius: 6px; transition: background 0.2s;"
        @click="drawerVisible = false"
      >
        <i :class="`pi ${item.icon}`" style="color: #F38313;" />
        <span>{{ t(item.label) }}</span>
      </router-link>
    </div>
  </pv-drawer>

  <div class="main-content">
    <router-view />
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.main-content {
  margin-top: 60px;
  padding: 1.5rem;
}

.nav-active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
