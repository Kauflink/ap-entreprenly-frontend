export class ProductSummary {
    constructor({ id = null, name = '', unitPrice = 0, isWeighted = false, availableStock = 0 } = {}) {
        this.id = id
        this.name = name
        this.unitPrice = unitPrice
        this.isWeighted = isWeighted
        this.availableStock = availableStock
    }
}
