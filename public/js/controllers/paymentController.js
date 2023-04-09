(function () {

    angular.module('mainApp').controller('paymentController', paymentController);

    function paymentController($rootScope, $window, $state,paymentService) {
        let paymentVM = this;
        paymentVM.getPayment = getPayment;
        paymentVM.donateNow = donateNow;
        paymentVM.orphan = {};
        paymentVM.donation = {};
        paymentVM.payments = {};
        paymentVM.donationId = $state.params.donationId;
        function getPayment() {
            // paymentService.getPayment($state.params.orphanId, $state.params.donorId).then(res => {
            paymentService.getPayment(paymentVM.donationId).then(res => {
                paymentVM.donation=res.data;
                paymentVM.orphan=paymentVM.donation.orphan;
                paymentVM.program=paymentVM.donation.program[0];
            }).catch(e => {
            })
        }

        function donateNow() {
            let obj = {};
            obj.program = paymentVM.program;
            obj.orphans = [paymentVM.orphan._id];
            obj.isRecurring = paymentVM.donation.donationDetails.isRecurring;
            obj.currency = JSON.parse(sessionStorage.getItem('currency'));
            obj.totalAmount = paymentVM.donation.amount;
            obj.count = 1;
            obj.notNewDonation = true;
            obj.donationId = paymentVM.donationId;
            localStorage.setItem("cart", null);
            localStorage.setItem("cart", JSON.stringify(obj));
            if ($rootScope.isLogin) {
                $window.location.href = "/#/checkout";
            } else {
                jQuery('#globalLoginModal').modal('show');
            }
        }
     }
})();