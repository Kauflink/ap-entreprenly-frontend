// Sigue el patrón de inventory.store.js del compañero: defineStore con composition API
// Implementa: timeout 60 min, validación manual de pagos, caché catálogo 30 seg, alerta rechazos
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ChatbotApi } from '@/chatbot/infrastructure/chatbot-api.js'
import { PedidoAssembler } from '@/chatbot/infrastructure/pedido-assembler.js'
import { ProductoAssembler } from '@/chatbot/infrastructure/producto-assembler.js'
import { ClienteAssembler } from '@/chatbot/infrastructure/cliente-assembler.js'
import { PagoAssembler } from '@/chatbot/infrastructure/pago-assembler.js'
import { Pedido } from '@/chatbot/domain/model/pedido-entity.js'
import { Pago } from '@/chatbot/domain/model/pago-entity.js'

const chatbotApi = new ChatbotApi()

// Timestamp del último fetch del catálogo para respetar el límite de 30 seg
let ultimoFetchCatalogo = 0
const CACHE_CATALOGO_MS = 30 * 1000

const useChatbotStore = defineStore('chatbot', () => {
  const pedidos  = ref([])
  const productos = ref([])
  const clientes = ref([])
  const pagos    = ref([])

  const pedidosLoaded   = ref(false)
  const productosLoaded = ref(false)
  const clientesLoaded  = ref(false)
  const pagosLoaded     = ref(false)

  const errors = ref([])

  const pedidosPendientes = computed(() =>
    pedidos.value.filter(p => p.estado === Pedido.Estado.PENDIENTE_PAGO)
  )

  const pedidosPorValidar = computed(() =>
    pedidos.value.filter(p => p.estado === Pedido.Estado.PAGO_REPORTADO)
  )

  const clientesConAlertas = computed(() =>
    clientes.value.filter(c => c.rechazos >= 2)
  )

  // --- PEDIDOS ---

  function fetchPedidos() {
    chatbotApi.getPedidos().then(response => {
      pedidos.value = PedidoAssembler.toEntitiesFromResponse(response)
      pedidosLoaded.value = true
      // registrar timeout para cada pedido pendiente que aún no venció
      pedidos.value
        .filter(p => p.estado === Pedido.Estado.PENDIENTE_PAGO && !p.estaVencido)
        .forEach(p => _programarTimeout(p))
    }).catch(error => errors.value.push(error))
  }

  function getPedidoById(id) {
    return pedidos.value.find(p => p.id === parseInt(id))
  }

  // Regla: aprobación manual del comerciante → descuenta stock y cierra el pedido
  function aprobarPago(pedidoId) {
    const pedido = getPedidoById(pedidoId)
    if (!pedido) return Promise.reject(new Error('Pedido no encontrado'))

    const pedidoActualizado = { ...pedido, estado: Pedido.Estado.APROBADO }
    return chatbotApi.updatePedido(pedidoActualizado).then(response => {
      const idx = pedidos.value.findIndex(p => p.id === pedidoId)
      if (idx !== -1) pedidos.value[idx] = PedidoAssembler.toEntityFromResource(response.data)
      _actualizarPago(pedidoId, Pago.Estado.APROBADO)
    }).catch(error => errors.value.push(error))
  }

  // Regla: rechazo incrementa el contador del cliente; al llegar a 2 se activa alerta
  function rechazarPago(pedidoId) {
    const pedido = getPedidoById(pedidoId)
    if (!pedido) return Promise.reject(new Error('Pedido no encontrado'))

    const pedidoCancelado = { ...pedido, estado: Pedido.Estado.CANCELADO }
    return chatbotApi.updatePedido(pedidoCancelado).then(response => {
      const idx = pedidos.value.findIndex(p => p.id === pedidoId)
      if (idx !== -1) pedidos.value[idx] = PedidoAssembler.toEntityFromResource(response.data)

      _incrementarRechazos(pedido.clienteId)
      _actualizarPago(pedidoId, Pago.Estado.RECHAZADO)
    }).catch(error => errors.value.push(error))
  }

  // Timeout de 60 min: cancela el pedido automáticamente si no se paga a tiempo
  function _programarTimeout(pedido) {
    const msRestantes = new Date(pedido.fechaExpiracion) - new Date()
    if (msRestantes <= 0) return

    setTimeout(() => {
      const p = getPedidoById(pedido.id)
      if (p && p.estado === Pedido.Estado.PENDIENTE_PAGO) {
        const cancelado = { ...p, estado: Pedido.Estado.CANCELADO }
        chatbotApi.updatePedido(cancelado).then(r => {
          const idx = pedidos.value.findIndex(pp => pp.id === p.id)
          if (idx !== -1) pedidos.value[idx] = PedidoAssembler.toEntityFromResource(r.data)
        }).catch(err => errors.value.push(err))
      }
    }, msRestantes)
  }

  function _actualizarPago(pedidoId, nuevoEstado) {
    const pago = pagos.value.find(p => p.pedidoId === pedidoId)
    if (!pago) return
    const pagoActualizado = { ...pago, estado: nuevoEstado }
    chatbotApi.updatePago(pagoActualizado).then(r => {
      const pi = pagos.value.findIndex(p => p.id === pago.id)
      if (pi !== -1) pagos.value[pi] = PagoAssembler.toEntityFromResource(r.data)
    }).catch(err => errors.value.push(err))
  }

  function _incrementarRechazos(clienteId) {
    const cliente = clientes.value.find(c => c.id === clienteId)
    if (!cliente) return
    const clienteActualizado = { ...cliente, rechazos: cliente.rechazos + 1 }
    chatbotApi.updateCliente(clienteActualizado).then(r => {
      const ci = clientes.value.findIndex(c => c.id === clienteId)
      if (ci !== -1) clientes.value[ci] = ClienteAssembler.toEntityFromResource(r.data)
    }).catch(err => errors.value.push(err))
  }

  // --- PRODUCTOS (catálogo con caché de 30 seg) ---

  function fetchProductos() {
    const ahora = Date.now()
    if (productosLoaded.value && ahora - ultimoFetchCatalogo < CACHE_CATALOGO_MS) return

    chatbotApi.getProductos().then(response => {
      productos.value = ProductoAssembler.toEntitiesFromResponse(response)
      productosLoaded.value = true
      ultimoFetchCatalogo = Date.now()
    }).catch(error => errors.value.push(error))
  }

  // --- CLIENTES ---

  function fetchClientes() {
    chatbotApi.getClientes().then(response => {
      clientes.value = ClienteAssembler.toEntitiesFromResponse(response)
      clientesLoaded.value = true
    }).catch(error => errors.value.push(error))
  }

  // --- PAGOS ---

  function fetchPagos() {
    chatbotApi.getPagos().then(response => {
      pagos.value = PagoAssembler.toEntitiesFromResponse(response)
      pagosLoaded.value = true
    }).catch(error => errors.value.push(error))
  }

  function getPagoByPedidoId(pedidoId) {
    return pagos.value.find(p => p.pedidoId === pedidoId)
  }

  return {
    pedidos, productos, clientes, pagos,
    pedidosLoaded, productosLoaded, clientesLoaded, pagosLoaded,
    errors,
    pedidosPendientes, pedidosPorValidar, clientesConAlertas,
    fetchPedidos, getPedidoById, aprobarPago, rechazarPago,
    fetchProductos,
    fetchClientes,
    fetchPagos, getPagoByPedidoId
  }
})

export default useChatbotStore
