export class PlanFeature {
    constructor({
        description = '',
        available = true
    } = {}) {
        this.description = description
        this.available = available
    }
}

export class SubscriptionPlan {
    constructor({
        id = '',
        name = '',
        shortDescription = '',
        monthlyPrice = 0,
        annualPrice = 0,
        status = 'free',
        statusLabel = '',
        badgeLabel = '',
        recommended = false,
        currentPeriodStartDate = '',
        currentPeriodEndDate = '',
        features = []
    } = {}) {
        this.id = id
        this.name = name
        this.shortDescription = shortDescription
        this.monthlyPrice = monthlyPrice
        this.annualPrice = annualPrice
        this.status = status
        this.statusLabel = statusLabel
        this.badgeLabel = badgeLabel
        this.recommended = recommended
        this.currentPeriodStartDate = currentPeriodStartDate
        this.currentPeriodEndDate = currentPeriodEndDate
        this.features = features
    }
}
