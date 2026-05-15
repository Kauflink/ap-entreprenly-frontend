import { SaleStatus } from './sale-status.enum.js'
import { PaymentMethod } from './payment-method.enum.js'

export class Sale {
    constructor({
        id = null,
        sellerId = null,
        items = [],
        total = 0,
        paymentMethod = PaymentMethod.CASH,
        status = SaleStatus.IN_PROGRESS,
        createdAt = null,
        completedAt = null
    } = {}) {
        this.id = id
        this.sellerId = sellerId
        this.items = items
        this.total = total
        this.paymentMethod = paymentMethod
        this.status = status
        this.createdAt = createdAt
        this.completedAt = completedAt
    }
}
