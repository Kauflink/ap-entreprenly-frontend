<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import useChatbotStore from '@/chatbot/application/chatbot.store.js'

const { t } = useI18n()
const router = useRouter()
const store = useChatbotStore()

onMounted(() => {
  store.fetchPedidos()
  store.fetchClientes()
})

const pedidosPendientes = computed(() =>
  store.pedidos.filter(p => p.estado === 'pendiente_pago')
)

const pedidosPorValidar = computed(() =>
  store.pedidos.filter(p => p.estado === 'pago_reportado')
)

const pedidosAprobadosHoy = computed(() => {
  const hoy = new Date().toDateString()
  return store.pedidos.filter(p =>
    p.estado === 'aprobado' && new Date(p.fechaCreacion).toDateString() === hoy
  )
})

const clientesConAlertas = computed(() =>
  store.clientes.filter(c => c.rechazos >= 2)
)

function irAValidarPago(pedido) {
  router.push({ name: 'chatbot-pago', params: { id: pedido.id } })
}

function getEstadoSeverity(estado) {
  const mapa = {
    pendiente_pago: 'warn',
    pago_reportado: 'info',
    aprobado: 'success',
    cancelado: 'danger'
  }
  return mapa[estado] ?? 'secondary'
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div>
    <h1 class="mb-4" style="color: #F38313;">{{ t('home.title') }}</h1>

    <!-- Tarjetas de resumen -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <pv-card class="text-center">
          <template #content>
            <div class="text-4xl font-bold mb-1" style="color: #F38313;">
              {{ pedidosPendientes.length }}
            </div>
            <div class="text-sm text-gray-500">{{ t('home.pendientes') }}</div>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-3">
        <pv-card class="text-center">
          <template #content>
            <div class="text-4xl font-bold mb-1 text-blue-500">
              {{ pedidosPorValidar.length }}
            </div>
            <div class="text-sm text-gray-500">{{ t('home.por_validar') }}</div>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-3">
        <pv-card class="text-center">
          <template #content>
            <div class="text-4xl font-bold mb-1 text-green-500">
              {{ pedidosAprobadosHoy.length }}
            </div>
            <div class="text-sm text-gray-500">{{ t('home.aprobados_hoy') }}</div>
          </template>
        </pv-card>
      </div>

      <div class="col-12 md:col-3">
        <pv-card class="text-center">
          <template #content>
            <div class="text-4xl font-bold mb-1 text-red-500">
              {{ clientesConAlertas.length }}
            </div>
            <div class="text-sm text-gray-500">{{ t('home.alertas') }}</div>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Pagos por validar -->
    <pv-card class="mb-4">
      <template #title>
        <span>
          <i class="pi pi-credit-card mr-2" style="color: #F38313;" />
          {{ t('home.validar_pago') }}
        </span>
      </template>
      <template #content>
        <div v-if="pedidosPorValidar.length === 0" class="text-center py-4" style="color: #aaa;">
          <i class="pi pi-check-circle text-3xl mb-2" />
          <p>{{ t('home.sin_pendientes') }}</p>
        </div>

        <pv-data-table v-else :value="pedidosPorValidar" class="p-datatable-sm">
          <pv-column field="clienteNombre" :header="t('pedido.cliente')" />
          <pv-column :header="t('pedido.total')">
            <template #body="{ data }">
              <span class="font-semibold" style="color: #F38313;">
                S/ {{ Number(data.total).toFixed(2) }}
              </span>
            </template>
          </pv-column>
          <pv-column :header="t('pedido.fecha')">
            <template #body="{ data }">
              {{ formatearFecha(data.fechaCreacion) }}
            </template>
          </pv-column>
          <pv-column :header="t('pedido.estado')">
            <template #body="{ data }">
              <pv-tag
                :value="t(`pedido.estados.${data.estado}`)"
                :severity="getEstadoSeverity(data.estado)"
              />
            </template>
          </pv-column>
          <pv-column :header="t('pedido.acciones')">
            <template #body="{ data }">
              <pv-button
                :label="t('home.validar_pago')"
                icon="pi pi-check-circle"
                size="small"
                style="background-color: #F38313; border-color: #F38313;"
                @click="irAValidarPago(data)"
              />
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <!-- Alertas: clientes con 2+ rechazos -->
    <pv-card v-if="clientesConAlertas.length > 0">
      <template #title>
        <span class="text-red-500">
          <i class="pi pi-exclamation-triangle mr-2" />
          {{ t('home.alertas') }}
        </span>
      </template>
      <template #content>
        <div
          v-for="cliente in clientesConAlertas"
          :key="cliente.id"
          class="flex align-items-center gap-3 p-2 mb-2"
          style="background: #fff3cd; border-radius: 6px;"
        >
          <i class="pi pi-user" style="color: #F38313;" />
          <span class="font-semibold">{{ cliente.nombre }}</span>
          <span class="text-sm" style="color: #888;">{{ cliente.telefono }}</span>
          <pv-tag :value="`${cliente.rechazos} rechazos`" severity="danger" />
        </div>
      </template>
    </pv-card>
  </div>
</template>
