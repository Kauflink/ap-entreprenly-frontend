export class SubscriptionLimit {
    constructor({
        id = '',
        label = '',
        usedValue = 0,
        maxValue = 0
    } = {}) {
        this.id = id
        this.label = label
        this.usedValue = usedValue
        this.maxValue = maxValue
    }

    get percentageUsed() {
        if (this.maxValue <= 0) return 0
        return Math.min(Math.round((this.usedValue / this.maxValue) * 100), 100)
    }
}
