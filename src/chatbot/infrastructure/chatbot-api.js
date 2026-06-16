import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js'

export class ChatbotApi extends BaseApi {
  #conversations
  #chatMessages
  #chatOrders
  #whatsappSessions
  #inventoryProducts

  constructor() {
    super()
    this.#conversations    = new BaseEndpoint(this, import.meta.env.VITE_CONVERSATIONS_ENDPOINT_PATH      ?? '/conversations')
    this.#chatMessages     = new BaseEndpoint(this, import.meta.env.VITE_CHAT_MESSAGES_ENDPOINT_PATH     ?? '/chat-messages')
    this.#chatOrders       = new BaseEndpoint(this, import.meta.env.VITE_CHAT_ORDERS_ENDPOINT_PATH       ?? '/chat-orders')
    this.#whatsappSessions = new BaseEndpoint(this, import.meta.env.VITE_WHATSAPP_SESSIONS_ENDPOINT_PATH ?? '/whatsapp-sessions')
    this.#inventoryProducts = new BaseEndpoint(this, import.meta.env.VITE_INVENTORY_PRODUCTS_ENDPOINT_PATH ?? '/inventory-products')
  }

  get conversations()     { return this.#conversations }
  get chatMessages()      { return this.#chatMessages }
  get chatOrders()        { return this.#chatOrders }
  get whatsappSessions()  { return this.#whatsappSessions }
  get inventoryProducts() { return this.#inventoryProducts }

  reportBridgeStatus(payload) {
    return this.http.post('/chatbot/whatsapp/bridge/status', payload)
  }
}
