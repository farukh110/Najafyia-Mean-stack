
module.exports = function CartItem(item) {
    this.user = item.user||{};
    this.program = item.program||{};
    this.subCategory = item.subCategory||{};
    this.donationDuration = item.donationDuration||{};
    this.count = item.count||0;
    this.amount = item.amount ||0;
    this.totalAmount = item.totalAmount ||0;
    this.isRecurring = item.isRecurring ||false;
    this.date =Date.now();
    this.totalQuantity = oldCart.totalQuantity || 0;
    this.totalPrice = oldCart.totalPrice || 0;
};