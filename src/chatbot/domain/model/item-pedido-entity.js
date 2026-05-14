export class ItemPedido {
  constructor({ productoId = null, nombre = '', cantidad = 0, precioUnitario = 0, tipo = null }) {
    this.productoId = productoId
    this.nombre = nombre
    this.cantidad = cantidad
    this.precioUnitario = precioUnitario
    this.tipo = tipo
  }

  get subtotal() {
    return this.cantidad * this.precioUnitario
  }
}
