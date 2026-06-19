export class ChatOrder {
  static Status = {
    PENDING:         'PENDING',
    WAITING_PAYMENT: 'WAITING_PAYMENT',
    CONFIRMED:       'CONFIRMED',
    CANCELLED:       'CANCELLED',
    BLOCKED:         'BLOCKED'
  }

  constructor({ id, conversationId, orderNumber, items, total, deliveryAddress, paymentMethod, status, hasReceipt, receiptImageUrl, rejectionCount, createdAt }) {
    this.id               = id
    this.conversationId   = conversationId
    this.orderNumber      = orderNumber
    this.items            = items
    this.total            = total
    this.deliveryAddress  = deliveryAddress
    this.paymentMethod    = paymentMethod
    this.status           = status
    this.hasReceipt       = hasReceipt
    this.receiptImageUrl  = receiptImageUrl ?? null
    this.rejectionCount   = rejectionCount
    this.createdAt        = createdAt
  }
}
