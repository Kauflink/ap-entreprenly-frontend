import {WeightProduct} from "@/inventory/domain/model/weight-product-entity.js";
import {ProductAssembler} from "@/inventory/infrastructure/product-assembler.js";


export class WeightProductAssembler extends ProductAssembler {

    static toEntityFromResource(resource) {
        return new WeightProduct({
            _id:           resource.id,
            _name:         resource.name,
            _description:  resource.description,
            _codeQR:       resource.codeQR,
            _productType:  resource.productType,
            _pricePerKg:   resource.pricePerKg,
        });
    }
}