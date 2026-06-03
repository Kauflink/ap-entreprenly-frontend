<script setup>
import { ref, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const emit = defineEmits(['scanned']);

const modalOpen    = ref(false);
const scanning     = ref(false);
const cameraError  = ref(false);
const manualCode   = ref('');
const readerId     = 'qr-reader-' + Math.random().toString(36).slice(2);

let stream    = null;
let animFrame = null;
let detector  = null;
let videoEl   = null;

async function openScanner() {
  manualCode.value  = '';
  cameraError.value = false;
  modalOpen.value   = true;
  scanning.value    = false;

  if (!('BarcodeDetector' in window)) {
    cameraError.value = true;
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    scanning.value = true;

    await nextTick();
    const readerDiv = document.getElementById(readerId);
    if (readerDiv) {
      videoEl = document.createElement('video');
      videoEl.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:8px;';
      videoEl.setAttribute('playsinline', '');
      videoEl.srcObject = stream;
      readerDiv.innerHTML = '';
      readerDiv.appendChild(videoEl);
      await videoEl.play();
    }

    detector = new BarcodeDetector({ formats: ['qr_code'] });
    scanFrame();
  } catch (e) {
    scanning.value    = false;
    cameraError.value = true;
  }
}

function scanFrame() {
  if (!scanning.value || !videoEl) return;
  detector.detect(videoEl)
    .then(codes => {
      if (codes.length > 0) {
        emit('scanned', codes[0].rawValue);
        closeScanner();
      } else {
        animFrame = requestAnimationFrame(scanFrame);
      }
    })
    .catch(() => { animFrame = requestAnimationFrame(scanFrame); });
}

function closeScanner() {
  scanning.value    = false;
  modalOpen.value   = false;
  cameraError.value = false;
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  if (stream)    { stream.getTracks().forEach(t => t.stop()); stream = null; }
  const readerDiv = document.getElementById(readerId);
  if (readerDiv) readerDiv.innerHTML = '';
  videoEl = null;
}

function confirmManual() {
  if (manualCode.value.trim()) {
    emit('scanned', manualCode.value.trim());
  }
  closeScanner();
}

onUnmounted(closeScanner);
</script>

<template>
  <div class="scanner-trigger-row">
    <button
        type="button"
        class="qr-scan-btn"
        :disabled="scanning"
        @click="openScanner">
      <span class="material-icons" style="font-size:20px">photo_camera</span>
    </button>
  </div>

  <teleport to="body">
    <template v-if="modalOpen">
      <div class="qr-modal-overlay" @click.self="closeScanner">
        <div class="qr-modal-card">

          <div class="qr-modal-header">
            <span class="qr-modal-title">{{ t('products.form.scanQr') }}</span>
            <button type="button" class="qr-modal-close" @click="closeScanner">✕</button>
          </div>

          <template v-if="cameraError">
            <div class="qr-error-banner">
              <span class="material-icons" style="font-size:18px;flex-shrink:0">warning</span>
              {{ t('products.form.scannerCameraUnavailable') }}
            </div>
          </template>

          <template v-if="scanning">
            <div :id="readerId" class="qr-reader-box"></div>
          </template>

          <div class="qr-manual-section">
            <label class="qr-manual-label">{{ t('products.form.orManual') }}</label>
            <input
                type="text"
                class="qr-manual-input"
                v-model="manualCode"
                :placeholder="t('products.form.qrPlaceholder')"
                @keyup.enter="confirmManual" />
          </div>

          <button type="button" class="qr-ok-btn" @click="confirmManual">
            {{ t('products.form.ok') }}
          </button>

        </div>
      </div>
    </template>
  </teleport>
</template>

<style scoped>
/* ── Trigger button ── */
.scanner-trigger-row { display: flex; }

.qr-scan-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1.5px solid #C9C9C9;
  border-radius: 10px;
  background: #F6F4F4;
  color: #0C0F12;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
  flex-shrink: 0;
}
.qr-scan-btn:hover:not(:disabled) {
  border-color: #F38313;
  color: #F38313;
  background: #FCE0D4;
}
.qr-scan-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal overlay ── */
.qr-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(12, 15, 18, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
}

.qr-modal-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 28px 28px 24px;
  width: min(380px, 92vw);
  box-shadow: 0 16px 48px rgba(12, 15, 18, 0.25);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qr-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.qr-modal-title {
  font-family: 'Reddit Sans', sans-serif;
  font-size: 17px;
  font-weight: 700;
  color: #0C0F12;
}

.qr-modal-close {
  background: #F1F1F1;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0C0F12;
  transition: background 0.2s;
}
.qr-modal-close:hover { background: #C9C9C9; }

.qr-error-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(243, 131, 19, 0.10);
  border-left: 3px solid #F38313;
  border-radius: 8px;
  padding: 10px 14px;
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  color: #F38313;
  font-weight: 500;
  line-height: 1.4;
}

.qr-reader-box {
  width: 100%;
  height: 220px;
  background: #000;
  border-radius: 10px;
  overflow: hidden;
}

.qr-manual-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.qr-manual-label {
  font-family: 'Roboto', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #0C0F12;
}

.qr-manual-input {
  border: 1.5px solid #C9C9C9;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  color: #0C0F12;
  background: #F6F4F4;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
  width: 100%;
}
.qr-manual-input:focus {
  border-color: #F38313;
  box-shadow: 0 0 0 3px rgba(243, 131, 19, 0.15);
}

.qr-ok-btn {
  background: #F38313;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Reddit Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}
.qr-ok-btn:hover { background: #D97210; }
</style>
