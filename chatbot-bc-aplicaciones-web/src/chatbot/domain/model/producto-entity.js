// Inspirado en product-entity.js del compañero (feature/inventory)
// Agrega static Tipo para distinguir stock por peso (IoT) vs unidad
export class Producto {
  static Tipo = {
    UNIDAD: 'unidad',
    PESO: 'peso'
  }

  constructor({ id = null, nombre = '', descripcion = '', precio = 0, tipo = null, stock = 0 }) {
    this.id = id
    this.nombre = nombre
    this.descripcion = descripcion
    this.precio = precio
    this.tipo = tipo
    this.stock = stock
  }

  // Regla: productos por peso tienen stock IoT, no se modifica manualmente
  get esPorPeso() {
    return this.tipo === Producto.Tipo.PESO
  }

  get precioFormateado() {
    const sufijo = this.esPorPeso ? '/kg' : ' c/u'
    return `S/ ${Number(this.precio).toFixed(2)}${sufijo}`
  }
}
