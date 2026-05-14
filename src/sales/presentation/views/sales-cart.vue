<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
    ticketItems:    { type: Array,   default: () => [] },
    showEmptyError: { type: Boolean, default: false },
    products:       { type: Array,   default: () => [] },
    loading:        { type: Boolean, default: false }
})

const emit = defineEmits(['product-selected', 'item-deleted'])

const searchQuery  = ref('')
const showDropdown = ref(false)

const filteredProducts = computed(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return []
    return props.products.filter(p => p.name.toLowerCase().includes(q))
})

const showNotFound = computed(() =>
    searchQuery.value.trim().length > 0 && showDropdown.value === false && filteredProducts.value.length === 0
)

function onSearchInput() {
    if (searchQuery.value.trim().length > 0) {
        showDropdown.value = filteredProducts.value.length > 0
    } else {
        showDropdown.value = false
    }
}
function onSearchFocus() {
    if (searchQuery.value.trim() && filteredProducts.value.length > 0) showDropdown.value = true
}
function onSearchBlur() {
    setTimeout(() => { showDropdown.value = false }, 150)
}
function selectProduct(product) {
    searchQuery.value  = ''
    showDropdown.value = false
    emit('product-selected', product)
}
function deleteItem(index) {
    emit('item-deleted', index)
}

function formatQty(item) {
    return item.isWeighted
        ? item.quantity.toFixed(3) + ' kg'
        : item.quantity + ' und'
}
</script>

<template>
    <div class="card">
        <h2 class="card-title">
            <span class="title-icon">☀</span>
            {{ t('sales.cart.title') }}
        </h2>

        <div class="search-container">
            <input
                v-model="searchQuery"
                class="search-input"
                type="text"
                :placeholder="t('sales.cart.searchPlaceholder')"
                :disabled="loading"
                autocomplete="off"
                @input="onSearchInput"
                @focus="onSearchFocus"
                @blur="onSearchBlur"
            />

            <ul v-if="showDropdown && filteredProducts.length > 0" class="suggestions-dropdown">
                <li
                    v-for="product in filteredProducts"
                    :key="product.id"
                    class="suggestion-item"
                    @mousedown.prevent="selectProduct(product)"
                >
                    <span>{{ product.name }}</span>
                    <span class="suggestion-price">
                        S/ {{ product.unitPrice.toFixed(2) }}{{ product.isWeighted ? '/kg' : '/und' }}
                    </span>
                </li>
            </ul>
        </div>

        <div v-if="showEmptyError" class="alert-pill alert-danger">
            <span class="material-icons alert-icon">cancel</span>
            {{ t('sales.cart.empty') }}
        </div>

        <div v-else-if="searchQuery.trim() && !showDropdown && filteredProducts.length === 0" class="alert-pill alert-danger">
            <span class="material-icons alert-icon">cancel</span>
            {{ t('sales.cart.notFound') }}
        </div>

        <table class="ticket-table">
            <thead>
                <tr>
                    <th>{{ t('sales.cart.product') }}</th>
                    <th>{{ t('sales.cart.type') }}</th>
                    <th>{{ t('sales.cart.quantity') }}</th>
                    <th>{{ t('sales.cart.unitPrice') }}</th>
                    <th>{{ t('sales.cart.subtotal') }}</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-if="ticketItems.length === 0" class="empty-row">
                    <td colspan="6">{{ t('sales.cart.emptyTicket') }}</td>
                </tr>
                <tr v-for="(item, index) in ticketItems" :key="index">
                    <td class="product-cell">{{ item.productName }}</td>
                    <td>
                        <span :class="['badge', item.isWeighted ? 'badge-weight' : 'badge-unit']">
                            <span class="material-icons badge-icon">
                                {{ item.isWeighted ? 'scale' : 'inventory_2' }}
                            </span>
                            {{ item.isWeighted ? t('sales.cart.typeWeight') : t('sales.cart.typeUnit') }}
                        </span>
                    </td>
                    <td class="qty-cell">{{ formatQty(item) }}</td>
                    <td>S/ {{ item.unitPrice.toFixed(2) }}</td>
                    <td>S/ {{ item.subtotal.toFixed(2) }}</td>
                    <td>
                        <button class="delete-btn" @click="deleteItem(index)">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
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

/* Search */
.search-container { position: relative; margin-bottom: 12px; }
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
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.suggestion-item:hover {
    background: var(--color-theme-btn-active-bg);
    color: var(--color-primary);
    font-weight: 500;
}
.suggestion-price { font-size: 12px; color: var(--color-text-muted); }

/* Alerts */
.alert-pill {
    margin-bottom: 12px;
    padding: 8px 16px;
    border-radius: 30px;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 6px;
}
.alert-danger {
    background: rgba(211, 47, 47, 0.12);
    color: var(--color-danger);
}
.alert-icon { font-size: 16px; }

/* Table */
.ticket-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
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
.qty-cell { font-weight: 600; color: var(--color-text-strong); }

.badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 16px;
    font-size: 12px;
    font-weight: 500;
}
.badge-icon { font-size: 14px; }
.badge-unit   { background: var(--color-primary); color: #fff; }
.badge-weight { background: var(--color-avatar-bg); color: var(--color-avatar-fg); }

.delete-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-danger);
    padding: 4px 8px;
    border-radius: 4px;
    display: flex;
    align-items: center;
}
.delete-btn:hover { background: rgba(211, 47, 47, 0.12); }
.delete-btn .material-icons { font-size: 18px; }
</style>
