<script setup>
</script>

<template>
  <div class="flex flex-column align-items-center justify-content-center" style="min-height: 60vh;">
    <i class="pi pi-exclamation-circle text-6xl mb-4" style="color: #ccc;" />
    <h2 class="mb-2" style="color: #888;">Página no encontrada</h2>
    <p class="mb-4" style="color: #aaa;">La ruta que buscas no existe.</p>
    <router-link to="/home">
      <pv-button label="Volver al inicio" icon="pi pi-home" />
    </router-link>
  </div>
</template>
