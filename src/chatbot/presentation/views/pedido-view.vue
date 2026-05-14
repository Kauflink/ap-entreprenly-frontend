<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import PedidoCard from '../components/pedido-card.vue'
import useChatbotStore from 'chatbot-bc-aplicaciones-web/src/chatbot/application/chatbot.store.js'

const { t } = useI18n()
const router  = useRouter()
const confirm = useConfirm()
const toast   = useToast()
const store   = useChatbotStore()

const filtroEstado = ref('todos')

const opcionesFiltro = [
  { label: 'Todos',        value: 'todos' },
  { label: 'Pendientes',   value: 'pendiente_pago' },
  { label: 'Por validar',  value: 'pago_reportado' },
  { label: 'Aprobados',    value: 'aprobado' },
  { label: 'Cancelados',   value: 'cancelado' }
]

onMounted(() => {
  store.fetchPedidos()
  store.fetchPagos()
  store.fetchClientes()
})

const pedidosFiltrados = computed(() => {
  if (filtroEstado.value === 'todos') return store.pedidos
  return store.pedidos.filter(p => p.estado === filtroEstado.value)
})

function verDetalle(pedido) {
  router.push({ name: 'chatbot-pago', params: { id: pedido.id } })
}

function confirmarAprobar(pedido) {
  confirm.require({
    message: t('pago.confirmacion_aprobar'),
    header: 'Confirmar aprobación',
    icon: 'pi pi-check-circle',
    acceptLabel: 'Aprobar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-success',
    accept: () => {
      store.aprobarPago(pedido.id).then(() => {
        toast.add({ severity: 'success', summary: '¡Aprobado!', detail: `Pedido #${pedido.id} aprobado correctamente.`, life: 3000 })
      })
    }
  })
}

function confirmarRechazar(pedido) {
  confirm.require({
    message: t('pago.confirmacion_rechazar'),
    header: 'Rechazar pago',
    icon: 'pi pi-times-circle',
    acceptLabel: 'Sí, rechazar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => {
      store.rechazarPago(pedido.id).then(() => {
        toast.add({ severity: 'warn', summary: 'Rechazado', detail: `Pedido #${pedido.id} cancelado.`, life: 3000 })
      })
    }
  })
}
</script>

<template>
  <div>
    <h1 class="mb-4" style="color: #F38313;">{{ t('pedido.title') }}</h1>

    <!-- Filtro de estado -->
    <div class="mb-4">
      <pv-select-button
        v-model="filtroEstado"
        :options="opcionesFiltro"
        option-label="label"
        option-value="value"
      />
    </div>

    <!-- Sin resultados -->
    <div v-if="pedidosFiltrados.length === 0" class="text-center py-6" style="color: #aaa;">
      <i class="pi pi-inbox text-4xl mb-2" />
      <p>No hay pedidos en esta categoría</p>
    </div>

    <!-- Lista de pedidos -->
    <pedido-card
      v-for="pedido in pedidosFiltrados"
      :key="pedido.id"
      :pedido="pedido"
      @ver-detalle="verDetalle"
      @aprobar="confirmarAprobar"
      @rechazar="confirmarRechazar"
    />
  </div>
</template>
