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
                // A line is sold either by unit (quantity) or by weight (weightKg); the other is null.
                quantity: item.isWeighted ? null : item.quantity,
                weightKg: item.isWeighted ? item.quantity : null,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal
            })),
            total: sale.total,
            paymentMethod: sale.paymentMethod,
            status: sale.status ?? SaleStatus.COMPLETED,
            createdAt: (sale.createdAt instanceof Date ? sale.createdAt : new Date()).toISOString()
        }
    }

    static toEntityFromResource(resource) {
        return new Sale({
            id: resource.id,
            sellerId: resource.sellerId,
            items: (resource.items || []).map(item => new SaleItem({
                productId: item.productId,
                productName: item.productName,
                unitPrice: item.unitPrice,
                quantity: item.weightKg != null ? item.weightKg : item.quantity,
                isWeighted: item.weightKg != null
            })),
            total: resource.total,
            paymentMethod: resource.paymentMethod,
            status: resource.status,
            createdAt: resource.createdAt ? new Date(resource.createdAt) : null,
            completedAt: resource.completedAt ? new Date(resource.completedAt) : null
        })
    }
}
