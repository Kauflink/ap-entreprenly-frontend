import { Sale } from '@/sales/domain/model/sale-entity.js'
import { SaleItem } from '@/sales/domain/model/sale-item-entity.js'
import { SaleStatus } from '@/sales/domain/model/sale-status.enum.js'

export class SaleAssembler {
    static toResourceFromEntity(sale) {
        return {
            sellerId: sale.sellerId,
            items: sale.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                isWeighted: item.isWeighted
            })),
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            status: SaleStatus.COMPLETED,
            createdAt: new Date().toISOString()
        }
    }

    static toEntityFromResource(resource) {
        return new Sale({
            id: resource.id,
            sellerId: resource.sellerId,
            items: (resource.items || []).map(item => new SaleItem({ ...item })),
            total: resource.total,
            paymentMethod: resource.paymentMethod,
            status: resource.status,
            createdAt: resource.createdAt ? new Date(resource.createdAt) : null
        })
    }
}
