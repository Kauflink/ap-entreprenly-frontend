export class UserProfile {
    constructor({
        id = 0,
        firstName = '',
        lastName = '',
        avatarUrl = null,
        role = '',
        plan = ''
    } = {}) {
        this.id = id
        this.firstName = firstName
        this.lastName = lastName
        this.avatarUrl = avatarUrl
        this.role = role
        this.plan = plan
    }

    get fullName() {
        return `${this.firstName} ${this.lastName}`.trim()
    }

    get roleAndPlan() {
        return `${this.role} - ${this.plan}`
    }
}
