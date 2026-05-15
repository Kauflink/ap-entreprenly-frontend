export class Conversation {
  static Status = {
    ACTIVE:          'ACTIVE',
    WAITING_PAYMENT: 'WAITING_PAYMENT',
    COMPLETED:       'COMPLETED',
    CLOSED:          'CLOSED'
  }

  constructor({ id, sellerId, clientPhone, clientName, lastMessage, lastMessageTime, status, createdAt, closedAt = null }) {
    this.id              = id
    this.sellerId        = sellerId
    this.clientPhone     = clientPhone
    this.clientName      = clientName
    this.lastMessage     = lastMessage
    this.lastMessageTime = lastMessageTime
    this.status          = status
    this.createdAt       = createdAt
    this.closedAt        = closedAt
  }

  get initials() {
    const parts = this.clientName.trim().split(' ')
    return parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
}
