import {LotAssembler} from "@/inventory/infrastructure/lot-assembler.js";
import {UnitLot} from "@/inventory/domain/model/unit-lot-entity.js";

export class UnitLotAssembler extends LotAssembler {

    static toEntityFromResource(resource) {
        return new UnitLot({
            _id:         resource.id,
            _productId:  resource.productId,
            _codeQR:     resource.codeQR,
            _entryDate:  resource.entryDate,
            _lotType:    resource.lotType,
            _quantity:   resource.quantity,
            _expiryDate: resource.expiryDate,
        });
    }
}