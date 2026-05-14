<script setup>
defineProps({
  mensaje:   { type: String,  required: true },
  esCliente: { type: Boolean, default: false },
  hora:      { type: String,  default: '' }
})
</script>

<template>
  <div :class="['flex mb-2', esCliente ? 'justify-content-start' : 'justify-content-end']">
    <div
      class="px-3 py-2"
      style="max-width: 72%; border-radius: 12px; font-size: 0.9rem; word-break: break-word;"
      :style="esCliente
        ? 'background: #f0f0f0; border-bottom-left-radius: 2px;'
        : 'background: #F38313; color: white; border-bottom-right-radius: 2px;'"
    >
      <div>{{ mensaje }}</div>
      <div
        class="text-xs mt-1"
        :style="esCliente ? 'color: #999;' : 'color: rgba(255,255,255,0.7);'"
      >
        {{ hora }}
      </div>
    </div>
  </div>
</template>
