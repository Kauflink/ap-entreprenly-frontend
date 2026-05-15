<script setup>
import { computed } from 'vue'

const props = defineProps({
  order: { type: Object, required: true }
})

const statusLabel = computed(() => {
  if (props.order.status === 'CONFIRMED') return '¡Pago exitoso!'
  if (props.order.status === 'BLOCKED')   return 'Pago no válido'
  return 'Pago enviado'
})

const statusIconClass = computed(() => {
  if (props.order.status === 'CONFIRMED') return 'status-icon--green'
  if (props.order.status === 'BLOCKED')   return 'status-icon--red'
  return 'status-icon--teal'
})

function shortCode(id) {
  return 'PL' + String(id ?? '').slice(-6).toUpperCase().padStart(6, '0')
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
}

function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="receipt-wrap">
    <div class="phone">

      <!-- Status bar -->
      <div class="status-bar">
        <span class="status-bar__time">{{ formatTime(order.createdAt) }}</span>
        <span class="status-bar__icons">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1.41 1.41L0 2.83l4.84 4.83C2.98 9.28 1.67 11 1 13h2.05c.65-1.58 1.72-2.94 3.06-4L7.5 10.44C6.28 11.26 5.26 12.32 4.5 13.56L6.5 15.5C7.06 14.55 7.83 13.76 8.78 13.2L10.5 14.93C9.62 15.29 8.9 15.95 8.5 16.8l1.5 1.5c.42-.56 1.02-.95 1.75-1.08l4.25 4.25 1.41-1.41L1.41 1.41z"/>
          </svg>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
          </svg>
        </span>
      </div>

      <!-- Header Plin -->
      <div class="plin-header">
        <svg class="plin-header__back" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
        </svg>
        <div class="plin-logo">
          <span class="plin-logo__p">p</span><span class="plin-logo__lin">lin</span>
          <span class="plin-logo__dot">●</span>
        </div>
        <div style="width:16px"></div>
      </div>

      <!-- Cuerpo -->
      <div class="receipt-body">

        <!-- Ícono de estado -->
        <div :class="['status-icon', statusIconClass]">
          <svg v-if="order.status === 'BLOCKED'" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          <svg v-else width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
          </svg>
        </div>

        <p class="receipt-label">{{ statusLabel }}</p>
        <p class="receipt-amount">S/ {{ order.total?.toFixed(2) ?? '0.00' }}</p>
        <p class="receipt-to">Para <strong>Bodega El Huerto</strong></p>

        <div class="receipt-divider"></div>

        <div class="receipt-details">
          <div class="receipt-row">
            <span class="receipt-row__label">Pedido</span>
            <span class="receipt-row__value">{{ order.orderNumber }}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-row__label">Fecha</span>
            <span class="receipt-row__value">{{ formatDateShort(order.createdAt) }}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-row__label">Hora</span>
            <span class="receipt-row__value">{{ formatTime(order.createdAt) }}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-row__label">Código</span>
            <span class="receipt-row__value receipt-row__value--teal">{{ shortCode(order.id) }}</span>
          </div>
          <div class="receipt-row">
            <span class="receipt-row__label">Método</span>
            <span class="receipt-row__value">{{ order.paymentMethod }}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <!-- Sello -->
        <div v-if="order.status === 'CONFIRMED'" class="stamp stamp--green">APROBADO ✓</div>
        <div v-else-if="order.status === 'BLOCKED'" class="stamp stamp--red">RECHAZADO ✗</div>
        <div v-else-if="order.status === 'WAITING_PAYMENT'" class="stamp stamp--teal">EN REVISIÓN</div>

        <!-- Footer -->
        <div class="plin-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="#00C2B3">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          <span>Pago procesado por Plin</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.receipt-wrap { display: flex; justify-content: center; flex-shrink: 0; }

.phone {
  width: 148px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 4px 20px rgb(0 194 179 / 0.2), 0 1px 4px rgb(0 0 0 / 0.1);
  overflow: hidden;
  border: 2px solid #b2f0ec;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ── Status bar ────────────────────────────────────────────────── */
.status-bar {
  display: flex; justify-content: space-between; align-items: center;
  background: #009B8E; padding: 3px 10px; font-size: 8px; color: #ccf5f2;
}
.status-bar__icons { display: flex; gap: 3px; align-items: center; }

/* ── Header ────────────────────────────────────────────────────── */
.plin-header {
  display: flex; align-items: center; justify-content: space-between;
  background: #00C2B3; padding: 9px 12px;
}
.plin-logo { display: flex; align-items: center; gap: 1px; }
.plin-logo__p   { font-size: 20px; font-weight: 900; color: #fff; line-height: 1; }
.plin-logo__lin { font-size: 14px; font-weight: 700; color: #ccf5f2; }
.plin-logo__dot { font-size: 8px; color: #fff; margin-left: 2px; }
.plin-header__back { opacity: 0.85; cursor: pointer; }

/* ── Cuerpo ────────────────────────────────────────────────────── */
.receipt-body {
  position: relative; display: flex; flex-direction: column; align-items: center;
  padding: 14px 12px 10px; background: #f0fffe; gap: 0;
}

/* ── Ícono estado ──────────────────────────────────────────────── */
.status-icon {
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; margin-bottom: 7px;
}
.status-icon--teal  { background: #00C2B3; box-shadow: 0 0 0 6px #ccf5f2; }
.status-icon--green { background: #22c55e; box-shadow: 0 0 0 6px #dcfce7; }
.status-icon--red   { background: #ef4444; box-shadow: 0 0 0 6px #fee2e2; }

.receipt-label  { font-size: 9.5px; font-weight: 800; color: #065f5b; margin: 6px 0 4px; }
.receipt-amount { font-size: 24px; font-weight: 900; color: #022d2b; letter-spacing: -0.5px; margin-bottom: 4px; line-height: 1; }
.receipt-to     { font-size: 8px; color: #00A09A; margin-bottom: 10px; }
.receipt-to strong { color: #00766f; }

.receipt-divider { width: 100%; height: 1px; background: #b2f0ec; margin-bottom: 9px; }

/* ── Detalles ──────────────────────────────────────────────────── */
.receipt-details { width: 100%; display: flex; flex-direction: column; gap: 4px; margin-bottom: 9px; }
.receipt-row { display: flex; justify-content: space-between; font-size: 7.5px; }
.receipt-row__label { color: #5eead4; }
.receipt-row__value { color: #1f2937; font-weight: 600; max-width: 80px; text-align: right; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.receipt-row__value--teal { color: #00766f; font-size: 6.5px; }

/* ── Sello ─────────────────────────────────────────────────────── */
.stamp {
  position: absolute; top: 42%; left: 50%;
  transform: translate(-50%, -50%) rotate(-18deg);
  border-radius: 3px; border: 2px solid;
  padding: 2px 7px; font-size: 9px; font-weight: 900;
  letter-spacing: 0.06em; opacity: 0.65; pointer-events: none;
  white-space: nowrap;
}
.stamp--teal   { color: #0f766e; border-color: #0f766e; background: rgb(204 245 242 / 0.5); }
.stamp--green  { color: #15803d; border-color: #15803d; background: rgb(220 252 231 / 0.5); }
.stamp--red    { color: #b91c1c; border-color: #b91c1c; background: rgb(254 226 226 / 0.5); }

/* ── Footer ────────────────────────────────────────────────────── */
.plin-footer {
  display: flex; align-items: center; gap: 4px;
  font-size: 6.5px; color: #5eead4; margin-top: 2px;
}
</style>
