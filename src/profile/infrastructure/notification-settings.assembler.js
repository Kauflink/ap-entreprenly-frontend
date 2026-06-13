import { NotificationSettings } from '@/profile/domain/model/notification-settings-entity.js'

export class NotificationSettingsAssembler {
    static toEntityFromResource(resource = {}) {
        const notifications = resource.notificationSettings ?? {}
        return new NotificationSettings({
            id: resource.id,
            stockAlerts: notifications.stockAlerts ?? false,
            paymentAlerts: notifications.paymentAlerts ?? false,
            chatbotMessages: notifications.chatbotMessages ?? false
        })
    }

    static toResourceFromEntity(entity) {
        return {
            stockAlerts: entity.stockAlerts,
            paymentAlerts: entity.paymentAlerts,
            chatbotMessages: entity.chatbotMessages
        }
    }
}
