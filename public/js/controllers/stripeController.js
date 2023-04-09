(function () {

    angular.module('mainApp').controller('stripeController', stripeController);

    function stripeController($scope, cartService, $location,$rootScope) {

        var vm = this;
        vm.performDonation = performDonation;

        function showMessage(message) {
            let mesg = message.replace(/%20/g, " ");
            let email = mesg.split(" ");
            let symbol = '';
            symbol  = email[3];
            email = email[email.length - 1];
           
            let currency = mesg.match(/\d+/g)[0];
            if (mesg.match(/USD/)) {
                symbol = 'USD';
            } else if (mesg.match(/GBP/)) {
                symbol = 'GBP';
            } else if(mesg.match(/EUR/)){ symbol = 'EUR'}

            if (localStorage.getItem('lang') == 'ARB') {
                mesg = `تم التبرع بمبلع ${currency} ${symbol}  بنجاح، وتم إرسال الإيصال الى البريد الألكتروني ${email}`;
            } else if (localStorage.getItem('lang') == 'FRN') {
                mesg = `Votre don de ${currency} ${symbol}  a été traité avec succès. Un reçu vous a été envoyé par mail à  ${email}`;
            } else {
                mesg = `Your donation of ${symbol} ${currency} has been successfully processed. An email receipt has been sent to ${email}`
            }
            return mesg;
        }

        function performDonation() {
            cartService.performDonation($location.search().donationId, $location.search().session_id)
                .then(res => {
                    console.log(res);
                    this.responseData = res;
                    this.responseData.data.message = showMessage(this.responseData.data.message);
                    window.dataLayer = window.dataLayer || [];
                    setGTMData($location.search().donationId,this.responseData.data.transaction);

                }).catch(e => {
                    console.log(e);
                    this.responseData = e;
                });
        }

        
    function setGTMData(donationItemId,transaction)
    {
        try
        {
            let flag= true;
            if(localStorage.getItem('lastTrackingDonationItemId') && localStorage.getItem('lastTrackingDonationItemId') == donationItemId)
            {
                flag=false              
            }
     
            if(flag){
                dataLayer.push(transaction);
                localStorage.setItem('lastTrackingDonationItemId', donationItemId);
            }
        }
        catch(err)
        {
            console.log(err);
        }
    }
    }
})()