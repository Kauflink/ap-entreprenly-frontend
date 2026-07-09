import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
    BillingSetup,
    detectCardBrand,
    normalizePaymentMethods,
    paymentMethodIdentity
} from '@/subscription/domain/model/billing-setup-entity.js'
import { SubscriptionActivity } from '@/subscription/domain/model/subscription-activity-entity.js'
import { SubscriptionDashboard } from '@/subscription/domain/model/subscription-dashboard-entity.js'
import { SubscriptionLimit } from '@/subscription/domain/model/subscription-limit-entity.js'
import { SubscriptionApi } from '@/subscription/infrastructure/subscription-api.js'
import useAuthStore from '@/auth/application/auth.store.js'
import i18n from '@/i18n.js'

const subscriptionApi = new SubscriptionApi()

function formatCurrency(priceInPen) {
    return `S/ ${Number(priceInPen ?? 0).toFixed(2)}`
}

function t(key, params) {
    return i18n.global.t(key, params)
}

const useSubscriptionStore = defineStore('subscription', () => {
    const authStore = useAuthStore()
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
        feedback.value = t('subscription.feedback.controlPlanSelected')
    }

    function activateControlPlan() {
        return subscriptionApi.activateControlPlan(authStore.userId, selectedCycle.value)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                selectedPlanId.value = null
                feedback.value = t('subscription.feedback.controlPlanActivated')
            })
    }

    function scheduleCancellation() {
        return subscriptionApi.scheduleCancellation(authStore.userId)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                feedback.value = t('subscription.feedback.cancellationScheduled')
            })
    }

    function keepControlPlan() {
        return subscriptionApi.keepControlPlan(authStore.userId)
            .then(nextDashboard => {
                dashboardSignal.value = nextDashboard
                feedback.value = t('subscription.feedback.controlPlanKept')
            })
    }

    function addPaymentMethod(paymentMethodInput, skipApi = false) {
        const currentDashboard = dashboard.value
        const currentPaymentMethods = normalizePaymentMethods(currentDashboard.billingSetup.paymentMethods)
        const paymentMethod = toPaymentMethod(paymentMethodInput, currentPaymentMethods)
        const existingPaymentMethod = currentPaymentMethods.find(method =>
            paymentMethodIdentity(method) === paymentMethodIdentity(paymentMethod)
        )
        const nextPaymentMethod = existingPaymentMethod
            ? { ...paymentMethod, id: existingPaymentMethod.id }
            : paymentMethod
        const billingSetup = new BillingSetup({
            ...currentDashboard.billingSetup,
            hasPaymentMethod: true,
            paymentMethodDescription: toPaymentMethodDescription(nextPaymentMethod),
            paymentMethodActionLabel: t('subscription.billing.paymentMethod.manageAction'),
            paymentMethods: currentPaymentMethods
                .filter(method => method.id !== nextPaymentMethod.id)
                .map(method => ({ ...method, isDefault: false }))
                .concat(nextPaymentMethod)
        })

        return saveBillingSetup(billingSetup, t('subscription.feedback.paymentMethodAdded'), skipApi)
    }

    function selectPaymentMethod(paymentMethodId, skipApi = false) {
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

        return saveBillingSetup(billingSetup, t('subscription.feedback.paymentMethodSelected'), skipApi)
    }

    function completeFiscalData(fiscalData, skipApi = false) {
        const currentDashboard = dashboard.value
        const billingSetup = new BillingSetup({
            ...currentDashboard.billingSetup,
            hasFiscalData: true,
            fiscalDataDescription: `${fiscalData.documentType} ${fiscalData.documentNumber} - ${fiscalData.businessName}`,
            fiscalDataActionLabel: t('subscription.billing.fiscalData.editAction'),
            fiscalData
        })

        return saveBillingSetup(billingSetup, t('subscription.feedback.fiscalDataCompleted'), skipApi)
    }

    function downloadActivityHistory() {
        const activity = subscriptionActivityRows()

        if (activity.length === 0) {
            feedback.value = t('subscription.feedback.historyEmpty')
            return
        }

        const csvContent = `\uFEFF${toSubscriptionActivityCsv(activity)}`
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const anchor = document.createElement('a')

        anchor.href = url
        anchor.download = t('subscription.history.fileName')
        anchor.click()
        URL.revokeObjectURL(url)
        feedback.value = t('subscription.history.downloaded')
    }

    function toSubscriptionActivityCsv(activity) {
        const rows = activity.map(item =>
            [item.title, item.detail].map(value => toCsvValue(value)).join(',')
        )

        return ['sep=,', t('subscription.history.csvHeader'), ...rows].join('\r\n')
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
                title: t('subscription.history.paymentMethod.title'),
                detail: paymentMethodActivityDetail(currentDashboard.billingSetup)
            }),
            new SubscriptionActivity({
                id: 'fiscal-data',
                title: t('subscription.history.fiscalData.title'),
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
            return t('subscription.activity.current-status.detail.free')
        }

        const price = formatCurrency(currentDashboard.currentPlan.monthlyPrice)

        if (currentDashboard.currentPlan.status === 'scheduled-cancellation') {
            return t('subscription.activity.current-status.detail.scheduled-cancellation', { price })
        }

        return t('subscription.activity.current-status.detail.active', { price })
    }

    function paymentMethodActivityDetail(billingSetup) {
        const paymentMethod = billingSetup.paymentMethods.find(method => method.isDefault)
            ?? billingSetup.paymentMethods.at(-1)

        if (!paymentMethod) return t('subscription.history.paymentMethod.empty')

        return t('subscription.history.paymentMethod.detail', {
            brand: paymentMethod.cardBrand,
            lastFour: paymentMethod.lastFour
        })
    }

    function fiscalDataActivityDetail(billingSetup) {
        const fiscalData = billingSetup.fiscalData

        if (fiscalData === null) return t('subscription.history.fiscalData.empty')

        return t('subscription.history.fiscalData.detail', {
            documentType: fiscalData.documentType,
            documentNumber: fiscalData.documentNumber,
            businessName: fiscalData.businessName
        })
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

    function saveBillingSetup(billingSetup, nextFeedback, skipApi = false) {
        const nextDashboard = new SubscriptionDashboard({
            ...dashboard.value,
            billingSetup
        })

        dashboardSignal.value = nextDashboard

        if (skipApi) {
            feedback.value = nextFeedback
            return Promise.resolve()
        }

        return subscriptionApi.updateBillingSetup(authStore.userId, billingSetup)
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
        return t('subscription.billing.paymentMethod.cardEnding', {
            brand: paymentMethod.cardBrand,
            lastFour: paymentMethod.lastFour,
            month: paymentMethod.expiryMonth,
            year: paymentMethod.expiryYear
        })
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
