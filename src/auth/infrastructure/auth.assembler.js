import { AuthenticatedUser } from '@/auth/domain/model/authenticated-user.js'

/**
 * Converts authentication resources from the API into domain entities.
 */
export class AuthAssembler {
    static toEntityFromResource(resource) {
        return new AuthenticatedUser({
            id: resource.id,
            email: resource.email,
            token: resource.token
        })
    }
}
