var _ = require('lodash');
module.exports = function Cart(oldCart) {
    this.items = oldCart.items || [];
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
    this.count = oldCart.count || 0;
    this.add = function (item) {
        var storedItem = _.find(this.items, function (obj) {
            if (obj.program.programName == item.program.programName) {

                if (obj.programSubCategory != undefined) {
                    if (obj.programSubCategory.programSubCategoryName != undefined) {
                        if (obj.paymentType != undefined) {
                            if (obj.paymentType == item.paymentType) {
                                if (item.programSubCategory != undefined) {
                                    return obj.programSubCategory.programSubCategoryName == item.programSubCategory.programSubCategoryName
                                }
                                else {
                                    return undefined;
                                }

                            }
                        }
                        //return obj.programSubCategory.programSubCategoryName == item.programSubCategory.programSubCategoryName
                    } else if (obj.otherPersonalityName != undefined) {
                        return obj.otherPersonalityName == item.otherPersonalityName;
                    }
                }
                else if (obj.otherPersonalityName != undefined) {
                    return obj.otherPersonalityName == item.otherPersonalityName;
                }
                else if(obj.paymentType != undefined) {
                    if (obj.paymentType == item.paymentType) {
                        return obj.program = item.program;
                    }
                }
            }
        });
        // if (!storedItem) {
            storedItem = item;
            this.items.push(item);
        // }
        // else {
        //     storedItem.totalAmount = parseInt(storedItem.totalAmount) + parseInt(item.totalAmount);
        //     storedItem.count = parseInt(storedItem.count) + parseInt(item.count);
        // }
        this.totalQuantity++;
        this.totalPrice = parseInt(this.totalPrice) + parseInt(item.totalAmount);



        // var storedItem = undefined;
        // this.items.forEach(function (obj) {
        //     if (obj.program.programName == item.program.programName) {
        //         if (obj.programSubCategory != undefined && item.programSubCategory != undefined) {
        //             if(obj.programSubCategory.programSubCategoryName == item.programSubCategory.programSubCategoryName){
        //                 return obj;
        //             }
        //         }
        //         else if (obj.otherPersonalityName != undefined && item.otherPersonalityName != undefined) {
        //             if(obj.otherPersonalityName == item.otherPersonalityName){
        //                 return obj;
        //             }
        //         }
        //         else if (obj.paymentType != undefined && item.paymentType != undefined) {
        //             if(obj.paymentType == item.paymentType){
        //                 return obj;
        //             }
        //         }
        //     }
        // });


    }
    this.remove = function (item) {
        // var storedItem = _.find(this.items, function (obj) {
        //
        //     return obj.program = item.program;
        //     //return obj.programSubCategory.programSubCategoryName == item.programSubCategory.programSubCategoryName;
        // });

        // if (!storedItem) {
        // }
        // else {
        //this.items.pull(storedItem);
        // _.remove(this.items, storedItem);

        this.totalQuantity--;
        this.totalPrice -= parseInt(item.totalAmount);
        // }
    }
    this.generateArray = function () {
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
            return arr;
        }
    }
};