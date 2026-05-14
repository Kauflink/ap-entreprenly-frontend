import { BaseApi } from '@/shared/infrastructure/base-api.js'
import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js'

const unitProductsPath    = '/inventory-unit-products'
const weightProductsPath  = '/inventory-weight-products'
const unitLotsPath        = '/inventory-unit-lots'
const weightLotsPath      = '/inventory-weight-lots'
const salesPath           = '/sales'
const cashRegistersPath   = '/cash-registers'

export class SalesApi extends BaseApi {
    #unitProductsEndpoint
    #weightProductsEndpoint
    #unitLotsEndpoint
    #weightLotsEndpoint
    #salesEndpoint
    #cashRegistersEndpoint

    constructor() {
        super()
        this.#unitProductsEndpoint   = new BaseEndpoint(this, unitProductsPath)
        this.#weightProductsEndpoint = new BaseEndpoint(this, weightProductsPath)
        this.#unitLotsEndpoint       = new BaseEndpoint(this, unitLotsPath)
        this.#weightLotsEndpoint     = new BaseEndpoint(this, weightLotsPath)
        this.#salesEndpoint          = new BaseEndpoint(this, salesPath)
        this.#cashRegistersEndpoint  = new BaseEndpoint(this, cashRegistersPath)
    }

    getUnitProducts()    { return this.#unitProductsEndpoint.getAll() }
    getWeightProducts()  { return this.#weightProductsEndpoint.getAll() }
    getUnitLots()        { return this.#unitLotsEndpoint.getAll() }
    getWeightLots()      { return this.#weightLotsEndpoint.getAll() }

    createSale(sale)     { return this.#salesEndpoint.create(sale) }

    getCashRegisterByDate(date) {
        return this.http.get(`${cashRegistersPath}?date=${date}`)
    }
    createCashRegister(date) {
        return this.#cashRegistersEndpoint.create({ date, totalCash: 0, totalDigital: 0, saleCount: 0 })
    }
    updateCashRegister(register) {
        return this.#cashRegistersEndpoint.update(register.id, register)
    }

    patchUnitLot(id, quantity) {
        return this.http.patch(`${unitLotsPath}/${id}`, { quantity })
    }
    patchWeightLot(id, quantityKg) {
        return this.http.patch(`${weightLotsPath}/${id}`, { quantityKg })
    }
}
