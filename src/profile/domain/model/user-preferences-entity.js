export class UserPreferences {
    constructor({ language = 'es', timezone = '', theme = 'light', currency = 'PEN' } = {}) {
        this.language = language
        this.timezone = timezone
        this.theme = theme
        this.currency = currency
    }
}
