<script setup>
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import ProductCard from '../components/product-card.vue'
import useChatbotStore from 'chatbot-bc-aplicaciones-web/src/chatbot/application/chatbot.store.js'

const { t } = useI18n()
const store = useChatbotStore()

// Regla: al entrar al catálogo, recargar desde API (máx. caché 30 seg)
onMounted(() => {
  store.fetchProductos()
})

const productosOrdenados = computed(() =>
  [...store.productos].sort((a, b) => a.nombre.localeCompare(b.nombre))
)

function getSeveridadStock(producto) {
  if (producto.stock <= 0) return 'danger'
  if (producto.stock < 5)  return 'warn'
  return 'success'
}

function formatearPrecio(producto) {
  const sufijo = producto.tipo === 'peso' ? '/kg' : ' c/u'
  return `S/ ${Number(producto.precio).toFixed(2)}${sufijo}`
}
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-3">
      <h1 style="color: #F38313;">{{ t('catalogo.title') }}</h1>
      <pv-button
        icon="pi pi-refresh"
        label="Actualizar"
        text
        @click="store.fetchProductos()"
      />
    </div>

    <p class="text-sm mb-4" style="color: #888;">
      <i class="pi pi-info-circle mr-1" />
      El catálogo se sincroniza con el inventario cada 30 segundos.
      Los productos <strong>por kg</strong> tienen stock actualizado por balanza IoT.
    </p>

    <!-- Tabla principal -->
    <pv-card>
      <template #content>
        <pv-data-table
          :value="productosOrdenados"
          :loading="!store.productosLoaded"
          class="p-datatable-sm"
        >
          <pv-column field="nombre" :header="t('catalogo.nombre')" sortable />

          <pv-column field="descripcion" header="Descripción" />

          <pv-column :header="t('catalogo.precio')" sortable field="precio">
            <template #body="{ data }">
              <span class="font-semibold" style="color: #F38313;">
                {{ formatearPrecio(data) }}
              </span>
            </template>
          </pv-column>

          <pv-column :header="t('catalogo.tipo')">
            <template #body="{ data }">
              <div class="flex align-items-center gap-1">
                <i :class="`pi ${data.tipo === 'peso' ? 'pi-wifi' : 'pi-box'}`" style="color: #F38313;" />
                <span class="text-sm">
                  {{ data.tipo === 'peso' ? t('catalogo.peso') : t('catalogo.unidad') }}
                </span>
              </div>
            </template>
          </pv-column>

          <pv-column :header="t('catalogo.stock')">
            <template #body="{ data }">
              <pv-tag
                :value="data.stock <= 0 ? t('catalogo.sin_stock') : (data.tipo === 'peso' ? `${data.stock} kg` : `${data.stock} und.`)"
                :severity="getSeveridadStock(data)"
              />
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>

    <!-- Vista de tarjetas (alternativa visual) -->
    <h2 class="mt-4 mb-3" style="font-size: 1rem; color: #555;">Vista de tarjetas</h2>
    <div class="grid">
      <div
        v-for="producto in productosOrdenados"
        :key="producto.id"
        class="col-12 md:col-4 lg:col-3"
      >
        <product-card :producto="producto" />
      </div>
    </div>
  </div>
</template>
