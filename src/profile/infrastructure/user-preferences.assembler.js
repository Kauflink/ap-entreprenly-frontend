import { UserPreferences } from '@/profile/domain/model/user-preferences-entity.js'

const SUPPORTED_CURRENCIES = ['PEN', 'USD', 'EUR']

export class UserPreferencesAssembler {
    static toEntityFromResource(resource = {}) {
        const preferences = resource.preferences ?? {}
        return new UserPreferences({
            id: resource.id,
            language: preferences.language,
            timezone: preferences.timezone,
            theme: preferences.theme === 'dark' ? 'dark' : 'light',
            currency: SUPPORTED_CURRENCIES.includes(preferences.currency) ? preferences.currency : 'PEN'
        })
    }

    static toResourceFromEntity(entity) {
        return {
            language: entity.language,
            timezone: entity.timezone,
            theme: entity.theme,
            currency: entity.currency
        }
    }
}
