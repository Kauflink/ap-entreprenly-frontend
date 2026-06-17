import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SalesApi } from '@/sales/infrastructure/sales-api.js'
import { ProductAssembler } from '@/sales/infrastructure/product.assembler.js'
import { SaleAssembler } from '@/sales/infrastructure/sale.assembler.js'
import { Sale } from '@/sales/domain/model/sale-entity.js'
import { PaymentMethod } from '@/sales/domain/model/payment-method.enum.js'
import { SaleStatus } from '@/sales/domain/model/sale-status.enum.js'

const salesApi = new SalesApi()

const WEIGHT_ID_OFFSET = 1000

/** Returns the current business day (America/Lima) as an ISO date string (YYYY-MM-DD). */
function todayLocalIso() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())
}

/** Rounds a monetary amount to two decimals to avoid floating-point drift. */
function roundToCents(amount) {
    return Math.round(amount * 100) / 100
}

const useSalesStore = defineStore('sales', () => {
    const products     = ref([])
    const unitLots     = ref([])
    const weightLots   = ref([])
    const sales        = ref([])
    const salesLoading = ref(false)
    const selectedDate = ref(todayLocalIso())
    const loading      = ref(false)
    const error        = ref(null)

    // Cash summary totals are derived from the real sales of the selected day so that the
    // "Resumen de Caja" always matches the sales history (single source of truth).
    const totalCash = computed(() =>
        roundToCents(sales.value
            .filter(sale => sale.paymentMethod === PaymentMethod.CASH)
            .reduce((sum, sale) => sum + sale.total, 0)))
    const totalDigital = computed(() =>
        roundToCents(sales.value
            .filter(sale => sale.paymentMethod !== PaymentMethod.CASH)
            .reduce((sum, sale) => sum + sale.total, 0)))
    const totalDay  = computed(() => roundToCents(totalCash.value + totalDigital.value))
    const saleCount = computed(() => sales.value.length)

    function fetchProducts() {
        loading.value = true
        error.value   = null

        Promise.all([
            salesApi.getUnitProducts(),
            salesApi.getWeightProducts(),
            salesApi.getUnitLots(),
            salesApi.getWeightLots()
        ]).then(([unitRes, weightRes, unitLotsRes, weightLotsRes]) => {
            unitLots.value   = unitLotsRes.data
            weightLots.value = weightLotsRes.data

            const unitEntities   = unitRes.data.map(p =>
                ProductAssembler.toEntityFromUnitResource(p, unitLots.value))
            const weightEntities = weightRes.data.map(p =>
                ProductAssembler.toEntityFromWeightResource(p, weightLots.value))

            products.value = [...unitEntities, ...weightEntities]
            loading.value  = false
        }).catch(err => {
            error.value   = err.message
            loading.value = false
        })
    }

    /** Refetches the product list from the API. Call when the Sales view is (re)entered. */
    function reloadProducts() {
        fetchProducts()
    }

    /** Loads the sales registered on the currently selected business day, newest first. */
    function loadSales() {
        salesLoading.value = true
        return salesApi.getSalesByDate(selectedDate.value).then(response => {
            sales.value = (response.data || [])
                .map(resource => SaleAssembler.toEntityFromResource(resource))
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            salesLoading.value = false
        }).catch(err => {
            error.value = err.message
            salesLoading.value = false
        })
    }

    /** Selects a business day and reloads its sales. */
    function selectDate(date) {
        selectedDate.value = date
        loadSales()
    }

    function reloadSalesIfViewingToday() {
        if (selectedDate.value === todayLocalIso()) {
            loadSales()
        }
    }

    // selection is the UI payment selection: 'CASH' or 'DIGITAL'. Digital sales are settled
    // with a card/wallet payment method on the backend.
    function createSale(items, selection) {
        const total      = Number(items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2))
        const isDigital  = selection === 'DIGITAL'
        const domainMethod = isDigital ? PaymentMethod.CARD : PaymentMethod.CASH

        const sale = new Sale({
            sellerId: 1,
            items,
            total,
            paymentMethod: domainMethod,
            status: SaleStatus.COMPLETED,
            createdAt: new Date()
        })

        return salesApi.createSale(SaleAssembler.toResourceFromEntity(sale))
            .then(res => {
                const created = SaleAssembler.toEntityFromResource(res.data)
                reloadSalesIfViewingToday()
                return _decrementStock(items)
                    .then(() => {
                        fetchProducts()
                        return created
                    })
            })
            .catch(err => {
                error.value = err.message
                throw err
            })
    }

    function _decrementStock(items) {
        const patches = []

        for (const item of items) {
            if (!item.isWeighted) {
                const productId = item.productId
                let remaining = item.quantity

                const sortedLots = [...unitLots.value]
                    .filter(l => l.productId === productId)
                    .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate))

                for (const lot of sortedLots) {
                    if (remaining <= 0) break
                    const decrement = Math.min(lot.quantity, remaining)
                    remaining -= decrement
                    patches.push(salesApi.patchUnitLot(lot.id, lot.quantity - decrement))
                }
            } else {
                const productId = item.productId - WEIGHT_ID_OFFSET
                let remaining = item.quantity

                const sortedLots = [...weightLots.value]
                    .filter(l => l.productId === productId)
                    .sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate))

                for (const lot of sortedLots) {
                    if (remaining <= 0) break
                    const decrement = Math.min(lot.quantityKg, remaining)
                    remaining = Number((remaining - decrement).toFixed(3))
                    patches.push(salesApi.patchWeightLot(lot.id, Number((lot.quantityKg - decrement).toFixed(3))))
                }
            }
        }

        return Promise.all(patches)
    }

    function getScaleStatus() {
        return salesApi.getScaleStatus()
            .then(res => res.data)
            .catch(() => ({ connected: false }))
    }

    return {
        products, sales, salesLoading, selectedDate, loading, error,
        totalCash, totalDigital, totalDay, saleCount,
        fetchProducts, reloadProducts, loadSales, selectDate, createSale, getScaleStatus
    }
})

export default useSalesStore
