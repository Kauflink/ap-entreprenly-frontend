<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useChatbotStore from '../../application/chatbot.store.js'
import useProfileStore from '@/profile/application/profile.store.js'
import ConversationList   from '../components/conversation-list.vue'
import ConversationHeader from '../components/conversation-header.vue'
import MessageBubble      from '../components/message-bubble.vue'
import ChatInput          from '../components/chat-input.vue'

const { t }  = useI18n()
const store  = useChatbotStore()
const router = useRouter()
const profileStore = useProfileStore()

const messagesContainer = ref(null)
const showRejectForm    = ref(false)
const selectedReason    = ref('chatbot.payment.reasons.illegible')

const rejectReasons = [
  'chatbot.payment.reasons.illegible',
  'chatbot.payment.reasons.wrongAmount',
  'chatbot.payment.reasons.fake'
]

const chatbotAllowed = computed(() => profileStore.profile.plan !== 'Free')

/** Show payment bar only after the client sends a receipt image */
const receiptVisible = computed(() =>
  store.messages.some(m => m.sender === 'client' && m.type === 'image')
)

const clientInitials = computed(() => {
  const conv = store.selectedConversation
  if (!conv) return ''
  const parts = conv.clientName.split(' ')
  return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`
})

// Luis Ramirez → Plin · todos los demás → Yape
const paymentApp = computed(() => {
  const name = store.selectedConversation?.clientName ?? ''
  return name.toLowerCase().startsWith('luis') ? 'plin' : 'yape'
})

/** Redirect to chatbot config if session is not connected */
watch(
  () => store.isSessionLoaded,
  loaded => {
    if (loaded && (!store.session || store.session.status !== 'connected')) {
      router.push('/chatbot')
    }
  }
)

/** Scroll to bottom on new messages */
watch(
  () => store.messages.length,
  async () => {
    await nextTick()
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
)

/** Reset reject form when conversation changes */
watch(
  () => store.selectedConversationId,
  () => {
    showRejectForm.value  = false
    selectedReason.value  = 'chatbot.payment.reasons.illegible'
  }
)

onMounted(() => {
  if (!chatbotAllowed.value) {
    router.replace('/chatbot')
    return
  }

  store.loadSession()
  store.loadConversations()
  store.loadOrders()
})

function onConversationSelected(id) {
  store.selectConversation(id)
}

function onMessageSent(content) {
  store.sendMessage(content)
}

function onApprove() {
  const order = store.pendingOrder
  if (order) {
    store.approveOrder(order.id)
    showRejectForm.value = false
  }
}

function onReject() {
  showRejectForm.value = true
}

function onConfirmReject() {
  const order = store.pendingOrder
  if (order) {
    store.rejectOrder(order.id, selectedReason.value)
    showRejectForm.value = false
    selectedReason.value = 'chatbot.payment.reasons.illegible'
  }
}

function onCancelReject() {
  showRejectForm.value = false
  selectedReason.value = 'chatbot.payment.reasons.illegible'
}
</script>

<template>
  <div class="conversations-page">
    <div class="conversations-layout">

      <!-- Sidebar -->
      <div class="conversations-sidebar">
        <ConversationList
          :conversations="store.conversations"
          :selected-id="store.selectedConversationId"
          @conversation-selected="onConversationSelected"
        />
      </div>

      <!-- Chat area -->
      <div class="conversations-chat">

        <!-- Conversation open -->
        <template v-if="store.selectedConversation">
          <ConversationHeader :conversation="store.selectedConversation" />

          <!-- Messages -->
          <div ref="messagesContainer" class="conversations-messages">
            <div
              v-for="message in store.messages"
              :key="message.id"
              class="msg-animate"
            >
              <MessageBubble
                :message="message"
                :client-initials="clientInitials"
                :payment-app="paymentApp"
                :order="store.pendingOrder ?? store.orders.find(o => o.conversationId === store.selectedConversationId) ?? null"
              />
            </div>

            <!-- Typing indicator -->
            <div
              v-if="store.isClientTyping"
              class="msg-animate typing-indicator"
              aria-live="polite"
              aria-label="Cliente escribiendo"
            >
              <div class="typing-indicator__avatar">{{ clientInitials }}</div>
              <div class="typing-indicator__bubble">
                <span class="typing-dot" style="animation-delay: 0ms"></span>
                <span class="typing-dot" style="animation-delay: 150ms"></span>
                <span class="typing-dot" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>

          <!-- Payment bar -->
          <template v-if="store.pendingOrder && receiptVisible">
            <!-- Reject form -->
            <div v-if="showRejectForm" class="payment-reject">
              <p class="payment-reject__title">{{ t('chatbot.payment.rejectTitle') }}</p>
              <div class="payment-reject__reasons">
                <button
                  v-for="reason in rejectReasons"
                  :key="reason"
                  type="button"
                  :class="['reason-btn', selectedReason === reason ? 'reason-btn--active' : '']"
                  @click="selectedReason = reason"
                >
                  {{ t(reason) }}
                </button>
              </div>
              <div class="payment-reject__actions">
                <button type="button" class="action-btn action-btn--red" @click="onConfirmReject">
                  {{ t('chatbot.payment.confirmReject') }}
                </button>
                <button type="button" class="action-btn action-btn--outline" @click="onCancelReject">
                  {{ t('chatbot.payment.cancelReject') }}
                </button>
              </div>
            </div>

            <!-- Approve/reject bar -->
            <div v-else class="payment-bar">
              <div>
                <p class="payment-bar__title">
                  {{ t('chatbot.payment.pendingBar', { orderNumber: store.pendingOrder.orderNumber }) }}
                </p>
                <p class="payment-bar__detail">
                  {{ t('chatbot.payment.pendingBarDetail', { paymentMethod: store.pendingOrder.paymentMethod, total: store.pendingOrder.total.toFixed(2) }) }}
                </p>
              </div>
              <div class="payment-bar__actions">
                <button type="button" class="pbar-btn pbar-btn--green" @click="onApprove">
                  {{ t('chatbot.payment.approve') }}
                </button>
                <button type="button" class="pbar-btn pbar-btn--red" @click="onReject">
                  {{ t('chatbot.payment.reject') }}
                </button>
              </div>
            </div>
          </template>

          <ChatInput
            :draft-text="store.botInputText"
            :is-auto-typing="store.botInputText.length > 0"
            @message-sent="onMessageSent"
          />
        </template>

        <!-- No conversations at all -->
        <div v-else-if="store.conversations.length === 0" class="conversations-empty">
          <svg class="conversations-empty__icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 2H4C2.9 2 2 2.9 2 4v13c0 1.1.9 2 2 2h3l3 3 3-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
          </svg>
          <p class="conversations-empty__text">{{ t('chatbot.conversations.empty') }}</p>
        </div>

        <!-- No conversation selected -->
        <div v-else class="conversations-empty">
          <svg class="conversations-empty__icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 2H4C2.9 2 2 2.9 2 4v13c0 1.1.9 2 2 2h3l3 3 3-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
          </svg>
          <p class="conversations-empty__text">{{ t('chatbot.conversations.placeholder') }}</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.conversations-page {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  min-height: 0;
  padding: 1.5rem;
  padding-top: 1rem;
  overflow: hidden;
}
.conversations-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.07);
}
.conversations-sidebar {
  width: 16rem;
  flex-shrink: 0;
}
.conversations-chat {
  display: flex;
  flex: 1;
  flex-direction: column;
  border-left: 1px solid #e5e7eb;
  overflow: hidden;
}
.conversations-messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  background: #f9fafb;
  padding: 1.5rem;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.typing-indicator__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: #fb923c;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}
.typing-indicator__bubble {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 1rem;
  border-bottom-left-radius: 0.125rem;
  background: #ffedd5;
  padding: 0.75rem 1rem;
}
.typing-dot {
  display: block;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: #fb923c;
  animation: bounce 1s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

/* Payment bar */
.payment-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid #fed7aa;
  background: #fff7ed;
  padding: 0.75rem 1.25rem;
}
.payment-bar__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #c2410c;
  margin: 0;
}
.payment-bar__detail {
  font-size: 0.75rem;
  color: #f97316;
  margin: 0;
}
.payment-bar__actions {
  display: flex;
  gap: 0.5rem;
}
.pbar-btn {
  border-radius: 9999px;
  padding: 0.25rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  transition: background 0.2s;
}
.pbar-btn--green {
  border: 2px solid #22c55e;
  color: #16a34a;
}
.pbar-btn--green:hover { background: #f0fdf4; }
.pbar-btn--red {
  border: 2px solid #f87171;
  color: #ef4444;
}
.pbar-btn--red:hover { background: #fef2f2; }

/* Reject form */
.payment-reject {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-top: 1px solid #fecdd3;
  background: #fff1f2;
  padding: 1rem 1.25rem;
}
.payment-reject__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #b91c1c;
  margin: 0;
}
.payment-reject__reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.reason-btn {
  border-radius: 9999px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  border: 1px solid #fca5a5;
  background: #fff;
  color: #ef4444;
}
.reason-btn:hover { background: #fff1f2; }
.reason-btn--active {
  border-color: #ef4444;
  background: #ef4444;
  color: #fff;
}
.payment-reject__actions {
  display: flex;
  gap: 0.5rem;
}
.action-btn {
  border-radius: 9999px;
  padding: 0.375rem 1.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s;
}
.action-btn--red {
  background: #ef4444;
  color: #fff;
}
.action-btn--red:hover { background: #dc2626; }
.action-btn--outline {
  background: #fff;
  color: #6b7280;
  border: 1px solid #d1d5db;
}
.action-btn--outline:hover { background: #f9fafb; }

/* Empty state */
.conversations-empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: #f9fafb;
}
.conversations-empty__icon {
  width: 4rem;
  height: 4rem;
  color: #fb923c;
}
.conversations-empty__text {
  text-align: center;
  font-size: 0.875rem;
  color: #fb923c;
  margin: 0;
}

/* ── Responsive ──────────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .conversations-page    { padding: 1rem; }
  .conversations-sidebar { width: 13rem; }
}

@media (max-width: 768px) {
  .conversations-page    { padding: 0.75rem; padding-top: 0.75rem; }
  .conversations-layout  { flex-direction: column; border-radius: 0.75rem; }

  /* sidebar: banda horizontal con scroll lateral */
  .conversations-sidebar {
    width: 100%;
    height: 5.5rem;       /* suficiente para los chips compactos */
    overflow-x: auto;
    overflow-y: hidden;
    border-left: none;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }
  .conversations-chat    { border-left: none; flex: 1; min-height: 0; }
  .conversations-messages { padding: 0.75rem; gap: 0.5rem; }
}

@media (max-width: 640px) {
  .conversations-page    { padding: 0.5rem; }
  .conversations-layout  { border-radius: 0.5rem; }
  .conversations-sidebar { height: 5rem; }

  /* bubbles: no exceden el ancho del chat */
  .conversations-messages { padding: 0.5rem; }

  /* payment bar apilada */
  .payment-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.625rem 0.875rem;
  }
  .payment-bar__actions { width: 100%; justify-content: flex-end; }

  /* reject reasons: columna en móvil muy pequeño */
  .payment-reject__reasons { flex-direction: column; }
  .payment-reject__actions { flex-direction: column; }
  .action-btn { width: 100%; text-align: center; }
}
</style>
