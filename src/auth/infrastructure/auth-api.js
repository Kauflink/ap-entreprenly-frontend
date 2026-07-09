import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { AuthAssembler } from '@/auth/infrastructure/auth.assembler.js'

const authPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH ?? '/authentication'
const usersPath = import.meta.env.VITE_USERS_ENDPOINT_PATH ?? '/users'

/**
 * HTTP client for the IAM authentication and account-management endpoints.
 */
export class AuthApi extends BaseApi {
    signIn(email, password) {
        return this.http
            .post(`${authPath}/sign-in`, { email, password })
            .then(response => AuthAssembler.toEntityFromResource(response.data))
    }

    signUp(request) {
        return this.http.post(`${authPath}/sign-up`, request).then(response => response.data)
    }

    /** Changes the authenticated user's password; the current password is verified server-side. */
    changePassword(currentPassword, newPassword) {
        return this.http
            .put(`${usersPath}/me/password`, { currentPassword, newPassword })
            .then(response => response.data)
    }

    /** Changes the authenticated user's email. The current JWT becomes stale afterwards. */
    changeEmail(email) {
        return this.http.put(`${usersPath}/me/email`, { email }).then(response => response.data)
    }
}
