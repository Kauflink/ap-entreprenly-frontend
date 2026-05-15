import Product from "@/inventory/domain/model/product-entity.js";

export class ProductAssembler {
    static toEntityFromResource(resource) {
        return new Product({
            _id:          resource.id,
            _name:        resource.name,
            _description: resource.description,
            _codeQR:      resource.codeQR,
            _productType: resource.productType,
        });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status} - ${response.statusText}`);
            return [];
        }
        const resources = Array.isArray(response.data) ? response.data : response.data['products'] ?? [];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}