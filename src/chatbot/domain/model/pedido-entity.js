// Sigue el patrón de tutorial-entity.js del profe (clase con constructor destructuring)
// Agrega static Estado (estilo compañero) y lógica de timeout (regla de negocio 60 min)
export class Pedido {
  static Estado = {
    PENDIENTE_PAGO:  'pendiente_pago',
    PAGO_REPORTADO:  'pago_reportado',
    APROBADO:        'aprobado',
    CANCELADO:       'cancelado'
  }

  // Tiempo límite para pagar: 60 minutos
  static TIMEOUT_MS = 60 * 60 * 1000

  constructor({
    id             = null,
    clienteId      = null,
    clienteNombre  = '',
    clienteTelefono = '',
    items          = [],
    total          = 0,
    estado         = null,
    fechaCreacion  = null,
    fechaExpiracion = null,
    comprobante    = null
  }) {
    this.id              = id
    this.clienteId       = clienteId
    this.clienteNombre   = clienteNombre
    this.clienteTelefono = clienteTelefono
    this.items           = items
    this.total           = total
    this.estado          = estado ?? Pedido.Estado.PENDIENTE_PAGO
    this.fechaCreacion   = fechaCreacion
    this.fechaExpiracion = fechaExpiracion
    this.comprobante     = comprobante
  }

  // true si ya pasaron los 60 minutos sin pago
  get estaVencido() {
    if (!this.fechaExpiracion) return false
    return new Date() > new Date(this.fechaExpiracion)
  }

  // cuántos minutos quedan antes de que expire
  get minutosRestantes() {
    if (!this.fechaExpiracion) return 0
    const diff = new Date(this.fechaExpiracion) - new Date()
    return Math.max(0, Math.floor(diff / 60000))
  }
}
