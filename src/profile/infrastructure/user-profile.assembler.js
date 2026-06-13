import { UserProfile } from '@/profile/domain/model/user-profile-entity.js'

export class UserProfileAssembler {
    static toEntityFromResource(resource = {}) {
        return new UserProfile({
            id: resource.id,
            firstName: resource.firstName,
            lastName: resource.lastName,
            phone: resource.phone ?? null,
            avatarUrl: resource.avatarUrl ?? null,
            role: resource.role,
            plan: resource.plan
        })
    }

    static toResourceFromEntity(entity) {
        return {
            firstName: entity.firstName,
            lastName: entity.lastName,
            phone: entity.phone,
            avatarUrl: entity.avatarUrl
        }
    }
}
