
export class Lot {
    static LotType = {
        UNIT: 'unit',
        WEIGHT: 'weight',
    };
   constructor(data){
       this._id = data._id;
       this._productId= data._productId;
       this._codeQR= data._codeQR;
       this._entryDate=data._entryDate;
       this._lotType = data._lotType;
   }

   get id(){
       return this._id;
   }

   set id(value){
       this._id=value;
   }

   get productId () {
       return this._productId
   }

   set productId(value){
       this._productId=value;
   }

   get codeQR(){
       return this._codeQR;
   }

   set codeQR(value){
       this._codeQR=value;
   }

   get entryDate(){
       return this._entryDate;
   }

   set entryDate(value){
       this._entryDate=value;
   }

   get lotType(){
       return this._lotType;
   }

   set lotType(value){
       this._lotType=value;
   }
}