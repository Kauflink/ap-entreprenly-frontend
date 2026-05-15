import { BillingSetup } from './billing-setup-entity.js'
import { SubscriptionActivity } from './subscription-activity-entity.js'
import { SubscriptionLimit } from './subscription-limit-entity.js'
import { SubscriptionPlan } from './subscription-plan-entity.js'

export class SubscriptionDashboard {
    constructor({
        defaultBillingCycle = 'monthly',
        currentPlan = new SubscriptionPlan(),
        recommendedPlan = new SubscriptionPlan(),
        limits = [],
        billingSetup = new BillingSetup(),
        activity = []
    } = {}) {
        this.defaultBillingCycle = defaultBillingCycle
        this.currentPlan = currentPlan
        this.recommendedPlan = recommendedPlan
        this.limits = limits
        this.billingSetup = billingSetup
        this.activity = activity
    }
}
