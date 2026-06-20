import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { SubscriptionAssembler } from '@/subscription/infrastructure/subscription.assembler.js'

const subscriptionsPath =
    import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH ?? '/subscriptions'
const unitProductsPath =
    import.meta.env.VITE_UNIT_PRODUCT_ENDPOINT_PATH ?? '/inventory-unit-products'
const weightProductsPath =
    import.meta.env.VITE_WEIGHT_PRODUCT_ENDPOINT_PATH ?? '/inventory-weight-products'
const unitLotsPath =
    import.meta.env.VITE_UNIT_LOT_ENDPOINT_PATH ?? '/inventory-unit-lots'
const weightLotsPath =
    import.meta.env.VITE_WEIGHT_LOT_ENDPOINT_PATH ?? '/inventory-weight-lots'

export class SubscriptionApi extends BaseApi {
    // The backend owns all subscription business logic (status, renewal dates and activity).
    // The frontend just reads the dashboard and triggers the dedicated action endpoints.

    getSubscriptionDashboard() {
        return this.http.get(`${subscriptionsPath}/me/dashboard`)
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

    activateControlPlan(userId, billingCycle) {
        return this.http.post(`${subscriptionsPath}/by-user/${userId}/activate-control`, { billingCycle })
            .then(response => SubscriptionAssembler.toEntityFromResponse(response.data))
    }

    scheduleCancellation(userId) {
        return this.http.post(`${subscriptionsPath}/by-user/${userId}/schedule-cancellation`)
            .then(response => SubscriptionAssembler.toEntityFromResponse(response.data))
    }

    keepControlPlan(userId) {
        return this.http.post(`${subscriptionsPath}/by-user/${userId}/keep-control`)
            .then(response => SubscriptionAssembler.toEntityFromResponse(response.data))
    }

    updateBillingSetup(userId, billingSetup) {
        const payload = SubscriptionAssembler.toBillingSetupResponseFromEntity(billingSetup)
        return this.http.put(`${subscriptionsPath}/by-user/${userId}/billing-setup`, payload)
            .then(response => SubscriptionAssembler.toEntityFromResponse(response.data))
    }
}
