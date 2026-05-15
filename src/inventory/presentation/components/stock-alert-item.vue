<script setup>
import { computed } from 'vue';

const props = defineProps({ alert: { type: Object, required: true } });

const severityClass = computed(() => {
  if (props.alert.alertType === 'low_stock') return 'low';
  if (props.alert.severity === 'critical') return 'critical';
  return 'warning';
});

const icon = computed(() => {
  if (props.alert.alertType === 'low_stock') return 'trending_down';
  if (props.alert.severity === 'critical') return 'error';
  return 'warning';
});
</script>

<template>
  <div class="alert-banner" :class="severityClass">
    <span class="alert-icon">
      <span class="material-icons">{{ icon }}</span>
    </span>
    <p class="alert-text">{{ alert.message }}</p>
  </div>

</template>

<style scoped>
.alert-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 0.82rem;
  line-height: 1.4;
}

.alert-text {
  margin: 0;
  font-weight: 500;
}

.alert-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.alert-banner.warning {
  background-color: #fffbea;
  border-color: #f5d87a;
  color: #7a5c00;
}
.alert-banner.warning .alert-icon .material-icons { color: #d4a017; }


.alert-banner.critical {
  background-color: #fde8e8;
  border-color: #f5a0a0;
  color: #8b1a1a;
}
.alert-banner.critical .alert-icon .material-icons { color: #c0392b; }


.alert-banner.low {
  background-color: #eef0fb;
  border-color: #b0b8ef;
  color: #2d3a8c;
}
.alert-banner.low .alert-icon .material-icons { color: #4a5cd6; }

</style>
