export class NotificationSettings {
    constructor({
        id = 0,
        stockAlerts = false,
        paymentAlerts = false,
        chatbotMessages = false
    } = {}) {
        this.id = id
        this.stockAlerts = stockAlerts
        this.paymentAlerts = paymentAlerts
        this.chatbotMessages = chatbotMessages
    }
}
