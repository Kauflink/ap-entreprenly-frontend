import { UserPreferences } from '@/profile/domain/model/user-preferences-entity.js'

export class UserPreferencesAssembler {
    static toEntityFromResource(resource = {}) {
        return new UserPreferences({
            id: resource.id,
            language: resource.language,
            timezone: resource.timezone,
            theme: resource.theme,
            currency: resource.currency
        })
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            language: entity.language,
            timezone: entity.timezone,
            theme: entity.theme,
            currency: entity.currency
        }
    }
}
