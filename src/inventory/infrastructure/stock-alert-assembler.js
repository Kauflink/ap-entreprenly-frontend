import {StockAlert} from "@/inventory/domain/model/stock-alert-entity.js";

export class StockAlertAssembler {
    static toEntityFromResource(resource) {
        return new StockAlert({
            _id:        resource.id,
            _lotId:     resource.lotId,
            _productId: resource.productId,
            _alertType: resource.alertType,
            _severity:  resource.severity,
            _message:   resource.message,
            _createdAt: resource.createdAt,
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : response.data['stock_alerts'] ?? [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}