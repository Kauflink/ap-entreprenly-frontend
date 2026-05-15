<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const faqs = ref([
  {
    pregunta: '¿Cómo funciona el chatbot de WhatsApp?',
    respuesta: 'El chatbot responde automáticamente a los mensajes de WhatsApp de tus clientes. Muestra el catálogo, recibe pedidos y solicita el comprobante de pago sin que tengas que estar pendiente.'
  },
  {
    pregunta: '¿Cómo apruebo un pago?',
    respuesta: 'Cuando un cliente reporta su pago, aparece en la sección "Pagos por validar" del dashboard. Haz clic en "Validar pago", revisa el comprobante y luego en "Aprobar pago".'
  },
  {
    pregunta: '¿Qué pasa si no apruebo el pago en 60 minutos?',
    respuesta: 'El pedido se cancela automáticamente. El cliente recibe un mensaje de WhatsApp informando que su pedido fue cancelado. Puedes crear un nuevo pedido si el cliente aún quiere comprar.'
  },
  {
    pregunta: '¿Cómo funciona el stock por peso?',
    respuesta: 'Los productos de tipo "peso" están conectados a una balanza IoT. Su stock se actualiza automáticamente en tiempo real. No puedes ni necesitas modificarlo manualmente.'
  },
  {
    pregunta: '¿Qué pasa cuando rechazo el pago de un cliente dos veces?',
    respuesta: 'El sistema lleva un contador de rechazos por cliente. Al llegar a 2, verás una alerta en el dashboard para que puedas revisar si hay algún problema con ese cliente.'
  },
  {
    pregunta: '¿Con qué métodos de pago funciona?',
    respuesta: 'Actualmente se aceptan Yape y Plin. El cliente envía su comprobante por WhatsApp y tú lo validas manualmente desde el dashboard.'
  }
])
</script>

<template>
  <div class="ayuda-page">
    <h1 class="mb-4" style="color: #F38313;">{{ t('ayuda.title') }}</h1>

    <!-- Preguntas frecuentes -->
    <pv-card class="mb-4">
      <template #title>
        <i class="pi pi-question-circle mr-2" style="color: #F38313;" />
        {{ t('ayuda.faq_title') }}
      </template>
      <template #content>
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="mb-3 p-3"
          style="border-left: 3px solid #F38313; background: #fff8f0; border-radius: 0 6px 6px 0;"
        >
          <div class="font-semibold mb-1">{{ faq.pregunta }}</div>
          <div class="text-sm" style="color: #555;">{{ faq.respuesta }}</div>
        </div>
      </template>
    </pv-card>

    <!-- Guías rápidas -->
    <pv-card class="mb-4">
      <template #title>
        <i class="pi pi-book mr-2" style="color: #F38313;" />
        {{ t('ayuda.guias_title') }}
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-4">
            <div class="p-3 text-center" style="border: 1px solid #e0e0e0; border-radius: 8px;">
              <i class="pi pi-comments text-4xl mb-2" style="color: #F38313;" />
              <div class="font-semibold mb-1">Chatbot WhatsApp</div>
              <div class="text-sm" style="color: #777;">Gestión de conversaciones y pedidos automáticos</div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="p-3 text-center" style="border: 1px solid #e0e0e0; border-radius: 8px;">
              <i class="pi pi-credit-card text-4xl mb-2" style="color: #F38313;" />
              <div class="font-semibold mb-1">Validación de pagos</div>
              <div class="text-sm" style="color: #777;">Proceso de aprobación y rechazo manual de comprobantes</div>
            </div>
          </div>
          <div class="col-12 md:col-4">
            <div class="p-3 text-center" style="border: 1px solid #e0e0e0; border-radius: 8px;">
              <i class="pi pi-box text-4xl mb-2" style="color: #F38313;" />
              <div class="font-semibold mb-1">Inventario IoT</div>
              <div class="text-sm" style="color: #777;">Stock por peso actualizado automáticamente desde balanza</div>
            </div>
          </div>
        </div>
      </template>
    </pv-card>

    <!-- Contacto -->
    <pv-card>
      <template #title>
        <i class="pi pi-envelope mr-2" style="color: #F38313;" />
        {{ t('ayuda.contacto_title') }}
      </template>
      <template #content>
        <div class="grid">
          <div class="col-12 md:col-4 flex align-items-center gap-3">
            <i class="pi pi-envelope text-2xl" style="color: #F38313;" />
            <div>
              <div class="text-sm" style="color: #888;">Email</div>
              <div>soporte@entreprenly.com</div>
            </div>
          </div>
          <div class="col-12 md:col-4 flex align-items-center gap-3">
            <i class="pi pi-whatsapp text-2xl" style="color: #F38313;" />
            <div>
              <div class="text-sm" style="color: #888;">WhatsApp soporte</div>
              <div>+51 900 000 000</div>
            </div>
          </div>
          <div class="col-12 md:col-4 flex align-items-center gap-3">
            <i class="pi pi-clock text-2xl" style="color: #F38313;" />
            <div>
              <div class="text-sm" style="color: #888;">Horario de atención</div>
              <div>Lun – Vie, 9:00am – 6:00pm</div>
            </div>
          </div>
        </div>
      </template>
    </pv-card>
  </div>
</template>

<style scoped>
.ayuda-page {
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
}
</style>
