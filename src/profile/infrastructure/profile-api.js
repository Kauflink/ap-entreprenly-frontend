import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { UserProfileAssembler } from '@/profile/infrastructure/user-profile.assembler.js'
import { UserPreferencesAssembler } from '@/profile/infrastructure/user-preferences.assembler.js'
import { NotificationSettingsAssembler } from '@/profile/infrastructure/notification-settings.assembler.js'

const profilePath = import.meta.env.VITE_PROFILE_ENDPOINT_PATH ?? '/profile'

export class ProfileApi extends BaseApi {
    getProfile() {
        return this.http.get(profilePath).then(response => ({
            profile: UserProfileAssembler.toEntityFromResource(response.data.user),
            preferences: UserPreferencesAssembler.toEntityFromResource(response.data.preferences),
            notificationSettings: NotificationSettingsAssembler.toEntityFromResource(response.data.notification_settings)
        }))
    }

    updateProfile(profile, preferences, notificationSettings) {
        const payload = {
            user: UserProfileAssembler.toResourceFromEntity(profile),
            preferences: UserPreferencesAssembler.toResourceFromEntity(preferences),
            notification_settings: NotificationSettingsAssembler.toResourceFromEntity(notificationSettings)
        }
        return this.http.put(profilePath, payload).then(response => ({
            profile: UserProfileAssembler.toEntityFromResource(response.data.user),
            preferences: UserPreferencesAssembler.toEntityFromResource(response.data.preferences),
            notificationSettings: NotificationSettingsAssembler.toEntityFromResource(response.data.notification_settings)
        }))
    }
}
