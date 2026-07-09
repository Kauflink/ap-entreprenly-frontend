import { ProductSummary } from '@/sales/domain/model/product-summary-entity.js'

export class ProductAssembler {
    /**
     * Maps a sellable catalog product (name, price, type and stock already computed by the
     * backend) to a ProductSummary. The catalog exposes no product id, so a positional id is
     * assigned to identify the item within the sale view.
     */
    static toEntityFromSalesProduct(resource, index) {
        return new ProductSummary({
            id: index + 1,
            name: resource.name,
            unitPrice: resource.price,
            isWeighted: resource.byWeight,
            availableStock: resource.stock
        })
    }
}
