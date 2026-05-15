<script setup>
import { useI18n } from 'vue-i18n'
import ConversationListItem from './conversation-list-item.vue'

const props = defineProps({
  conversations: { type: Array,  default: () => [] },
  selectedId:    { type: Number, default: null      }
})
const emit = defineEmits(['conversation-selected'])

const { t } = useI18n()
</script>

<template>
  <div class="conv-list">
    <div class="conv-list__header">
      <h2 class="conv-list__title">{{ t('chatbot.conversationList.title') }}</h2>
    </div>
    <div class="conv-list__body">
      <ConversationListItem
        v-for="(conversation, i) in conversations"
        :key="conversation.id"
        :conversation="conversation"
        :selected="selectedId === conversation.id"
        :style="{ animationDelay: `${i * 250}ms` }"
        class="msg-animate"
        @selected-conversation="emit('conversation-selected', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.conv-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.conv-list__header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem;
}
.conv-list__title {
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.conv-list__body {
  flex: 1;
  overflow-y: auto;
}
</style>
