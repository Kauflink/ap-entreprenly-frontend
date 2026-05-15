<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  draftText:    { type: String,  default: '' },
  isAutoTyping: { type: Boolean, default: false }
})
const emit = defineEmits(['message-sent'])

const { t } = useI18n()

const text    = ref('')
const isEmpty = ref(false)

watch(() => props.draftText, val => { text.value = val })

function submit() {
  if (!text.value.trim()) {
    isEmpty.value = true
    return
  }
  isEmpty.value = false
  emit('message-sent', text.value.trim())
  text.value = ''
}
</script>

<template>
  <div class="chat-input">
    <div :class="['chat-input__bar', isEmpty ? 'chat-input__bar--empty' : '']">
      <input
        v-model="text"
        class="chat-input__field"
        :placeholder="isEmpty ? t('chatbot.input.emptyError') : t('chatbot.input.placeholder')"
        :aria-label="t('chatbot.input.ariaLabel')"
        :disabled="isAutoTyping"
        @keyup.enter="submit"
        @input="isEmpty = false"
      />

      <button class="chat-input__icon-btn" type="button" :aria-label="t('chatbot.input.voiceNote')">
        <svg class="chat-input__icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
        </svg>
      </button>

      <button class="chat-input__icon-btn" type="button" :aria-label="t('chatbot.input.attach')">
        <svg class="chat-input__icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
        </svg>
      </button>

      <button
        :disabled="!text.trim()"
        class="chat-input__send"
        type="button"
        :aria-label="t('chatbot.input.send')"
        @click="submit"
      >
        <svg class="chat-input__send-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-input {
  border-top: 1px solid #e5e7eb;
  background: #fff;
  padding: 0.75rem 1rem;
}
.chat-input__bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-radius: 9999px;
  padding: 0.625rem 1rem;
  background: #f3f4f6;
  transition: background 0.2s;
}
.chat-input__bar--empty {
  background: #fff7ed;
}
.chat-input__field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #374151;
}
.chat-input__field::placeholder { color: #9ca3af; }
.chat-input__field:disabled { cursor: default; }
.chat-input__icon-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  transition: color 0.2s;
}
.chat-input__icon-btn:hover { color: #4b5563; }
.chat-input__icon {
  width: 1.25rem;
  height: 1.25rem;
}
.chat-input__send {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 9999px;
  background: #15803d;
  color: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}
.chat-input__send:hover { background: #166534; }
.chat-input__send:disabled { opacity: 0.4; cursor: not-allowed; }
.chat-input__send-icon {
  width: 1rem;
  height: 1rem;
}
</style>
