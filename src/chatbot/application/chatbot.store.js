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
  const orders                 = ref([])
  const inventoryProducts      = ref([])

  let _playId = 0

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

  function loadSession() {
    api.whatsappSessions.getAll().then(res => {
      const all = WhatsappSessionAssembler.toEntitiesFromResponse(res)
      session.value       = all[0] ?? null
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

  function selectConversation(id) {
    _playId++
    const playId = _playId

    selectedConversationId.value = id
    messages.value               = []
    isClientTyping.value         = false
    botInputText.value           = ''

    api.chatMessages.getAll().then(res => {
      if (_playId !== playId) return
      const all  = ChatMessageAssembler.toEntitiesFromResponse(res)
      const msgs = all.filter(m => m.conversationId === id)
      const conv = conversations.value.find(c => c.id === id)
      const isLive = conv?.status === Conversation.Status.ACTIVE ||
                     conv?.status === Conversation.Status.WAITING_PAYMENT

      if (isLive) {
        _playConversation(msgs, playId)
      } else {
        messages.value = msgs
      }
    })
  }

  function _playConversation(msgs, playId) {
    let t = 0
    for (const msg of msgs) {
      if (msg.sender === ChatMessage.Sender.BOT) {
        const words     = msg.content.split(' ')
        const msPerWord = 70
        const startAt   = t

        words.forEach((_, i) => {
          setTimeout(() => {
            if (_playId !== playId) return
            botInputText.value = words.slice(0, i + 1).join(' ')
          }, startAt + i * msPerWord)
        })

        const sendAt = startAt + words.length * msPerWord + 250
        setTimeout(() => {
          if (_playId !== playId) return
          botInputText.value = ''
          messages.value = [...messages.value, msg]
        }, sendAt)
        t = sendAt + 400

      } else if (msg.sender === ChatMessage.Sender.CLIENT) {
        setTimeout(() => {
          if (_playId !== playId) return
          isClientTyping.value = true
        }, t)

        const showAt = t + 900
        setTimeout(() => {
          if (_playId !== playId) return
          isClientTyping.value = false
          messages.value = [...messages.value, msg]
        }, showAt)
        t = showAt + 400

      } else {
        setTimeout(() => {
          if (_playId !== playId) return
          messages.value = [...messages.value, msg]
        }, t)
        t += 400
      }
    }
  }

  function _typewriteAndSend(msg) {
    const words     = msg.content.split(' ')
    const msPerWord = 70

    words.forEach((_, i) => {
      setTimeout(() => {
        botInputText.value = words.slice(0, i + 1).join(' ')
      }, i * msPerWord)
    })

    setTimeout(() => {
      botInputText.value = ''
      api.chatMessages.create(msg).then(res => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(res.data)]
      })
    }, words.length * msPerWord + 250)
  }

  function sendMessage(content) {
    const convId = selectedConversationId.value
    if (!convId) return

    const msg = new ChatMessage({
      id: 0, conversationId: convId,
      content, sender: ChatMessage.Sender.BOT,
      type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString()
    })

    api.chatMessages.create(msg).then(res => {
      messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(res.data)]
    })
  }

  function simulateScan() {
    const current = session.value
    if (!current) return
    const updated = { ...current, status: WhatsappSession.Status.CONNECTED, connectedAt: new Date().toLocaleString('es-PE') }
    api.whatsappSessions.update(current.id, updated).then(res => {
      session.value = WhatsappSessionAssembler.toEntityFromResource(res.data)
    })
  }

  function simulateDisconnect() {
    const current = session.value
    if (!current) return
    const updated = { ...current, status: WhatsappSession.Status.DISCONNECTED, connectedAt: null }
    api.whatsappSessions.update(current.id, updated).then(res => {
      session.value = WhatsappSessionAssembler.toEntityFromResource(res.data)
    })
  }

  function approveOrder(orderId) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return

    api.chatOrders.update(orderId, { ...order, status: ChatOrder.Status.CONFIRMED }).then(res => {
      const confirmed = ChatOrderAssembler.toEntityFromResource(res.data)
      orders.value = orders.value.map(o => o.id === orderId ? confirmed : o)
      _updateConversationStatus(order.conversationId, Conversation.Status.COMPLETED)

      const time   = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      const sysMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: `chatbot.sys.paymentApproved|${time}`, sender: ChatMessage.Sender.SYSTEM, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })
      const botMsg = new ChatMessage({ id: 0, conversationId: order.conversationId, content: `chatbot.sys.botPaymentApproved|${order.orderNumber}`, sender: ChatMessage.Sender.BOT, type: ChatMessage.Type.TEXT, sentAt: new Date().toISOString() })

      api.chatMessages.create(sysMsg).then(r => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(r.data)]
        setTimeout(() => _typewriteAndSend(botMsg), 400)
      })
    })
  }

  function rejectOrder(orderId, reason = 'Imagen ilegible') {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return

    const newCount  = (order.rejectionCount ?? 0) + 1
    const isBlocked = newCount >= 2
    const newStatus = isBlocked ? ChatOrder.Status.BLOCKED : ChatOrder.Status.WAITING_PAYMENT

    api.chatOrders.update(orderId, { ...order, status: newStatus, hasReceipt: false, rejectionCount: newCount }).then(res => {
      const rejected = ChatOrderAssembler.toEntityFromResource(res.data)
      orders.value = orders.value.map(o => o.id === orderId ? rejected : o)

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

      api.chatMessages.create(sysMsg).then(r => {
        messages.value = [...messages.value, ChatMessageAssembler.toEntityFromResource(r.data)]
        setTimeout(() => _typewriteAndSend(botMsg), 400)
      })
    })
  }

  function _updateConversationStatus(conversationId, status) {
    const conv = conversations.value.find(c => c.id === conversationId)
    if (!conv) return
    api.conversations.update(conv.id, { ...conv, status }).then(res => {
      const updated = ConversationAssembler.toEntityFromResource(res.data)
      conversations.value = conversations.value.map(c => c.id === conv.id ? updated : c)
    })
  }

  return {
    session, isSessionLoaded, conversations, selectedConversationId,
    messages, isClientTyping, botInputText, orders, inventoryProducts,
    selectedConversation, pendingOrder, isConnected,
    loadSession, loadConversations, loadOrders, loadInventoryProducts,
    selectConversation, sendMessage, simulateScan, simulateDisconnect,
    approveOrder, rejectOrder
  }
})

export default useChatbotStore
