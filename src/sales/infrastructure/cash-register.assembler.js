import { CashRegister } from '@/sales/domain/model/cash-register-entity.js'

export class CashRegisterAssembler {
    static toEntityFromResource(resource) {
        return new CashRegister({
            id: resource.id,
            date: resource.date,
            totalCash: resource.totalCash,
            totalDigital: resource.totalDigital
        })
    }

    static toResourceFromEntity(cashRegister) {
        return {
            id: cashRegister.id,
            date: cashRegister.date,
            totalCash: cashRegister.totalCash,
            totalDigital: cashRegister.totalDigital
        }
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) return []
        const resources = response.data instanceof Array ? response.data : [response.data]
        return resources.map(r => this.toEntityFromResource(r))
    }
}
