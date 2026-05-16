import { ProductAssembler } from "./product-assembler.js";
import {UnitProduct} from "@/inventory/domain/model/unit-product-entity.js";

export class UnitProductAssembler extends ProductAssembler {

    static toEntityFromResource(resource) {
        return new UnitProduct({
            _id:           resource.id,
            _name:         resource.name,
            _description:  resource.description,
            _codeQR:       resource.codeQR,
            _productType:  resource.productType,
            _price:        resource.price,
            _weightGrams:  resource.weightGrams,
            _brand:        resource.brand,
        });
    }
}