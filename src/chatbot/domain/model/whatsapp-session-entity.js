export class WhatsappSession {
  static Status = {
    CONNECTED:    'connected',
    DISCONNECTED: 'disconnected',
    EXPIRED:      'expired'
  }

  constructor({ id, sellerId, phone, businessName, status, connectedAt = null, qrCode = null }) {
    this.id           = id
    this.sellerId     = sellerId
    this.phone        = phone
    this.businessName = businessName
    this.status       = status
    this.connectedAt  = connectedAt
    this.qrCode       = qrCode
  }

  get isConnected() { return this.status === WhatsappSession.Status.CONNECTED }
}
