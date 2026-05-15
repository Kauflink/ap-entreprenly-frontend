export class SaleItem {
    constructor({ id = null, productId = null, productName = '', unitPrice = 0, quantity = 0, isWeighted = false } = {}) {
        this.id = id
        this.productId = productId
        this.productName = productName
        this.unitPrice = unitPrice
        this.quantity = quantity
        this.isWeighted = isWeighted
    }

    get subtotal() {
        return Number((this.unitPrice * this.quantity).toFixed(2))
    }
}
