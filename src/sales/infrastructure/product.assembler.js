import { ProductSummary } from '@/sales/domain/model/product-summary-entity.js'

const WEIGHT_ID_OFFSET = 1000

export class ProductAssembler {
    static toEntityFromUnitResource(resource, lots = []) {
        const productLots = lots.filter(lot => lot.productId === resource.id)
        const availableStock = productLots.reduce((sum, lot) => sum + lot.quantity, 0)
        return new ProductSummary({
            id: resource.id,
            name: resource.name,
            unitPrice: resource.price,
            isWeighted: false,
            availableStock
        })
    }

    static toEntityFromWeightResource(resource, lots = []) {
        const productLots = lots.filter(lot => lot.productId === resource.id)
        const availableStock = productLots.reduce((sum, lot) => sum + lot.quantityKg, 0)
        return new ProductSummary({
            id: resource.id + WEIGHT_ID_OFFSET,
            name: resource.name,
            unitPrice: resource.pricePerKg,
            isWeighted: true,
            availableStock: Number(availableStock.toFixed(3))
        })
    }
}
