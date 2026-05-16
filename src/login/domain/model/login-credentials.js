export class LoginCredentials {
    constructor({
        email = '',
        password = '',
        rememberSession = false
    } = {}) {
        this.email = email.trim().toLowerCase()
        this.password = password
        this.rememberSession = rememberSession
    }

    get valid() {
        return this.email.includes('@') && this.password.length > 0
    }
}
