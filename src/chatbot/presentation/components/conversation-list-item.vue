<script setup>
const props = defineProps({
  conversation: { type: Object,  required: true },
  selected:     { type: Boolean, default: false  }
})
const emit = defineEmits(['selected-conversation'])
</script>

<template>
  <button
    :class="['conv-item', selected ? 'conv-item--active' : '']"
    type="button"
    @click="emit('selected-conversation', conversation.id)"
  >
    <div class="conv-item__row">
      <p class="conv-item__name">{{ conversation.clientName }}</p>
      <span class="conv-item__time">{{ conversation.lastMessageTime }}</span>
    </div>
    <p class="conv-item__preview">{{ conversation.lastMessage }}</p>
  </button>
</template>

<style scoped>
.conv-item {
  width: 100%;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  padding: 0.75rem 1rem;
  text-align: left;
  cursor: pointer;
  background: #fff;
  transition: background 0.15s;
}
.conv-item:hover { background: #f9fafb; }
.conv-item--active { background: #fff7ed; border-left: 3px solid #f97316; }
.conv-item__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
}
.conv-item__name {
  font-weight: 700;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.conv-item__time {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: #9ca3af;
}
.conv-item__preview {
  margin: 0.125rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ── Móvil: chip horizontal ─────────────────────────── */
@media (max-width: 768px) {
  .conv-item {
    width: auto;
    min-width: 7rem;
    max-width: 9rem;
    border-bottom: none;
    border-right: 1px solid #f3f4f6;
    padding: 0.5rem 0.75rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-shrink: 0;
  }
  .conv-item--active {
    border-left: none;
    border-bottom: 3px solid #f97316;
    background: #fff7ed;
  }
  .conv-item__time    { display: none; }
  .conv-item__name    { font-size: 0.75rem; max-width: 100%; }
  .conv-item__preview { font-size: 0.625rem; -webkit-line-clamp: 2; white-space: normal;
                        display: -webkit-box; -webkit-box-orient: vertical; }
}
</style>
