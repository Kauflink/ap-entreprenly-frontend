import Product from "@/inventory/domain/model/product-entity.js";


export class UnitProduct extends Product{
    constructor(data) {
        super({
            ...data,
            _productType: Product.ProductType.UNIT
        });
        this._price = data._price;
        this._weightGrams = data._weightGrams;
        this._brand = data._brand;
    }

    get price(){
        return this._price;
    }

    set price(value){
        this._price=value;
    }

    get weightGrams(){
        return this._weightGrams;
    }

    set weightGrams(value){
        this._weightGrams=value;
    }

    get brand(){
        return this._brand;
    }

    set brand(value){
        this._brand = value;
    }
}