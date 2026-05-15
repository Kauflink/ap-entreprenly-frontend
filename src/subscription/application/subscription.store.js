import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { BillingSetup, detectCardBrand } from '@/subscription/domain/model/billing-setup-entity.js'
import { SubscriptionActivity } from '@/subscription/domain/model/subscription-activity-entity.js'
import { SubscriptionDashboard } from '@/subscription/domain/model/subscription-dashboard-entity.js'
import { SubscriptionLimit } from '@/subscription/domain/model/subscription-limit-entity.js'
import { SubscriptionApi } from '@/subscription/infrastructure/subscription-api.js'

const subscriptionApi = new SubscriptionApi()

function formatCurrency(priceInPen) {
    return `S/ ${Number(priceInPen ?? 0).toFixed(2)}`
}

const useSubscriptionStore = defineStore('subscription', () => {
    const dashboardSignal = ref(new SubscriptionDashboard())
    const inventoryUsage = ref({ products: 0, lots: 0 })
    const loaded = ref(false)
    const loading = ref(true)
    const selectedCycle = ref('monthly')
    const selectedPlanId = ref(null)
    const feedback = ref('')
    const error = ref(null)

    const dashboard = computed(() => withInventoryUsage(dashboardSignal.value))
    const controlPlanSelected = computed(() =>
        selectedPlanId.value === dashboardSignal.value.recommendedPlan.id
    )

    function loadDashboard() {
        if (loaded.value) return Promise.resolve()

        loading.value = true
        error.value = null

        return Promise.all([
            subscriptionApi.getSubscriptionDashboard(),
            subscriptionApi.getInventoryUsage()
        ]).then(([loadedDashboard, usage]) => {
            dashboardSignal.value = loadedDashboard
            inventoryUsage.value = usage
            selectedCycle.value = loadedDashboard.defaultBillingCycle ?? 'monthly'
            loaded.value = true
        }).catch(err => {
            error.value = err.message
        }).finally(() => {
            loading.value = false
        })
    }

    function selectBillingCycle(cycle) {
        selectedCycle.value = cycle
    }

    function selectControlPlan() {
        const plan = dashboardSignal.value.recommendedPlan
        selectedPlanId.value = plan.id
        feedback.value = 'Plan Control seleccionado. Completa facturacion para continuar.'
    }

    function activateControlPlan() {
        return subscriptionApi.activateControlPlan(selectedCycle.value, dashboard.value)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                selectedPlanId.value = null
                feedback.value = 'Suscripcion actualizada a Plan Control.'
            })
    }

    function scheduleCancellation() {
        return subscriptionApi.scheduleCancellation(dashboard.value)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                feedback.value = 'Cancelacion programada.'
            })
    }

    function keepControlPlan() {
        return subscriptionApi.keepControlPlan(dashboard.value)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                feedback.value = 'Plan Control se mantendra activo.'
            })
    }

    function addPaymentMethod(paymentMethodInput) {
        const currentDashboard = dashboard.value
        const currentPaymentMethods = currentDashboard.billingSetup.paymentMethods
        const paymentMethod = toPaymentMethod(paymentMethodInput, currentPaymentMethods)
        const billingSetup = new BillingSetup({
            ...currentDashboard.billingSetup,
            hasPaymentMethod: true,
            paymentMethodDescription: toPaymentMethodDescription(paymentMethod),
            paymentMethodActionLabel: 'Agregar metodos de pago',
            paymentMethods: [
                ...currentPaymentMethods.map(method => ({ ...method, isDefault: false })),
                paymentMethod
            ]
        })

        return saveBillingSetup(billingSetup, 'Metodo de pago registrado para la suscripcion.')
    }

    function selectPaymentMethod(paymentMethodId) {
        const currentDashboard = dashboard.value
        const selectedPaymentMethod = currentDashboard.billingSetup.paymentMethods
            .find(paymentMethod => paymentMethod.id === paymentMethodId)

        if (!selectedPaymentMethod) return Promise.resolve()

        const billingSetup = new BillingSetup({
            ...currentDashboard.billingSetup,
            hasPaymentMethod: true,
            paymentMethodDescription: toPaymentMethodDescription(selectedPaymentMethod),
            paymentMethods: currentDashboard.billingSetup.paymentMethods.map(paymentMethod => ({
                ...paymentMethod,
                isDefault: paymentMethod.id === paymentMethodId
            }))
        })

        return saveBillingSetup(billingSetup, 'Metodo de pago seleccionado para la suscripcion.')
    }

    function completeFiscalData(fiscalData) {
        const currentDashboard = dashboard.value
        const billingSetup = new BillingSetup({
            ...currentDashboard.billingSetup,
            hasFiscalData: true,
            fiscalDataDescription: `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`,
            fiscalDataActionLabel: 'Editar datos fiscales',
            fiscalData
        })

        return saveBillingSetup(billingSetup, 'Datos fiscales completados para facturacion.')
    }

    function downloadActivityHistory() {
        const activity = subscriptionActivityRows()

        if (activity.length === 0) {
            feedback.value = 'No hay actividad suficiente para descargar.'
            return
        }

        const csvContent = `\uFEFF${toSubscriptionActivityCsv(activity)}`
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')

        anchor.href = url
        anchor.download = 'historial-suscripcion-entreprenly.csv'
        anchor.click()
        URL.revokeObjectURL(url)
        feedback.value = 'Historial de suscripcion descargado.'
    }

    function toSubscriptionActivityCsv(activity) {
        const rows = activity.map(item =>
            [item.title, item.detail].map(value => toCsvValue(value)).join(',')
        )

        return ['sep=,', 'Evento,Detalle', ...rows].join('\r\n')
    }

    function toCsvValue(value) {
        return `"${String(value ?? '').replaceAll('"', '""')}"`
    }

    function subscriptionActivityRows() {
        const currentDashboard = dashboard.value

        return [
            ...currentDashboard.activity.map(item => withCurrentCurrencyActivityDetail(item, currentDashboard)),
            new SubscriptionActivity({
                id: 'payment-method',
                title: 'Metodo de pago',
                detail: paymentMethodActivityDetail(currentDashboard.billingSetup)
            }),
            new SubscriptionActivity({
                id: 'fiscal-data',
                title: 'Datos fiscales',
                detail: fiscalDataActivityDetail(currentDashboard.billingSetup)
            })
        ]
    }

    function withCurrentCurrencyActivityDetail(activity, currentDashboard) {
        if (activity.id !== 'current-status') return activity

        return new SubscriptionActivity({
            ...activity,
            detail: currentStatusActivityDetail(currentDashboard)
        })
    }

    function currentStatusActivityDetail(currentDashboard) {
        if (currentDashboard.currentPlan.status === 'free') {
            return 'Plan Free activo - Sin cargos registrados'
        }

        const price = formatCurrency(currentDashboard.currentPlan.monthlyPrice)

        if (currentDashboard.currentPlan.status === 'scheduled-cancellation') {
            return `Cancelacion programada - ${price}/mes`
        }

        return `Plan Control activo - ${price}/mes`
    }

    function paymentMethodActivityDetail(billingSetup) {
        const paymentMethod = billingSetup.paymentMethods.find(method => method.isDefault)
            ?? billingSetup.paymentMethods.at(-1)

        if (!paymentMethod) return 'Sin metodo de pago registrado.'

        return `${paymentMethod.cardBrand} terminada en ${paymentMethod.lastFour} registrada para pagos y renovaciones`
    }

    function fiscalDataActivityDetail(billingSetup) {
        const fiscalData = billingSetup.fiscalData

        if (fiscalData === null) return 'Datos fiscales pendientes de completar.'

        return `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`
    }

    function withInventoryUsage(currentDashboard) {
        return new SubscriptionDashboard({
            ...currentDashboard,
            limits: currentDashboard.limits.map(limit => withCurrentLimitUsage(limit))
        })
    }

    function withCurrentLimitUsage(limit) {
        if (limit.id === 'products') {
            return new SubscriptionLimit({
                ...limit,
                usedValue: inventoryUsage.value.products || limit.usedValue
            })
        }

        if (limit.id === 'active-batches') {
            return new SubscriptionLimit({
                ...limit,
                usedValue: inventoryUsage.value.lots || limit.usedValue
            })
        }

        return limit
    }

    function saveBillingSetup(billingSetup, nextFeedback) {
        const nextDashboard = new SubscriptionDashboard({
            ...dashboard.value,
            billingSetup
        })

        dashboardSignal.value = nextDashboard

        return subscriptionApi.updateBillingSetup(nextDashboard, billingSetup)
            .then(savedDashboard => {
                dashboardSignal.value = savedDashboard
                feedback.value = nextFeedback
            })
    }

    function toPaymentMethod(paymentMethodInput, currentPaymentMethods) {
        const sanitizedCardNumber = paymentMethodInput.cardNumber.replace(/\D/g, '')

        return {
            id: nextPaymentMethodId(currentPaymentMethods),
            cardBrand: detectCardBrand(sanitizedCardNumber).label,
            lastFour: sanitizedCardNumber.slice(-4),
            holderName: paymentMethodInput.holderName.trim(),
            expiryMonth: paymentMethodInput.expiryMonth.padStart(2, '0'),
            expiryYear: paymentMethodInput.expiryYear.slice(-2),
            isDefault: true
        }
    }

    function nextPaymentMethodId(paymentMethods) {
        return `payment-method-${paymentMethods.length + 1}`
    }

    function toPaymentMethodDescription(paymentMethod) {
        return `${paymentMethod.cardBrand} terminada en ${paymentMethod.lastFour} - vence ${paymentMethod.expiryMonth}/${paymentMethod.expiryYear}`
    }

    return {
        dashboard,
        loading,
        selectedCycle,
        selectedPlanId,
        feedback,
        error,
        controlPlanSelected,
        loadDashboard,
        selectBillingCycle,
        selectControlPlan,
        activateControlPlan,
        scheduleCancellation,
        keepControlPlan,
        addPaymentMethod,
        selectPaymentMethod,
        completeFiscalData,
        downloadActivityHistory
    }
})

export default useSubscriptionStore
