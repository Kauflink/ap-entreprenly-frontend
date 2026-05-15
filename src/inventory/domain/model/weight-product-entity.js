import Product from "@/inventory/domain/model/product-entity.js";

export class WeightProduct extends Product {

    constructor(data) {
        super({
            ...data,
            _productType: Product.ProductType.WEIGHT
        });

        this._pricePerKg = data._pricePerKg;
    }

    get pricePerKg() {
        return this._pricePerKg;
    }

    set pricePerKg(value) {
        this._pricePerKg = value;
    }
}