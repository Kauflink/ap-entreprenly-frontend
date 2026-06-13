import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { UserProfileAssembler } from '@/profile/infrastructure/user-profile.assembler.js'
import { UserPreferencesAssembler } from '@/profile/infrastructure/user-preferences.assembler.js'
import { NotificationSettingsAssembler } from '@/profile/infrastructure/notification-settings.assembler.js'

const profilesPath = import.meta.env.VITE_PROFILES_ENDPOINT_PATH ?? '/profiles'

function toModels(resource) {
    return {
        id: resource.id,
        profile: UserProfileAssembler.toEntityFromResource(resource),
        preferences: UserPreferencesAssembler.toEntityFromResource(resource),
        notificationSettings: NotificationSettingsAssembler.toEntityFromResource(resource)
    }
}

export class ProfileApi extends BaseApi {
    getProfile(userId) {
        return this.http.get(`${profilesPath}?userId=${userId}`).then(response => {
            // The endpoint returns a collection; pick the profile for this user.
            const list = Array.isArray(response.data) ? response.data : [response.data]
            const resource = list.find(item => item.userId === userId) ?? list[0]
            if (!resource) throw new Error(`Profile not found for user ${userId}`)
            return toModels(resource)
        })
    }

    updateProfile(id, profile) {
        const payload = UserProfileAssembler.toResourceFromEntity(profile)
        return this.http.put(`${profilesPath}/${id}`, payload).then(response => toModels(response.data))
    }

    updatePreferences(id, preferences) {
        const payload = UserPreferencesAssembler.toResourceFromEntity(preferences)
        return this.http.put(`${profilesPath}/${id}/preferences`, payload).then(response => toModels(response.data))
    }

    updateNotifications(id, notificationSettings) {
        const payload = NotificationSettingsAssembler.toResourceFromEntity(notificationSettings)
        return this.http.put(`${profilesPath}/${id}/notification-settings`, payload).then(response => toModels(response.data))
    }
}
