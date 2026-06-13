/**
 * Authenticated user returned by the IAM backend on sign-in.
 */
export class AuthenticatedUser {
    constructor({ id = 0, email = '', token = '' } = {}) {
        this.id = id
        this.email = email
        this.token = token
    }
}
