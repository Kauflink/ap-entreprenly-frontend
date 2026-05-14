<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import ChatBubble from '../components/chat-bubble.vue'
import useChatbotStore from '@/chatbot/application/chatbot.store.js'

const { t } = useI18n()
const store = useChatbotStore()

onMounted(() => {
  store.fetchPedidos()
  store.fetchClientes()
})

const conversacionSeleccionada = ref(null)

// Genera la lista de conversaciones a partir de pedidos (los más recientes primero)
const conversaciones = computed(() =>
  [...store.pedidos]
    .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
    .slice(0, 10)
    .map(p => ({
      pedidoId: p.id,
      clienteNombre:   p.clienteNombre,
      clienteTelefono: p.clienteTelefono,
      estado:          p.estado,
      ultimoMensaje:   _ultimoMensaje(p),
      hora: new Date(p.fechaCreacion).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    }))
)

// Simula el hilo de mensajes de WhatsApp para un pedido
const mensajesActivos = computed(() => {
  if (!conversacionSeleccionada.value) return []
  const p = store.getPedidoById(conversacionSeleccionada.value.pedidoId)
  return p ? _generarHilo(p) : []
})

function _ultimoMensaje(pedido) {
  const mapa = {
    pendiente_pago: 'Pedido registrado. Esperando pago...',
    pago_reportado: '📸 Ya te envié mi comprobante',
    aprobado:       '✅ ¡Gracias! Pedido confirmado',
    cancelado:      'Pedido cancelado por inactividad'
  }
  return mapa[pedido.estado] ?? ''
}

function _hora(base, minutosExtra) {
  return new Date(new Date(base).getTime() + minutosExtra * 60000)
    .toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function _generarHilo(pedido) {
  const msgs = []
  const base = pedido.fechaCreacion

  msgs.push({ texto: 'Hola! Quiero hacer un pedido 😊', esCliente: true, hora: _hora(base, 0) })
  msgs.push({ texto: '¡Hola! Bienvenido/a. Te muestro nuestro catálogo de hoy:', esCliente: false, hora: _hora(base, 0) })

  pedido.items.forEach((item, i) => {
    const precio = item.tipo === 'peso' ? `S/${item.precioUnitario}/kg` : `S/${item.precioUnitario} c/u`
    msgs.push({ texto: `📦 ${item.nombre} – ${precio}`, esCliente: false, hora: _hora(base, i) })
  })

  const resumenItems = pedido.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')
  msgs.push({ texto: `Quiero: ${resumenItems}`, esCliente: true, hora: _hora(base, 2) })
  msgs.push({
    texto: `Tu pedido es S/${Number(pedido.total).toFixed(2)}. Paga por Yape/Plin al 900-000-000 y envía tu comprobante 📲`,
    esCliente: false,
    hora: _hora(base, 3)
  })

  if (pedido.estado === 'pago_reportado' || pedido.estado === 'aprobado') {
    msgs.push({ texto: '📸 Acá está mi comprobante', esCliente: true, hora: _hora(base, 10) })
  }
  if (pedido.estado === 'aprobado') {
    msgs.push({ texto: '✅ ¡Pago confirmado! Tu pedido está listo. ¡Gracias por tu compra! 🎉', esCliente: false, hora: _hora(base, 15) })
  }
  if (pedido.estado === 'cancelado') {
    msgs.push({ texto: 'Tu pedido fue cancelado por no recibir el pago a tiempo. Puedes hacer un nuevo pedido cuando quieras.', esCliente: false, hora: _hora(base, 61) })
  }

  return msgs
}

function seleccionar(conv) {
  conversacionSeleccionada.value = conv
}

function getEstadoSeverity(estado) {
  const mapa = { pendiente_pago: 'warn', pago_reportado: 'info', aprobado: 'success', cancelado: 'danger' }
  return mapa[estado] ?? 'secondary'
}

function getEstadoLabel(estado) {
  const mapa = { pendiente_pago: 'Pendiente', pago_reportado: 'Pago enviado', aprobado: 'Aprobado', cancelado: 'Cancelado' }
  return mapa[estado] ?? estado
}
</script>

<template>
  <div>
    <h1 class="mb-4" style="color: #F38313;">{{ t('chat.title') }}</h1>

    <div class="grid" style="height: calc(100vh - 160px); border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">

      <!-- Panel izquierdo: lista de conversaciones -->
      <div class="col-4 p-0" style="border-right: 1px solid #e0e0e0; overflow-y: auto; background: white;">
        <div v-if="conversaciones.length === 0" class="text-center p-4" style="color: #aaa;">
          {{ t('chat.sin_conversaciones') }}
        </div>

        <div
          v-for="conv in conversaciones"
          :key="conv.pedidoId"
          class="p-3 cursor-pointer"
          style="border-bottom: 1px solid #f5f5f5; transition: background 0.15s;"
          :style="conversacionSeleccionada?.pedidoId === conv.pedidoId ? 'background: #fff3e0;' : ''"
          @click="seleccionar(conv)"
        >
          <div class="flex justify-content-between align-items-start mb-1">
            <span class="font-semibold text-sm">{{ conv.clienteNombre }}</span>
            <span class="text-xs" style="color: #bbb;">{{ conv.hora }}</span>
          </div>
          <div class="text-xs mb-1" style="color: #888; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            {{ conv.ultimoMensaje }}
          </div>
          <pv-tag :value="getEstadoLabel(conv.estado)" :severity="getEstadoSeverity(conv.estado)" style="font-size: 0.65rem;" />
        </div>
      </div>

      <!-- Panel derecho: ventana de chat -->
      <div class="col-8 p-0 flex flex-column" style="background: #ece5dd;">

        <!-- Estado vacío -->
        <div v-if="!conversacionSeleccionada" class="flex align-items-center justify-content-center h-full">
          <div class="text-center" style="color: #aaa;">
            <i class="pi pi-comments text-5xl mb-3" style="color: #F38313; opacity: 0.35;" />
            <p>Selecciona una conversación</p>
          </div>
        </div>

        <template v-else>
          <!-- Cabecera del chat -->
          <div class="flex align-items-center gap-2 p-3" style="background: #F38313;">
            <div
              class="flex align-items-center justify-content-center font-bold"
              style="width: 36px; height: 36px; border-radius: 50%; background: white; color: #F38313;"
            >
              {{ conversacionSeleccionada.clienteNombre.charAt(0).toUpperCase() }}
            </div>
            <div>
              <div class="font-semibold" style="color: white;">{{ conversacionSeleccionada.clienteNombre }}</div>
              <div class="text-xs" style="color: rgba(255,255,255,0.8);">{{ conversacionSeleccionada.clienteTelefono }}</div>
            </div>
          </div>

          <!-- Mensajes -->
          <div class="flex-1 p-3 overflow-y-auto">
            <chat-bubble
              v-for="(msg, i) in mensajesActivos"
              :key="i"
              :mensaje="msg.texto"
              :es-cliente="msg.esCliente"
              :hora="msg.hora"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
