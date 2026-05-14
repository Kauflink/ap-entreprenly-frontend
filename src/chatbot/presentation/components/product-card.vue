<script setup>
import { computed } from 'vue'

const props = defineProps({
  producto: { type: Object, required: true }
})

const sinStock = computed(() => props.producto.stock <= 0)

const stockLabel = computed(() => {
  if (sinStock.value) return 'Sin stock'
  return props.producto.tipo === 'peso'
    ? `${props.producto.stock} kg`
    : `${props.producto.stock} und.`
})

const stockSeverity = computed(() => sinStock.value ? 'danger' : 'success')
</script>

<template>
  <pv-card class="h-full">
    <template #content>
      <div class="flex flex-column gap-2">
        <div class="font-semibold">{{ producto.nombre }}</div>
        <div class="text-sm" style="color: #777;">{{ producto.descripcion }}</div>

        <div class="flex justify-content-between align-items-center mt-1">
          <span class="font-bold" style="color: #F38313;">
            {{ producto.precioFormateado ?? `S/ ${Number(producto.precio).toFixed(2)}` }}
          </span>
          <pv-tag :value="stockLabel" :severity="stockSeverity" />
        </div>

        <div class="text-xs mt-1" style="color: #aaa;">
          <i :class="`pi ${producto.tipo === 'peso' ? 'pi-wifi' : 'pi-box'} mr-1`" />
          {{ producto.tipo === 'peso' ? 'Stock IoT (balanza)' : 'Stock por unidades' }}
        </div>
      </div>
    </template>
  </pv-card>
</template>
