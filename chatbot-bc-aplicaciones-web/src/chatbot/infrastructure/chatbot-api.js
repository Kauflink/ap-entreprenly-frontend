// Sigue el patrón de inventory-api.js del compañero: extiende BaseApi, endpoints privados con #
import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js'

const pedidoPath   = import.meta.env.VITE_PEDIDO_ENDPOINT_PATH
const clientePath  = import.meta.env.VITE_CLIENTE_ENDPOINT_PATH
const pagoPath     = import.meta.env.VITE_PAGO_ENDPOINT_PATH
const productoPath = import.meta.env.VITE_PRODUCTO_ENDPOINT_PATH

export class ChatbotApi extends BaseApi {
  #pedidoEndpoint
  #clienteEndpoint
  #pagoEndpoint
  #productoEndpoint

  constructor() {
    super()
    this.#pedidoEndpoint   = new BaseEndpoint(this, pedidoPath)
    this.#clienteEndpoint  = new BaseEndpoint(this, clientePath)
    this.#pagoEndpoint     = new BaseEndpoint(this, pagoPath)
    this.#productoEndpoint = new BaseEndpoint(this, productoPath)
  }

  // PEDIDOS
  getPedidos()           { return this.#pedidoEndpoint.getAll() }
  getPedidoById(id)      { return this.#pedidoEndpoint.getById(id) }
  createPedido(resource) { return this.#pedidoEndpoint.create(resource) }
  updatePedido(resource) { return this.#pedidoEndpoint.update(resource.id, resource) }
  deletePedido(id)       { return this.#pedidoEndpoint.delete(id) }

  // CLIENTES
  getClientes()           { return this.#clienteEndpoint.getAll() }
  getClienteById(id)      { return this.#clienteEndpoint.getById(id) }
  createCliente(resource) { return this.#clienteEndpoint.create(resource) }
  updateCliente(resource) { return this.#clienteEndpoint.update(resource.id, resource) }

  // PAGOS
  getPagos()           { return this.#pagoEndpoint.getAll() }
  getPagoById(id)      { return this.#pagoEndpoint.getById(id) }
  createPago(resource) { return this.#pagoEndpoint.create(resource) }
  updatePago(resource) { return this.#pagoEndpoint.update(resource.id, resource) }

  // PRODUCTOS (catálogo – se recarga cada 30 seg, regla de negocio)
  getProductos() { return this.#productoEndpoint.getAll() }
}
