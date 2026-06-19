<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  message:          { type: Object, required: true },
  clientInitials:   { type: String, default: 'AT'  },
  receiptImageUrl:  { type: String, default: null   }
})

const { t } = useI18n()

const systemText = computed(() => {
  const content = props.message.content
  if (!content.startsWith('chatbot.sys.')) return content

  const [key, ...params] = content.split('|')
  const paramMap = {}

  if (key === 'chatbot.sys.orderRegistered') {
    paramMap.orderNumber = params[0] ?? ''
    paramMap.time        = params[1] ?? ''
  } else if (key === 'chatbot.sys.botPaymentApproved' || key === 'chatbot.sys.botReceiptRejected' || key === 'chatbot.sys.botBlocked') {
    paramMap.orderNumber = params[0] ?? ''
    if (params[1]) paramMap.reason = params[1]
  } else if (params[0]) {
    paramMap.time = params[0]
  }

  return t(key, paramMap)
})

const isImageData = computed(() =>
  props.message.type === 'image' &&
  typeof props.message.content === 'string' &&
  (props.message.content.startsWith('data:') || props.message.content.startsWith('http'))
)
</script>

<template>
  <!-- System message -->
  <div v-if="message.sender === 'system'" class="sys-msg">
    <span class="sys-msg__badge">{{ systemText }}</span>
    <img v-if="receiptImageUrl" :src="receiptImageUrl" class="sys-msg__receipt" alt="Comprobante" />
  </div>

  <!-- Client message -->
  <div v-else-if="message.sender === 'client'" class="client-msg">
    <div class="client-msg__avatar">{{ clientInitials }}</div>
    <div class="client-msg__bubble" :class="{ 'client-msg__bubble--image': message.type === 'image' }">
      <img v-if="isImageData" :src="message.content" class="client-msg__image" alt="Imagen" />
      <p v-else class="client-msg__text">{{ message.content }}</p>
    </div>
  </div>

  <!-- Bot message -->
  <div v-else class="bot-msg">
    <div class="bot-msg__bubble">
      <p class="bot-msg__text">{{ message.content }}</p>
    </div>
    <div class="bot-msg__avatar">BH</div>
  </div>
</template>

<style scoped>
/* System */
.sys-msg {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.sys-msg__badge {
  border-radius: 9999px;
  background: #e5e7eb;
  padding: 0.125rem 0.75rem;
  font-size: 0.75rem;
  color: #6b7280;
}
.sys-msg__receipt {
  max-width: 14rem;
  border-radius: 0.75rem;
  object-fit: contain;
}

/* Client */
.client-msg {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.client-msg__avatar {
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
.client-msg__bubble {
  max-width: min(20rem, calc(100vw - 7rem));
  border-radius: 1rem;
  border-bottom-left-radius: 0.125rem;
  background: #fb923c;
  padding: 0.625rem 1rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}
/* Sin fondo naranja cuando es imagen */
.client-msg__bubble--image {
  background: transparent;
  padding: 0;
  box-shadow: none;
}
.client-msg__image {
  max-width: 100%;
  border-radius: 0.75rem;
  display: block;
}
.client-msg__text {
  font-size: 0.875rem;
  color: #fff;
  margin: 0;
}

/* Bot */
.bot-msg {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0.5rem;
}
.bot-msg__bubble {
  max-width: min(20rem, calc(100vw - 7rem));
  border-radius: 1rem;
  border-bottom-right-radius: 0.125rem;
  border: 1px solid #e5e7eb;
  background: #fff;
  padding: 0.625rem 1rem;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
}
.bot-msg__text {
  font-size: 0.875rem;
  color: #374151;
  white-space: pre-line;
  margin: 0;
}
.bot-msg__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: #4ade80;
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}
</style>
