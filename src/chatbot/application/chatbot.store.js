import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { ChatbotApi } from '../infrastructure/chatbot-api.js'
import { ConversationAssembler } from '../infrastructure/conversation-assembler.js'
import { ChatMessageAssembler } from '../infrastructure/chat-message-assembler.js'
import { ChatOrderAssembler } from '../infrastructure/chat-order-assembler.js'
import { WhatsappSessionAssembler } from '../infrastructure/whatsapp-session-assembler.js'
import { Conversation } from '../domain/model/conversation-entity.js'
import { ChatMessage } from '../domain/model/chat-message-entity.js'
import { ChatOrder } from '../domain/model/chat-order-entity.js'
import { WhatsappSession } from '../domain/model/whatsapp-session-entity.js'

const api = new ChatbotApi()

const useChatbotStore = defineStore('chatbot', () => {
  const session                = ref(null)
  const isSessionLoaded        = ref(false)
  const conversations          = ref([])
  const selectedConversationId = ref(null)
  const messages               = ref([])
  const isClientTyping         = ref(false)
  const botInputText           = ref('')
  const liveAnimation          = ref(false)
  const orders                 = ref([])
  const inventoryProducts      = ref([])

  const processingOrders = new Set()

  const selectedConversation = computed(() =>
    conversations.value.find(c => c.id === selectedConversationId.value) ?? null
  )

  const pendingOrder = computed(() =>
    orders.value.find(o =>
      o.conversationId === selectedConversationId.value &&
      o.status === ChatOrder.Status.WAITING_PAYMENT &&
      o.hasReceipt === true
    ) ?? null
  )

  const isConnected = computed(() =>
    session.value?.status === WhatsappSession.Status.CONNECTED
  )

  // ── Loaders ────────────────────────────────────────────────────────────────

  function loadSession() {
    api.whatsappSessions.getAll().then(res => {
      const all = WhatsappSessionAssembler.toEntitiesFromResponse(res)
      session.value         = all[0] ?? null
      isSessionLoaded.value = true
    })
  }

  function loadConversations() {
    api.conversations.getAll().then(res => {
      conversations.value = ConversationAssembler.toEntitiesFromResponse(res)
    })
  }

  function loadOrders() {
    api.chatOrders.getAll().then(res => {
      orders.value = ChatOrderAssembler.toEntitiesFromResponse(res)
    })
  }

  function loadInventoryProducts() {
    api.inventoryProducts.getAll().then(res => {
      inventoryProducts.value = res.data
    })
  }

  // ── Conversation selection — loads history instantly, no animation ──────────

  function selectConversation(id) {
    selectedConversationId.value = id
    messages.value               = []
    isClientTyping.value         = false
    botInputText.value           = ''
    liveAnimation.value          = false

    api.chatMessages.getAll().then(res => {
      if (selectedConversationId.value !== id) return
      const all = ChatMessageAssembler.toEntitiesFromResponse(res)
      messages.value = all.filter(m => m.conversationId === id)
    })
  }

  // ── Typewriter for bot replies (approval / rejection only) ────────────────

  function _typewriteAndSend(msg) {
    const words     = msg.content.split(' ')
    const msPerWord = 70

    words.forEach((_, i) => {
      setTimeout(() => {
        botInputText.value = words.slice(0, i + 1).join(' ')
      }, i * msPerWord)
    })

    setTimeout(() => {
      botInputText.value  = ''
      liveAnimation.value = true
      api.chatMessages.create(msg).then(res => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(res.data)]
      })
    }, words.length * msPerWord + 250)
  }

  // ── Manual message send (seller writes in chat) ───────────────────────────

  function sendMessage(content) {
    const convId = selectedConversationId.value
    if (!convId) return

    const msg = new ChatMessage({
      id: 0, conversationId: convId,
      content, sender: ChatMessage.Sender.BOT,
      type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString()
    })

    liveAnimation.value = true
    api.chatMessages.create(msg).then(res => {
      messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(res.data)]
    })
  }

  // ── WhatsApp session helpers ──────────────────────────────────────────────

  function simulateScan() {
    const current = session.value
    if (!current) return
    api.reportBridgeStatus({
      connected: true,
      phone: current.phone ?? '+51999000000',
      ownerEmail: current.ownerEmail ?? '',
      businessName: current.businessName,
      sellerId: current.sellerId
    }).then(res => {
      session.value = WhatsappSessionAssembler.toEntityFromResource(res.data)
    })
  }

  function simulateDisconnect() {
    const current = session.value
    if (!current) return
    api.reportBridgeStatus({
      connected: false,
      phone: null,
      ownerEmail: current.ownerEmail ?? '',
      businessName: current.businessName,
      sellerId: current.sellerId
    }).then(res => {
      session.value = WhatsappSessionAssembler.toEntityFromResource(res.data)
    })
  }

  // ── Payment approval ──────────────────────────────────────────────────────

  function approveOrder(orderId) {
    if (processingOrders.has(orderId)) return
    processingOrders.add(orderId)

    const order = orders.value.find(o => o.id === orderId)
    if (!order) { processingOrders.delete(orderId); return }

    api.chatOrders.postAction(orderId, 'confirm').then(res => {
      const confirmed = ChatOrderAssembler.toEntityFromResource(res.data)
      orders.value = orders.value.map(o => o.id === orderId ? confirmed : o)
      _updateConversationStatus(order.conversationId, Conversation.Status.COMPLETED)

      const time   = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      const sysMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: `chatbot.sys.paymentApproved|${time}`, sender: ChatMessage.Sender.SYSTEM, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })
      const botMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: `chatbot.sys.botPaymentApproved|${order.orderNumber}`, sender: ChatMessage.Sender.BOT, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })

      liveAnimation.value = true
      api.chatMessages.create(sysMsg).then(r => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(r.data)]
        setTimeout(() => _typewriteAndSend(botMsg), 400)
      })
    }).finally(() => processingOrders.delete(orderId))
  }

  // ── Payment rejection ─────────────────────────────────────────────────────

  function rejectOrder(orderId, reason = 'Imagen ilegible') {
    if (processingOrders.has(orderId)) return
    processingOrders.add(orderId)

    const order = orders.value.find(o => o.id === orderId)
    if (!order) { processingOrders.delete(orderId); return }

    api.chatOrders.postAction(orderId, 'reject', { reason }).then(res => {
      const rejected = ChatOrderAssembler.toEntityFromResource(res.data)
      orders.value = orders.value.map(o => o.id === orderId ? rejected : o)

      const isBlocked = rejected.status === ChatOrder.Status.BLOCKED
      if (isBlocked) _updateConversationStatus(order.conversationId, Conversation.Status.CLOSED)

      const time       = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      const sysContent = isBlocked
        ? `chatbot.sys.blocked|${time}`
        : `chatbot.sys.receiptRejected|${time}`
      const botContent = isBlocked
        ? `chatbot.sys.botBlocked|${order.orderNumber}`
        : `chatbot.sys.botReceiptRejected|${order.orderNumber}|${reason}`

      const sysMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: sysContent, sender: ChatMessage.Sender.SYSTEM, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })
      const botMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: botContent, sender: ChatMessage.Sender.BOT, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })

      liveAnimation.value = true
      api.chatMessages.create(sysMsg).then(r => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(r.data)]
        setTimeout(() => _typewriteAndSend(botMsg), 400)
      })
    }).finally(() => processingOrders.delete(orderId))
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  function _updateConversationStatus(conversationId, status) {
    conversations.value = conversations.value.map(c =>
      c.id === conversationId ? { ...c, status } : c
    )
  }

  return {
    session, isSessionLoaded, conversations, selectedConversationId,
    messages, isClientTyping, botInputText, liveAnimation, orders, inventoryProducts,
    selectedConversation, pendingOrder, isConnected,
    loadSession, loadConversations, loadOrders, loadInventoryProducts,
    selectConversation, sendMessage, simulateScan, simulateDisconnect,
    approveOrder, rejectOrder
  }
})

export default useChatbotStore
