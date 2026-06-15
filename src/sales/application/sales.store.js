import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { SalesApi } from '@/sales/infrastructure/sales-api.js'
import { ProductAssembler } from '@/sales/infrastructure/product.assembler.js'
import { SaleAssembler } from '@/sales/infrastructure/sale.assembler.js'
import { CashRegisterAssembler } from '@/sales/infrastructure/cash-register.assembler.js'
import { Sale } from '@/sales/domain/model/sale-entity.js'
import { PaymentMethod } from '@/sales/domain/model/payment-method.enum.js'
import { SaleStatus } from '@/sales/domain/model/sale-status.enum.js'

const salesApi = new SalesApi()

const WEIGHT_ID_OFFSET = 1000

const useSalesStore = defineStore('sales', () => {
    const products     = ref([])
    const unitLots     = ref([])
    const weightLots   = ref([])
    const cashRegister = ref(null)
    const loading      = ref(false)
    const error        = ref(null)

    const totalCash    = computed(() => cashRegister.value?.totalCash    ?? 0)
    const totalDigital = computed(() => cashRegister.value?.totalDigital ?? 0)
    const totalDay     = computed(() => cashRegister.value?.totalDay     ?? 0)

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

    function loadTodayCashRegister() {
        const today = new Date().toISOString().split('T')[0]
        salesApi.getCashRegisterByDate(today).then(response => {
            const list = CashRegisterAssembler.toEntitiesFromResponse(response)
            if (list.length > 0) {
                cashRegister.value = list[0]
            } else {
                salesApi.createCashRegister(today).then(res => {
                    cashRegister.value = CashRegisterAssembler.toEntityFromResource(res.data)
                }).catch(err => {
                    error.value = err.message
                })
            }
        }).catch(err => {
            error.value = err.message
        })
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
                return _updateCashRegister(total, isDigital)
                    .then(() => _decrementStock(items))
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

    function _updateCashRegister(amount, isDigital) {
        if (!cashRegister.value) return Promise.resolve()

        const updated = {
            ...cashRegister.value,
            totalCash:    isDigital
                ? cashRegister.value.totalCash
                : Number((cashRegister.value.totalCash    + amount).toFixed(2)),
            totalDigital: isDigital
                ? Number((cashRegister.value.totalDigital + amount).toFixed(2))
                : cashRegister.value.totalDigital,
            saleCount:    (cashRegister.value.saleCount ?? 0) + 1
        }

        return salesApi.updateCashRegister(updated).then(res => {
            cashRegister.value = CashRegisterAssembler.toEntityFromResource(res.data)
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
        products, cashRegister, loading, error,
        totalCash, totalDigital, totalDay,
        fetchProducts, loadTodayCashRegister, createSale, getScaleStatus
    }
})

export default useSalesStore
