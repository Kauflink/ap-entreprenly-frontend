export class CashRegister {
    constructor({ id = null, date = null, totalCash = 0, totalDigital = 0 } = {}) {
        this.id = id
        this.date = date
        this.totalCash = totalCash ?? 0
        this.totalDigital = totalDigital ?? 0
    }

    get totalDay() {
        return Number((this.totalCash + this.totalDigital).toFixed(2))
    }
}
