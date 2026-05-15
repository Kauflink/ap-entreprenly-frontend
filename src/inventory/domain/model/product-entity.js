class Product {
    static ProductType = {
        UNIT: 'unit',
        WEIGHT: 'weight',
    };

    constructor(data) {
        this._id = data._id;
        this._name = data._name;
        this._description = data._description;
        this._codeQR = data._codeQR;
        this._productType = data._productType;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get description() {
        return this._description;
    }

    set description(value) {
        this._description = value;
    }

    get codeQR() {
        return this._codeQR;
    }

    set codeQR(value) {
        this._codeQR = value;
    }

    get productType() {
        return this._productType;
    }

    set productType(value) {
        this._productType = value;
    }
}

export default Product;