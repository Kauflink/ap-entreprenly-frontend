export class InventoryProduct {
  constructor({ id, name, unitPrice, isWeighted, availableStock }) {
    this.id             = id
    this.name           = name
    this.unitPrice      = unitPrice
    this.isWeighted     = isWeighted
    this.availableStock = availableStock
  }
}
