<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  conversation: { type: Object, required: true }
})

const { t } = useI18n()

const initials = computed(() => {
  const parts = props.conversation.clientName.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase()
})
</script>

<template>
  <div class="conv-header">
    <div class="conv-header__avatar">{{ initials }}</div>
    <div>
      <p class="conv-header__name">{{ conversation.clientName }}</p>
      <p class="conv-header__status">{{ t('chatbot.header.online') }}</p>
    </div>
  </div>
</template>

<style scoped>
.conv-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  padding: 0.75rem 1.25rem;
}
.conv-header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  background: #fb923c;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 700;
}
.conv-header__name {
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.conv-header__status {
  font-size: 0.75rem;
  color: #22c55e;
  margin: 0;
}
</style>
