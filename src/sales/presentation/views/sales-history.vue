<script setup>
/**
 * Sales history panel. Shows the sales registered on the selected business day (newest first,
 * scrollable) and opens a detail modal with the line items.
 */
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import useSalesStore from '@/sales/application/sales.store.js'
import { useCurrencyFormatter } from '@/shared/infrastructure/currency-formatter.js'
import { PaymentMethod } from '@/sales/domain/model/payment-method.enum.js'

const store = useSalesStore()
const { sales, salesLoading, selectedDate } = storeToRefs(store)
const { format } = useCurrencyFormatter()

const selectedSale = ref(null)

function onDateChange(event) {
    const value = event.target.value
    if (value) store.selectDate(value)
}

function methodLabel(sale) {
    return sale.paymentMethod === PaymentMethod.CASH ? 'Efectivo' : 'Tarjeta / Yape / Plin'
}

function measure(item) {
    return item.isWeighted ? `${item.quantity} kg` : `${item.quantity} u.`
}

function pad(value) {
    return String(value).padStart(2, '0')
}

function timeLabel(date) {
    const d = date instanceof Date ? date : new Date(date)
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function dateTimeLabel(date) {
    const d = date instanceof Date ? date : new Date(date)
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${timeLabel(d)}`
}

function openDetail(sale) {
    selectedSale.value = sale
}

function closeDetail() {
    selectedSale.value = null
}
</script>

<template>
    <section class="history">
        <div class="history-head">
            <h2 class="history-title">Historial de ventas</h2>
            <input
                type="date"
                class="history-date"
                :value="selectedDate"
                @change="onDateChange"
            />
        </div>

        <p v-if="salesLoading" class="history-empty">Cargando ventas…</p>
        <p v-else-if="sales.length === 0" class="history-empty">
            No hay ventas registradas para este día.
        </p>
        <div v-else class="history-list">
            <button
                v-for="sale in sales"
                :key="sale.id"
                class="history-row"
                type="button"
                @click="openDetail(sale)"
            >
                <span class="row-time">{{ timeLabel(sale.createdAt) }}</span>
                <span class="row-method">{{ methodLabel(sale) }}</span>
                <span class="row-items">{{ sale.items.length }} prod.</span>
                <span class="row-total">{{ format(sale.total) }}</span>
            </button>
        </div>
    </section>

    <div v-if="selectedSale" class="modal-backdrop" @click="closeDetail">
        <div class="detail-modal" @click.stop>
            <button class="close-btn" type="button" @click="closeDetail">✕</button>
            <h3 class="detail-title">Detalle de venta</h3>
            <p class="detail-sub">
                {{ dateTimeLabel(selectedSale.createdAt) }} · {{ methodLabel(selectedSale) }}
            </p>
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Cant./Peso</th>
                        <th>P. Unit.</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in selectedSale.items" :key="index">
                        <td>{{ item.productName }}</td>
                        <td>{{ measure(item) }}</td>
                        <td>{{ format(item.unitPrice) }}</td>
                        <td>{{ format(item.subtotal) }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="detail-total">
                <span>Total</span>
                <span>{{ format(selectedSale.total) }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.history {
    margin-top: 24px;
    background: var(--color-card-bg);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
}

.history-title {
    font-size: 18px;
    font-weight: bold;
    margin: 0;
    color: var(--color-text-strong);
}

.history-date {
    border: 1px solid var(--color-border, #d0d7de);
    border-radius: 8px;
    padding: 6px 10px;
    font-size: 14px;
    color: var(--color-text-strong);
    background: var(--color-card-bg);
}

.history-empty {
    color: var(--color-text-muted);
    font-size: 14px;
    text-align: center;
    padding: 16px 0;
    margin: 0;
}

.history-list {
    max-height: 260px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 4px;
}

.history-row {
    display: grid;
    grid-template-columns: 60px 1fr auto auto;
    align-items: center;
    gap: 12px;
    width: 100%;
    text-align: left;
    background: var(--color-bg, #f6f7f9);
    border: 1px solid transparent;
    border-radius: 10px;
    padding: 10px 14px;
    cursor: pointer;
    font-size: 14px;
    transition: border-color 0.15s ease;
}

.history-row:hover {
    border-color: var(--color-primary);
}

.row-time {
    font-weight: 600;
    color: var(--color-text-strong);
}

.row-method {
    color: var(--color-text-muted);
}

.row-items {
    color: var(--color-text-muted);
    font-size: 13px;
}

.row-total {
    font-weight: 700;
    color: var(--color-primary);
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.detail-modal {
    background: var(--color-card-bg, #fff);
    border-radius: 16px;
    padding: 24px;
    width: min(520px, 92vw);
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    border: none;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
    color: var(--color-text-muted);
}

.detail-title {
    margin: 0 0 4px;
    font-size: 20px;
    color: var(--color-text-strong);
}

.detail-sub {
    margin: 0 0 16px;
    color: var(--color-text-muted);
    font-size: 14px;
}

.detail-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.detail-table th,
.detail-table td {
    text-align: left;
    padding: 8px 6px;
    border-bottom: 1px solid var(--color-border, #eee);
}

.detail-table th {
    color: var(--color-text-muted);
    font-weight: 600;
}

.detail-total {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    font-weight: 700;
    font-size: 16px;
    color: var(--color-text-strong);
}

.detail-total span:last-child {
    color: var(--color-primary);
}
</style>
