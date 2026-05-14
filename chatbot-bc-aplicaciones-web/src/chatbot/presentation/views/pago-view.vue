<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import useChatbotStore from '@/chatbot/application/chatbot.store.js'

const { t }   = useI18n()
const route   = useRoute()
const router  = useRouter()
const confirm = useConfirm()
const toast   = useToast()
const store   = useChatbotStore()

const pedidoId  = parseInt(route.params.id)
const procesando = ref(false)

onMounted(() => {
  if (!store.pedidosLoaded) store.fetchPedidos()
  if (!store.pagosLoaded)   store.fetchPagos()
})

const pedido = computed(() => store.getPedidoById(pedidoId))
const pago   = computed(() => store.getPagoByPedidoId(pedidoId))

function formatearFecha(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

function aprobar() {
  confirm.require({
    message: t('pago.confirmacion_aprobar'),
    header: 'Confirmar aprobación',
    icon: 'pi pi-check-circle',
    acceptLabel: 'Sí, aprobar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-success',
    accept: () => {
      procesando.value = true
      store.aprobarPago(pedidoId)
        .then(() => {
          toast.add({ severity: 'success', summary: '¡Pago aprobado!', detail: 'El pedido fue aprobado correctamente.', life: 3000 })
          router.push({ name: 'chatbot-pedidos' })
        })
        .finally(() => { procesando.value = false })
    }
  })
}

function rechazar() {
  confirm.require({
    message: t('pago.confirmacion_rechazar'),
    header: 'Rechazar pago',
    icon: 'pi pi-times-circle',
    acceptLabel: 'Sí, rechazar',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: () => {
      procesando.value = true
      store.rechazarPago(pedidoId)
        .then(() => {
          toast.add({ severity: 'warn', summary: 'Pago rechazado', detail: 'El pedido quedó cancelado.', life: 3000 })
          router.push({ name: 'chatbot-pedidos' })
        })
        .finally(() => { procesando.value = false })
    }
  })
}
</script>

<template>
  <div>
    <!-- Cabecera con botón volver -->
    <div class="flex align-items-center gap-2 mb-4">
      <pv-button icon="pi pi-arrow-left" text @click="router.back()" />
      <h1 style="color: #F38313;">{{ t('pago.title') }}</h1>
    </div>

    <div v-if="!pedido" class="text-center py-6" style="color: #aaa;">
      <p>Pedido no encontrado</p>
    </div>

    <div v-else class="grid">

      <!-- Columna izquierda: resumen del pedido -->
      <div class="col-12 md:col-6">
        <pv-card class="mb-4">
          <template #title>Pedido #{{ pedido.id }}</template>
          <template #content>
            <div class="flex flex-column gap-2">
              <div class="flex justify-content-between">
                <span style="color: #888;">Cliente</span>
                <span class="font-semibold">{{ pedido.clienteNombre }}</span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">Teléfono</span>
                <span>{{ pedido.clienteTelefono }}</span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">Fecha</span>
                <span>{{ formatearFecha(pedido.fechaCreacion) }}</span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">Expira</span>
                <span :style="pedido.estaVencido ? 'color: #e53935;' : ''">
                  {{ formatearFecha(pedido.fechaExpiracion) }}
                </span>
              </div>

              <hr class="my-1" />

              <!-- Items del pedido -->
              <div
                v-for="item in pedido.items"
                :key="item.productoId"
                class="flex justify-content-between text-sm"
              >
                <span>{{ item.nombre }} × {{ item.cantidad }}</span>
                <span>S/ {{ Number(item.precioUnitario * item.cantidad).toFixed(2) }}</span>
              </div>

              <hr class="my-1" />

              <div class="flex justify-content-between font-bold">
                <span>Total</span>
                <span style="color: #F38313;">S/ {{ Number(pedido.total).toFixed(2) }}</span>
              </div>
            </div>
          </template>
        </pv-card>
      </div>

      <!-- Columna derecha: comprobante y acciones -->
      <div class="col-12 md:col-6">
        <pv-card class="mb-4">
          <template #title>Comprobante de pago</template>
          <template #content>
            <div v-if="!pago" class="text-center py-4" style="color: #aaa;">
              <i class="pi pi-clock text-3xl mb-2" />
              <p>El cliente aún no ha enviado su comprobante</p>
            </div>

            <div v-else class="flex flex-column gap-2">
              <div class="flex justify-content-between">
                <span style="color: #888;">{{ t('pago.metodo') }}</span>
                <span class="font-semibold" style="text-transform: capitalize;">{{ pago.metodo }}</span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">{{ t('pago.monto') }}</span>
                <span class="font-bold" style="color: #F38313;">
                  S/ {{ Number(pago.monto).toFixed(2) }}
                </span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">{{ t('pago.fecha_reporte') }}</span>
                <span>{{ formatearFecha(pago.fechaReporte) }}</span>
              </div>
              <div class="flex justify-content-between">
                <span style="color: #888;">{{ t('pago.comprobante') }}</span>
                <span style="color: #1976d2;">{{ pago.comprobante ?? 'No adjuntado' }}</span>
              </div>
            </div>
          </template>
        </pv-card>

        <!-- Botones de acción -->
        <div v-if="pedido.estado === 'pago_reportado'" class="flex gap-3">
          <pv-button
            :label="t('pago.aprobar_pago')"
            icon="pi pi-check"
            severity="success"
            :loading="procesando"
            class="flex-1"
            @click="aprobar"
          />
          <pv-button
            :label="t('pago.rechazar_pago')"
            icon="pi pi-times"
            severity="danger"
            :loading="procesando"
            class="flex-1"
            @click="rechazar"
          />
        </div>

        <div v-else-if="pedido.estado === 'aprobado'" class="text-center">
          <pv-tag value="✓ Pago aprobado" severity="success" style="font-size: 1rem; padding: 0.75rem 1.5rem;" />
        </div>

        <div v-else-if="pedido.estado === 'cancelado'" class="text-center">
          <pv-tag value="✗ Pedido cancelado" severity="danger" style="font-size: 1rem; padding: 0.75rem 1.5rem;" />
        </div>

        <div v-else class="text-center" style="color: #aaa;">
          <i class="pi pi-hourglass mr-2" />
          Esperando que el cliente reporte el pago
        </div>
      </div>
    </div>
  </div>
</template>
