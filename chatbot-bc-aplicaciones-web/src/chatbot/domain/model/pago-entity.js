// Regla: el pago digital requiere validación manual del comerciante
// Estados: pendiente_validacion → aprobado | rechazado
export class Pago {
  static Estado = {
    PENDIENTE_VALIDACION: 'pendiente_validacion',
    APROBADO:             'aprobado',
    RECHAZADO:            'rechazado'
  }

  static Metodo = {
    YAPE:          'yape',
    PLIN:          'plin',
    TRANSFERENCIA: 'transferencia'
  }

  constructor({ id = null, pedidoId = null, monto = 0, metodo = null, comprobante = null, estado = null, fechaReporte = null }) {
    this.id           = id
    this.pedidoId     = pedidoId
    this.monto        = monto
    this.metodo       = metodo
    this.comprobante  = comprobante
    this.estado       = estado ?? Pago.Estado.PENDIENTE_VALIDACION
    this.fechaReporte = fechaReporte
  }
}
