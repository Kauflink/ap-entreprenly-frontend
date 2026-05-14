<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useSalesStore from '@/sales/application/sales.store.js'
import { storeToRefs } from 'pinia'
import { SaleItem } from '@/sales/domain/model/sale-item-entity.js'
import SalesCart from './sales-cart.vue'
import PaymentMethod from './payment-method.vue'
import CashSummary from './cash-summary.vue'
import QuantityModal from '../components/quantity-modal.vue'
import WeightModal from '../components/weight-modal.vue'

const { t } = useI18n()
const store = useSalesStore()
const { loading } = storeToRefs(store)

const cartItems        = ref([])
const pendingProduct   = ref(null)
const paymentMethod    = ref(null)
const showEmptyError   = ref(false)
const showPaymentError = ref(false)
const showQuantityModal  = ref(false)
const showWeightModal    = ref(false)
const showSuccessModal   = ref(false)

const subtotal  = computed(() =>
    Number(cartItems.value.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)))
const itemCount = computed(() => cartItems.value.length)

onMounted(() => {
    store.fetchProducts()
    store.loadTodayCashRegister()
})

function onProductSelected(product) {
    pendingProduct.value = product
    if (product.isWeighted) showWeightModal.value  = true
    else                     showQuantityModal.value = true
}

function onQuantityConfirm(quantity) {
    showQuantityModal.value = false
    addToCart(pendingProduct.value, quantity)
}
function onWeightConfirm(weightKg) {
    showWeightModal.value = false
    addToCart(pendingProduct.value, weightKg)
}
function onQuantityCancel() { showQuantityModal.value = false }
function onWeightCancel()   { showWeightModal.value   = false }

function addToCart(product, quantity) {
    const idx = cartItems.value.findIndex(i => i.productId === product.id)
    if (idx >= 0) {
        cartItems.value[idx].quantity = Number((cartItems.value[idx].quantity + quantity).toFixed(3))
    } else {
        cartItems.value.push(new SaleItem({
            productId: product.id, productName: product.name,
            unitPrice: product.unitPrice, quantity, isWeighted: product.isWeighted
        }))
    }
    showEmptyError.value = false
}

function onItemDeleted(index) {
    cartItems.value.splice(index, 1)
}

function onMethodSelected(method) {
    paymentMethod.value    = method
    showPaymentError.value = false
}

function onFinalizeSale() {
    if (itemCount.value === 0) { showEmptyError.value = true; return }
    if (!paymentMethod.value)  { showPaymentError.value = true; return }

    store.createSale(cartItems.value, paymentMethod.value)
        .then(() => {
            resetTicket()
            showSuccessModal.value = true
            setTimeout(() => { showSuccessModal.value = false }, 2000)
        })
        .catch(() => {})
}

function onCancelSale() {
    resetTicket()
}

function resetTicket() {
    cartItems.value        = []
    paymentMethod.value    = null
    showEmptyError.value   = false
    showPaymentError.value = false
}

function onCloseSuccessModal() {
    showSuccessModal.value = false
}
</script>

<template>
    <div class="sales-page">
        <header class="page-header">
            <h1>{{ t('sales.page.title') }}</h1>
            <p class="subtitle">{{ t('sales.page.subtitle') }}</p>
        </header>

        <div class="main-layout">
            <div class="left-column">
                <SalesCart
                    :ticket-items="cartItems"
                    :show-empty-error="showEmptyError"
                    :products="store.products"
                    :loading="loading"
                    @product-selected="onProductSelected"
                    @item-deleted="onItemDeleted"
                />
                <CashSummary />
            </div>

            <aside class="right-column">
                <section class="card summary-card">
                    <h2 class="card-title">
                        <span class="title-icon">☀</span>
                        {{ t('sales.summary.title') }}
                    </h2>
                    <div class="summary-row">
                        <span>{{ t('sales.summary.subtotal') }}</span>
                        <span>S/ {{ subtotal.toFixed(2) }}</span>
                    </div>
                    <div class="summary-row">
                        <span>{{ t('sales.summary.itemsLabel') }}</span>
                        <span>{{ itemCount }} {{ t('sales.summary.items') }}</span>
                    </div>
                    <hr />
                    <div class="summary-total">
                        <span>{{ t('sales.summary.total') }}</span>
                        <span class="total-value">S/ {{ subtotal.toFixed(2) }}</span>
                    </div>
                </section>

                <PaymentMethod
                    :has-items="itemCount > 0"
                    :selected-method="paymentMethod"
                    :show-error="showPaymentError"
                    @method-selected="onMethodSelected"
                    @finalize-sale="onFinalizeSale"
                    @cancel-sale="onCancelSale"
                />
            </aside>
        </div>

        <QuantityModal
            v-if="showQuantityModal"
            :product="pendingProduct"
            @confirm="onQuantityConfirm"
            @cancel="onQuantityCancel"
        />

        <WeightModal
            v-if="showWeightModal"
            :product="pendingProduct"
            @confirm="onWeightConfirm"
            @cancel="onWeightCancel"
        />

        <div v-if="showSuccessModal" class="modal-backdrop" @click="onCloseSuccessModal">
            <div class="success-modal" @click.stop>
                <button class="close-btn" @click="onCloseSuccessModal">✕</button>
                <h2 class="success-title">{{ t('sales.success.title') }}</h2>
                <div class="success-check">✅</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.sales-page {
    max-width: 1400px;
    margin: 0 auto;
}

.page-header { margin-bottom: 24px; }
.page-header h1 {
    font-size: 40px;
    margin: 0 0 4px 0;
    font-weight: 600;
    color: var(--color-text-strong);
}
.page-header .subtitle {
    color: var(--color-text-muted);
    margin: 0;
    font-size: 15px;
}

.main-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 24px;
    align-items: start;
}
.left-column  { display: flex; flex-direction: column; }
.right-column { display: flex; flex-direction: column; gap: 16px; }

.card {
    background: var(--color-card-bg);
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.card-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-strong);
}
.title-icon { color: var(--color-primary); font-size: 16px; }

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    font-size: 14px;
    color: var(--color-text-muted);
}
.summary-card hr {
    border: none;
    border-top: 1px solid var(--color-card-border);
    margin: 12px 0;
}
.summary-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
    font-weight: bold;
    color: var(--color-text-strong);
}
.total-value { color: var(--color-primary); }

/* Success modal */
.modal-backdrop {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}
.success-modal {
    background: var(--color-card-bg);
    border-radius: 20px;
    padding: 40px 60px;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}
.success-modal .close-btn {
    position: absolute;
    top: 12px; right: 12px;
    background: var(--color-card-border);
    border: none;
    border-radius: 50%;
    width: 32px; height: 32px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-secondary);
}
.success-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: var(--color-text-strong);
}
.success-check { font-size: 64px; }

@media (max-width: 1080px) {
    .main-layout { grid-template-columns: 1fr; }
}
</style>
