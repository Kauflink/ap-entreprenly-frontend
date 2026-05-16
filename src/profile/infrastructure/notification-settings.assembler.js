import { NotificationSettings } from '@/profile/domain/model/notification-settings-entity.js'

export class NotificationSettingsAssembler {
    static toEntityFromResource(resource = {}) {
        return new NotificationSettings({
            id: resource.id,
            stockAlerts: resource.stock_alerts,
            paymentAlerts: resource.payment_alerts,
            chatbotMessages: resource.chatbot_messages
        })
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            stock_alerts: entity.stockAlerts,
            payment_alerts: entity.paymentAlerts,
            chatbot_messages: entity.chatbotMessages
        }
    }
}
