import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { SubscriptionAssembler } from '@/subscription/infrastructure/subscription.assembler.js'

const subscriptionDashboardPath =
    import.meta.env.VITE_SUBSCRIPTION_DASHBOARD_ENDPOINT_PATH ?? '/subscription-dashboard/1'
const subscriptionActivationPath =
    import.meta.env.VITE_SUBSCRIPTION_PAYMENT_CONFIRMATION_ENDPOINT_PATH ?? '/subscription-payment-confirmation/1'
const unitProductsPath =
    import.meta.env.VITE_UNIT_PRODUCT_ENDPOINT_PATH ?? '/inventory-unit-products'
const weightProductsPath =
    import.meta.env.VITE_WEIGHT_PRODUCT_ENDPOINT_PATH ?? '/inventory-weight-products'
const unitLotsPath =
    import.meta.env.VITE_UNIT_LOT_ENDPOINT_PATH ?? '/inventory-unit-lots'
const weightLotsPath =
    import.meta.env.VITE_WEIGHT_LOT_ENDPOINT_PATH ?? '/inventory-weight-lots'

export class SubscriptionApi extends BaseApi {
    getSubscriptionDashboard() {
        return this.http.get(subscriptionDashboardPath)
            .then(response => SubscriptionAssembler.toEntityFromResponse(response.data))
    }

    getInventoryUsage() {
        return Promise.all([
            this.http.get(unitProductsPath),
            this.http.get(weightProductsPath),
            this.http.get(unitLotsPath),
            this.http.get(weightLotsPath)
        ]).then(([unitProducts, weightProducts, unitLots, weightLots]) => ({
            products: (unitProducts.data ?? []).length + (weightProducts.data ?? []).length,
            lots: (unitLots.data ?? []).length + (weightLots.data ?? []).length
        })).catch(() => ({ products: 0, lots: 0 }))
    }

    activateControlPlan(billingCycle, currentDashboard) {
        return this.http.get(subscriptionActivationPath)
            .then(response => response.data)
            .then(response => ({
                ...response,
                billingSetup: SubscriptionAssembler.toBillingSetupResponseFromEntity(currentDashboard.billingSetup)
            }))
            .then(response => this.withNewSubscriptionPeriod(response, billingCycle))
            .then(response => this.saveSubscriptionDashboard(response))
            .then(response => SubscriptionAssembler.toEntityFromResponse(response))
    }

    updateBillingSetup(currentDashboard, billingSetup) {
        const response = {
            ...SubscriptionAssembler.toResourceFromEntity(currentDashboard),
            billingSetup: SubscriptionAssembler.toBillingSetupResponseFromEntity(billingSetup)
        }

        return this.saveSubscriptionDashboard(response)
            .then(savedResponse => SubscriptionAssembler.toEntityFromResponse(savedResponse))
    }

    scheduleCancellation(currentDashboard) {
        const response = this.withScheduledCancellation(
            SubscriptionAssembler.toResourceFromEntity(currentDashboard)
        )

        return this.saveSubscriptionDashboard(response)
            .then(savedResponse => SubscriptionAssembler.toEntityFromResponse(savedResponse))
    }

    keepControlPlan(currentDashboard) {
        const response = this.withActiveRenewal(
            SubscriptionAssembler.toResourceFromEntity(currentDashboard)
        )

        return this.saveSubscriptionDashboard(response)
            .then(savedResponse => SubscriptionAssembler.toEntityFromResponse(savedResponse))
    }

    saveSubscriptionDashboard(response) {
        return this.http.put(subscriptionDashboardPath, response)
            .then(saved => saved.data)
    }

    withNewSubscriptionPeriod(response, billingCycle) {
        const startDate = this.today()
        const endDate = this.addBillingCycle(startDate, billingCycle)
        const startDateText = this.toDateInputValue(startDate)
        const endDateText = this.toDateInputValue(endDate)
        const endDateLabel = this.formatDate(endDateText)

        return this.withActiveRenewal({
            ...response,
            defaultBillingCycle: billingCycle,
            currentPlan: {
                ...response.currentPlan,
                currentPeriodStartDate: startDateText,
                currentPeriodEndDate: endDateText,
                shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. Se renovara automaticamente.`
            }
        })
    }

    withScheduledCancellation(response) {
        const currentPlan = response.currentPlan
        const endDateLabel = this.formatDate(currentPlan.currentPeriodEndDate)

        return {
            ...response,
            currentPlan: {
                ...currentPlan,
                status: 'scheduled-cancellation',
                statusLabel: 'Cancelacion programada',
                shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. No se renovara automaticamente.`
            },
            activity: this.withSubscriptionActivity(response, {
                statusDetail: 'Cancelacion programada',
                billingDetail: `Acceso vigente hasta el ${endDateLabel} - sin siguiente cobro`
            })
        }
    }

    withActiveRenewal(response) {
        const currentPlan = response.currentPlan
        const endDateLabel = this.formatDate(currentPlan.currentPeriodEndDate)

        return {
            ...response,
            currentPlan: {
                ...currentPlan,
                status: 'active',
                statusLabel: 'Plan Control activo',
                shortDescription: `Tu plan sigue activo hasta el ${endDateLabel}. Se renovara automaticamente.`
            },
            activity: this.withSubscriptionActivity(response, {
                statusDetail: 'Plan Control activo',
                billingDetail: `Proxima renovacion: ${endDateLabel} - ${this.billingCycleLabel(response.defaultBillingCycle)}`
            })
        }
    }

    withSubscriptionActivity(response, activity) {
        const existingCreatedAccount = response.activity.find(item => item.id === 'created-account')

        return [
            existingCreatedAccount ?? {
                id: 'created-account',
                title: 'Cuenta creada',
                detail: '16 abril 2026 - Plan Free asignado automaticamente'
            },
            {
                id: 'current-status',
                title: 'Estado actual',
                detail: activity.statusDetail
            },
            {
                id: 'billing',
                title: 'Facturacion',
                detail: activity.billingDetail
            }
        ]
    }

    today() {
        const now = new Date()
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
    }

    addBillingCycle(date, billingCycle) {
        return billingCycle === 'annual'
            ? this.addMonthsPreservingMonthEnd(date, 12)
            : this.addMonthsPreservingMonthEnd(date, 1)
    }

    addMonthsPreservingMonthEnd(date, months) {
        const targetMonthStart = new Date(date.getFullYear(), date.getMonth() + months, 1)
        const originalMonthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
        const targetMonthLastDay = new Date(
            targetMonthStart.getFullYear(),
            targetMonthStart.getMonth() + 1,
            0
        ).getDate()
        const targetDay = date.getDate() === originalMonthLastDay
            ? targetMonthLastDay
            : Math.min(date.getDate(), targetMonthLastDay)

        return new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth(), targetDay)
    }

    toDateInputValue(date) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')

        return `${year}-${month}-${day}`
    }

    toLocalDate(dateValue) {
        const [year, month, day] = String(dateValue ?? '').split('-').map(value => Number(value))
        if (!year || !month || !day) return null
        return new Date(year, month - 1, day)
    }

    formatDate(dateValue) {
        const date = this.toLocalDate(dateValue)
        return date === null
            ? 'la fecha registrada en tu suscripcion'
            : new Intl.DateTimeFormat('es-PE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date)
    }

    billingCycleLabel(billingCycle) {
        return billingCycle === 'annual' ? 'pago anual' : 'pago mensual'
    }
}
