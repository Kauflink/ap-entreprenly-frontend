// Regla de negocio: si rechazos >= 2, el comerciante recibe una alerta
export class Cliente {
  constructor({ id = null, nombre = '', telefono = '', rechazos = 0 }) {
    this.id = id
    this.nombre = nombre
    this.telefono = telefono
    this.rechazos = rechazos
  }

  get tieneAlerta() {
    return this.rechazos >= 2
  }
}
