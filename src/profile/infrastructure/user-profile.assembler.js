import { UserProfile } from '@/profile/domain/model/user-profile-entity.js'

export class UserProfileAssembler {
    static toEntityFromResource(resource = {}) {
        return new UserProfile({
            id: resource.id,
            firstName: resource.first_name,
            lastName: resource.last_name,
            avatarUrl: resource.avatar_url,
            role: resource.role,
            plan: resource.plan
        })
    }

    static toResourceFromEntity(entity) {
        return {
            id: entity.id,
            first_name: entity.firstName,
            last_name: entity.lastName,
            avatar_url: entity.avatarUrl,
            role: entity.role,
            plan: entity.plan
        }
    }
}
