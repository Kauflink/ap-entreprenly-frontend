import {Lot} from "@/inventory/domain/model/lot-entity.js";


export class WeightLot extends Lot{
    constructor(data) {
        super({
            ...data,
            _lotType: Lot.LotType.WEIGHT
        });
       this._quantityKg=data._quantityKg;
    }

    get quantityKg(){
        return this._quantityKg;
    }

    set quantityKg(value){
        this._quantityKg = value;
    }
}