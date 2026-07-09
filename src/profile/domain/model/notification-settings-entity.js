export class NotificationSettings {
    constructor({
        id = 0,
        stockAlerts = false
    } = {}) {
        this.id = id
        this.stockAlerts = stockAlerts
    }
}
