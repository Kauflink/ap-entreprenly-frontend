import {Lot} from "@/inventory/domain/model/lot-entity.js";


export class UnitLot extends Lot{
    constructor(data){
        super({
            ...data,
            _lotType:Lot.LotType.UNIT
        })
        this._quantity=data._quantity;
        this._expiryDate =data._expiryDate;
    }

    get quantity() {
        return this._quantity;
    }

    set quantity(value){
        this._quantity=value;
    }

    get expiryDate(){
        return this._expiryDate;
    }

    set expiryDate(value){
        this._expiryDate=value;
    }
}