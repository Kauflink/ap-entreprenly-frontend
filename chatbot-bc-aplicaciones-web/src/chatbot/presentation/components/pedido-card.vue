<script setup>
import { computed } from 'vue'

const props = defineProps({
  pedido: { type: Object, required: true }
})

const emit = defineEmits(['ver-detalle', 'aprobar', 'rechazar'])

const estadoLabel = computed(() => {
  const mapa = {
    pendiente_pago: 'Pendiente de pago',
    pago_reportado: 'Pago reportado',
    aprobado:       'Aprobado',
    cancelado:      'Cancelado'
  }
  return mapa[props.pedido.estado] ?? props.pedido.estado
})

const estadoSeverity = computed(() => {
  const mapa = {
    pendiente_pago: 'warn',
    pago_reportado: 'info',
    aprobado:       'success',
    cancelado:      'danger'
  }
  return mapa[props.pedido.estado] ?? 'secondary'
})

const tiempoEnRojo = computed(() =>
  props.pedido.minutosRestantes !== undefined && props.pedido.minutosRestantes < 15
)
</script>

<template>
  <pv-card class="mb-3">
    <template #content>
      <div class="flex justify-content-between align-items-start mb-2">
        <div>
          <div class="font-semibold">{{ pedido.clienteNombre }}</div>
          <div class="text-sm" style="color: #888;">{{ pedido.clienteTelefono }}</div>
          <div class="mt-1">
            <span class="font-bold" style="color: #F38313;">
              S/ {{ Number(pedido.total).toFixed(2) }}
            </span>
            <span class="ml-2 text-sm" style="color: #aaa;">
              {{ pedido.items?.length ?? 0 }} producto(s)
            </span>
          </div>
        </div>
        <pv-tag :value="estadoLabel" :severity="estadoSeverity" />
      </div>

      <!-- aviso de tiempo restante cuando está pendiente de pago -->
      <div
        v-if="pedido.estado === 'pendiente_pago'"
        class="text-sm mb-2"
        :style="tiempoEnRojo ? 'color: #e53935;' : 'color: #888;'"
      >
        <i class="pi pi-clock mr-1" />
        Expira en {{ pedido.minutosRestantes }} min
      </div>

      <div class="flex gap-2 flex-wrap">
        <pv-button
          label="Ver detalle"
          icon="pi pi-eye"
          size="small"
          text
          @click="emit('ver-detalle', pedido)"
        />
        <pv-button
          v-if="pedido.estado === 'pago_reportado'"
          label="Aprobar"
          icon="pi pi-check"
          size="small"
          severity="success"
          @click="emit('aprobar', pedido)"
        />
        <pv-button
          v-if="pedido.estado === 'pago_reportado'"
          label="Rechazar"
          icon="pi pi-times"
          size="small"
          severity="danger"
          @click="emit('rechazar', pedido)"
        />
      </div>
    </template>
  </pv-card>
</template>
