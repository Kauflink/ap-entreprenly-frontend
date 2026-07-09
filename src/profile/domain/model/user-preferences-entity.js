export class UserPreferences {
    constructor({
        id = 0,
        language = 'es',
        timezone = '',
        theme = 'light',
        currency = 'PEN'
    } = {}) {
        this.id = id
        this.language = language
        this.timezone = timezone
        this.theme = theme
        this.currency = currency
    }
}
