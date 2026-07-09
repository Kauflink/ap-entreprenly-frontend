<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js'

const { t } = useI18n()
const { format } = useCurrencyFormatter()

const props = defineProps({
    ticketItems:    { type: Array,   default: () => [] },
    showEmptyError: { type: Boolean, default: false },
    products:       { type: Array,   default: () => [] },
    loading:        { type: Boolean, default: false }
})

const emit = defineEmits(['product-selected', 'item-deleted'])

const searchTerm   = ref('')
const dropdownOpen = ref(false)

const filteredProducts = computed(() => {
    const q = searchTerm.value.trim().toLowerCase()
    if (!q) return []
    return props.products.filter(p => p.name.toLowerCase().includes(q))
})

const showNotFound = computed(() =>
    searchTerm.value.trim().length > 0 && filteredProducts.value.length === 0
)

function onSearchInput(val) {
    searchTerm.value = val
    dropdownOpen.value = filteredProducts.value.length > 0
}
function onSearchFocus() {
    if (filteredProducts.value.length > 0) dropdownOpen.value = true
}
function onSearchBlur() {
    setTimeout(() => { dropdownOpen.value = false }, 150)
}
function onSelectProduct(product) {
    searchTerm.value   = ''
    dropdownOpen.value = false
    emit('product-selected', product)
}
function deleteItem(index) {
    emit('item-deleted', index)
}

function formatQty(item) {
    return item.isWeighted
        ? item.quantity.toFixed(3) + ' ' + t('sales.ticket.kg')
        : item.quantity + ' ' + t('sales.ticket.unit')
}
</script>

<template>
    <section class="card detail-card">
        <h2 class="card-title">
            <span class="title-icon">☀</span>
            {{ t('sales.detail.title') }}
        </h2>

        <div class="search-container">
            <input
                type="text"
                :placeholder="t('sales.search.placeholder')"
                class="search-input"
                :value="searchTerm"
                :disabled="loading"
                autocomplete="off"
                @input="onSearchInput($event.target.value)"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
            />

            <ul v-if="dropdownOpen && filteredProducts.length > 0" class="suggestions-dropdown">
                <li
                    v-for="product in filteredProducts"
                    :key="product.id"
                    class="suggestion-item"
                    @mousedown.prevent="onSelectProduct(product)"
                >
                    {{ product.name }}
                </li>
            </ul>

            <div v-if="showNotFound" class="not-found-message">
                <span class="error-icon">⊘</span>
                {{ t('sales.search.notFound') }}
            </div>

            <div v-if="showEmptyError" class="not-found-message">
                <span class="error-icon">⊘</span>
                {{ t('sales.search.emptyTicket') }}
            </div>
        </div>

        <div class="table-wrap">
        <table class="ticket-table">
            <thead>
                <tr>
                    <th>{{ t('sales.ticket.col.product') }}</th>
                    <th>{{ t('sales.ticket.col.type') }}</th>
                    <th>{{ t('sales.ticket.col.quantity') }}</th>
                    <th>{{ t('sales.ticket.col.unitPrice') }}</th>
                    <th>{{ t('sales.ticket.col.subtotal') }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="ticketItems.length === 0" class="empty-row">
                    <td colspan="6">{{ t('sales.ticket.empty') }}</td>
                </tr>
                <tr v-for="(item, index) in ticketItems" :key="index">
                    <td class="product-cell">{{ item.productName }}</td>
                    <td>
                        <span v-if="!item.isWeighted" class="badge badge-unit">
                            📦 {{ t('sales.ticket.badge.unit') }}
                        </span>
                        <span v-else class="badge badge-weight">
                            ⚖ {{ t('sales.ticket.badge.weight') }}
                        </span>
                    </td>
                    <td>{{ formatQty(item) }}</td>
                    <td>{{ format(item.unitPrice) }}</td>
                    <td>{{ format(item.subtotal) }}</td>
                    <td>
                        <button class="delete-btn" @click="deleteItem(index)">🗑</button>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
    </section>
</template>

<style scoped>
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

.search-container { position: relative; margin-bottom: 16px; }
.search-input {
    width: 100%;
    padding: 14px 24px;
    background: var(--color-avatar-bg);
    color: var(--color-avatar-fg);
    border: none;
    border-radius: 30px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    font-family: inherit;
}
.search-input:disabled { cursor: not-allowed; opacity: 0.7; }
.search-input::placeholder { color: var(--color-text-muted); }

.suggestions-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0; right: 0;
    background: var(--color-card-bg);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    list-style: none;
    margin: 0;
    padding: 8px 0;
    max-height: 280px;
    overflow-y: auto;
    z-index: 100;
}
.suggestion-item {
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    color: var(--color-text-strong);
    transition: background 0.15s ease;
}
.suggestion-item:hover {
    background: var(--color-theme-btn-active-bg);
    color: var(--color-primary);
    font-weight: 500;
}

.not-found-message {
    margin-top: 8px;
    padding: 10px 20px;
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-danger);
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
}
.error-icon { font-size: 14px; font-weight: bold; }

.table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
}
.ticket-table { width: 100%; min-width: 480px; border-collapse: collapse; }
.ticket-table th {
    text-align: left;
    padding: 12px 8px;
    font-weight: 500;
    color: var(--color-text-strong);
    border-bottom: 1px solid var(--color-card-border);
    font-size: 14px;
}
.ticket-table td {
    padding: 12px 8px;
    font-size: 14px;
    color: var(--color-text-primary);
}
.empty-row td {
    text-align: center;
    color: var(--color-text-muted);
    padding: 40px 0;
}
.product-cell { font-weight: 500; color: var(--color-text-strong); }

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
}
.badge-unit   { background: var(--color-primary); color: #fff; }
.badge-weight { background: var(--color-avatar-bg); color: var(--color-avatar-fg); }

.delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: var(--color-danger);
    padding: 4px 8px;
    border-radius: 4px;
}
.delete-btn:hover { background: rgba(211, 47, 47, 0.12); }

@media (max-width: 600px) {
    .card { padding: 16px; }
}
</style>
