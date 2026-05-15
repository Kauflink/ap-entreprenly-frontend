import {Lot} from "@/inventory/domain/model/lot-entity.js";


export class LotAssembler {
    static toEntityFromResource(resource) {
        return new Lot({
            _id:        resource.id,
            _productId: resource.productId,
            _codeQR:    resource.codeQR,
            _entryDate: resource.entryDate,
            _lotType:   resource.lotType,
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : response.data['lots'] ?? [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}