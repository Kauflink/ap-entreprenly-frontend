import {WeightLot} from "@/inventory/domain/model/weight-lot-entity.js";
import {LotAssembler} from "@/inventory/infrastructure/lot-assembler.js";

export class WeightLotAssembler extends LotAssembler {

    static toEntityFromResource(resource) {
        return new WeightLot({
            _id:          resource.id,
            _productId:   resource.productId,
            _codeQR:      resource.codeQR,
            _entryDate:   resource.entryDate,
            _lotType:     resource.lotType,
            _quantityKg:  resource.quantityKg,
        });
    }
}