import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { AuthAssembler } from '@/auth/infrastructure/auth.assembler.js'

const authPath = import.meta.env.VITE_AUTH_ENDPOINT_PATH ?? '/authentication'

/**
 * HTTP client for the IAM authentication endpoints.
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
}
