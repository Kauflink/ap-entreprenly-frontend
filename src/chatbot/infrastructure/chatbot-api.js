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
    this.#conversations    = new BaseEndpoint(this, '/conversations')
    this.#chatMessages     = new BaseEndpoint(this, '/chat-messages')
    this.#chatOrders       = new BaseEndpoint(this, '/chat-orders')
    this.#whatsappSessions = new BaseEndpoint(this, '/whatsapp-sessions')
    this.#inventoryProducts = new BaseEndpoint(this, '/inventory-products')
  }

  get conversations()     { return this.#conversations }
  get chatMessages()      { return this.#chatMessages }
  get chatOrders()        { return this.#chatOrders }
  get whatsappSessions()  { return this.#whatsappSessions }
  get inventoryProducts() { return this.#inventoryProducts }
}
