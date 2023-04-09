
(function () {

    angular.module('mainApp').controller('renewPaymentController', renewPaymentController);

    function renewPaymentController($translate, $location, $window, countryService, config) {


        var vm = this;
        vm.countryList = [];
        vm.generalErrorMessage = "Something went wrong while processing payment, please try again."
        vm.donationItem = null;
        vm.donorProgramDetail = null;
        vm.paymentCheckoutModel = { selectedCountry: null, paymentMethod: null, customerInfo: null };
        vm.selectedCountryCode = null;
        vm.STRIPE_API = null;
        vm.CARD_ELEMENT = null;
        vm.isLoading = false;
        vm.donorCardDetail = null;
        vm.paymentMethod = null;
        vm.cardText = null;
        vm.useExistingCard = false;
        vm.selectedLang = '';



        vm.cItem = null;

        vm.onPageLoad = async function () {
            jQuery('.modal-backdrop').remove();
            disablePaymentButton(true);
            await populateDonorProgramDetail();
            await populateDonationItem(vm.donorProgramDetail.stripeSubscriptionId);

            await populateCardDetails(vm.donorProgramDetail.stripeSubscriptionId);


            console.log(vm.donorProgramDetail.amount);

            vm.cItem = vm.donorProgramDetail.donorProgram;
            if (vm.donationItem) {
                let selectedLanguage = localStorage.getItem('lang');
                if (!selectedLanguage)
                    selectedLanguage = vm.donationItem.body.selectedLang;
                vm.paymentCheckoutModel.customerInfo = {
                    email: vm.donationItem.body.donarEmail,
                    name: vm.donationItem.body.donar.donarName,
                    lang: vm.donationItem.body.selectedLang,
                    locale: selectedLanguage ? selectedLanguage.toLowerCase().substr(0, 2) : "en",
                    currency: vm.donationItem.body.paymentCurrency,
                    country: vm.donationItem.body.country && vm.donationItem.body.country.name ? vm.donationItem.body.country.name : vm.donationItem.body.country//for quick checkout case
                }
                vm.selectedLang = selectedLanguage;
                await populateCountries();
                initializeStripeElements();

                if (vm.useExistingCard) {
                    disablePaymentButton(false);
                }
                else {
                    disablePaymentButton(true);
                }
            }
        }

        function initializeStripeElements() {
            const currentLocale = vm.paymentCheckoutModel.customerInfo.locale;
            vm.STRIPE_API = Stripe(config.Stripe.PublishKey, {
                locale: currentLocale
            });
            /* INITIALIZE STRIPE ELEMENTS */

            /* To use certain web fonts, load in source */
            var elements = vm.STRIPE_API.elements({
                fonts: [
                    {
                        cssSrc: 'https://fonts.googleapis.com/css?family=Roboto:400,600,700&display=swap',
                    }
                ],
            });

            /* Set up styles for your Stripe Elements instance --
             * To make it match your site's design
             */
            var elementsStyles = {
                base: {
                    color: "#222222",
                    iconColor: "#e09024",
                    fontFamily: "'Roboto', Helvetica, sans-serif",
                    // fontWeight: "600",
                    fontSmoothing: "antialiased",
                    fontSize: "13px",
                    "::placeholder": {
                        color: "#222222",
                        textTransform: "capitalize",
                    },
                },
                invalid: {
                    color: "#222222",
                    iconColor: "#222222",
                },
            };


            /* MORE STRIPE ELEMENTS ACTIONS */

            /* Create "card" instance of Stripe Elements and mount it to "#card-element" div */
            vm.CARD_ELEMENT = elements.create("card", { hidePostalCode: true, style: elementsStyles });
            vm.CARD_ELEMENT.mount("#card-element");

            // /* Set up event listeners on card */
            vm.CARD_ELEMENT.on('change', function (event) {
                displayError(event.error);
                console.log(event);
                disablePaymentButton(!event.complete);
            });


        }
        function displayError(error) {
            if (vm.isLoading)
                vm.isLoading = false;
            var cardError = document.getElementById('card-errors');
            cardError.textContent = error ? error.message : '';
        }

        vm.showState = function (state, message) {
            switch (state) {
                case "error":
                    if (!message)
                        message = vm.generalErrorMessage;
                    swal("Oops!!", message, state);
                    vm.isLoading = false;
                    disablePaymentButton(false);
                    break;
                case "success":
                    $window.location.href = $location.search().su || "/#/home";//success url
                    break;
                case "loading":
                    vm.isLoading = true;
                    break;
                case "requires_action":
                    //vm.isLoading = false;
                    //disablePaymentButton(true);
                    break;
                case "partial_error":
                    break;

            }
        }

        vm.getProgramName = function (cItem) {
            let name = "-";
            let nameHtml = "";
            if (!cItem)
                return name;
            name = cItem.program.programName === 'Higher Education Loans' ? 'Higher Education' : cItem.program.programName;

            if (cItem.otherPersonalityName || (cItem.programSubCategory && cItem.programSubCategory.programSubCategoryName) || cItem.otherFieldForNiyaz)
                name += "<br/>" + (cItem.otherFieldForNiyaz || cItem.otherPersonalityName
                    || (cItem.programSubCategory ? cItem.programSubCategory.programSubCategoryName : ""))


            let billingTagLine = `BILL_INSTALLMENT`
            billingTagLine = $translate.instant(billingTagLine);
            nameHtml = `<div class='cart-header'>${name}</div><em>${vm.paymentCheckoutModel.customerInfo.currency}${vm.donorProgramDetail.amount} ${billingTagLine}  ${String(vm.donorProgramDetail.installmentNo).padStart(2, '0')} </em>`

            return nameHtml;
        }

        async function populateCountries() {
            let response = await countryService.getCountryList();
            vm.countryList = response.data;
            vm.countryList = vm.countryList.map(c => {
                if (localStorage.getItem('lang') === 'FRN') {
                    c.name = c.nameFRN;
                } else if (localStorage.getItem('lang') === 'ARB') {
                    c.name = c.nameARB;
                }
                if (c.name == vm.paymentCheckoutModel.customerInfo.country
                    || c.nameFRN == vm.paymentCheckoutModel.customerInfo.country
                    || c.nameARB == vm.paymentCheckoutModel.customerInfo.country) {
                    vm.selectedCountryCode = c.code;
                }
                return c;
            })
        }

        function disablePaymentButton(isDisable) {
            let button = document.getElementById('btn_pay_subscribe');
            if (button)
                button.disabled = isDisable;
        }



        async function populateDonorProgramDetail() {

            let response = await fetch('/api/getitem', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "dataKey": "DON_PRG_DET",
                    "dataFilter": {
                        "_id": $location.search().dpd_id || "-1",
                        "paymentStatus": "Unpaid"
                    },
                    "dataFields": {
                        "installmentNo": 1,
                        "stripeInvoiceId": 1,
                        "stripeSubscriptionId": 1,
                        "donorProgram": 1,
                        "amount": 1,
                        "paymentIntentId": 1,
                    }
                }),
            })
            response = await response.json();
            if (response.isSuccess) {
                vm.donorProgramDetail = response.data;
                vm.paymentCheckoutModel.invoiceId = response.data.stripeInvoiceId;
                vm.paymentCheckoutModel.paymentIntent = response.data.paymentIntentId;
                vm.paymentCheckoutModel.subscriptionId = response.data.stripeSubscriptionId;
            }

        }


        async function populateDonationItem(subscriptionId) {

            let response = await fetch('/api/getitem', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "dataKey": "DON_ITEM",
                    "dataFilter": {
                        "body.items.stripeDetail.subscription.id": subscriptionId || "-1"
                    },
                    "dataFields": {
                        "body.amount": 1,
                        "body.donarEmail": 1,
                        "body.donar.donarName": 1,
                        "body.donar.customerId": 1,
                        "body.donar._id": 1,
                        "body.selectedLang": 1,
                        "body.paymentCurrency": 1,
                        "body.items": 1,
                        "body.country": 1,
                        "body.donar.stripeCustomerIds": 1,
                        "body.paymentTitle": 1
                    }
                }),
            })
            response = await response.json();
            vm.donationItem = response.isSuccess ? response.data : null;
        }

        async function populateCardDetails(subscriptionId) {
            let response = await fetch('/api/getitem', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "dataKey": "DON_PRG",
                    "dataFilter": {
                        "stripeSubscriptionId": subscriptionId || "-1",
                        isRecurringProgram: true,
                        isRecurringProgram: { $exists: true }
                    },
                    "dataFields": {
                        "donor": 1
                    }
                }),
            })

            response = await response.json();
            vm.donorCardDetail = response.isSuccess ? response.data.donor.cardDetail : null;

            if (vm.donorCardDetail) {
                let payMethod = await fetch('/api/getPaymentMethod?subId=' + subscriptionId, {
                    method: 'get',
                    headers: { 'Content-Type': 'application/json' },
                    // body: JSON.stringify({
                    //     "dataKey": "DON_PRG",
                    //     "dataFilter": {
                    //         "stripeSubscriptionId": subscriptionId || "-1",
                    //         isRecurringProgram: true, 
                    //         isRecurringProgram: { $exists: true }
                    //     },
                    //     "dataFields": {
                    //         "donor": 1
                    //     }
                    // }),
                })

                payMethod = await payMethod.json();
                vm.paymentMethod =  payMethod ? payMethod.default_payment_method : null; 
                if(vm.paymentMethod){vm.useExistingCard =true;}

                vm.cardText = ' **** '+ vm.donorCardDetail.last4; 

            }

        }
        vm.changePaymentOption = async function (){
            vm.useExistingCard = !vm.useExistingCard
            if(!vm.useExistingCard){
                disablePaymentButton(true);
            }
            else{
                disablePaymentButton(false);
            }
        }

        vm.onPaymentFormSubmission = async function () {
            vm.showState('loading');//start showing wait screen
            vm.paymentCheckoutModel.selectedCountry = vm.countryList.find(x => x.code == vm.selectedCountryCode)
            vm.paymentCheckoutModel.donationItem = vm.donationItem;
            console.log(vm.paymentCheckoutModel);

            if (!vm.useExistingCard) {
                /* Create your 'card' payment method */
                const response = await vm.STRIPE_API.createPaymentMethod({
                    type: 'card',
                    card: vm.CARD_ELEMENT,
                    /* Reference: https://stripe.com/docs/api/payment_methods/create#create_payment_method-billing_details */
                    billing_details: {
                        name: vm.paymentCheckoutModel.customerInfo.name,
                        email: vm.paymentCheckoutModel.customerInfo.email,
                        address: { country: vm.selectedCountryCode }
                    },
                });
                if (response.error) {
                    displayError(response.error);
                    console.error('Error creating Stripe Payment Method: ', response.error);
                } else {
                    /* Proceed to next step of creating customer and subscriptions */
                    console.log("res", response)
                    vm.paymentCheckoutModel.paymentMethod = response.paymentMethod;
                    await stripePaymentMethodHandler(response.paymentMethod);
                }


            }
            else {
                await stripePaymentMethodHandler(vm.paymentMethod);
            }

        }

        async function stripePaymentMethodHandler(paymentMethod) {
            //showState('loading'); // Show loader
            try {


                vm.paymentCheckoutModel.paymentMethod = paymentMethod;

                let response = await fetch('/api/handleFailedPaymentRecharge', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vm.paymentCheckoutModel),
                });
                response = await response.json();
                console.log(response);
                if (response.isSuccess) {
                    /* Proceed to next step of checking Payment Intent status */
                    vm.showState('success');

                }
                else {
                    console.log("******* 3d secure *********")
                    // //console.error('Error Charging invoice:'+  response.errorMessage);
                    // vm.showState('error', response.errorMessage); // Show error state
                    await manageSubscriptionStatus(response);
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        async function manageSubscriptionStatus(responseObj) {
            try {
                if (!responseObj.isSuccess && responseObj.data.status ) {
                    const status = responseObj.data.status;
                    const client_secret = responseObj.data.clientSecret;

                    if (status) {
                        if (status === "requires_action" || status === "requires_payment_method" || status === "invoice_payment_intent_requires_action") {
                            vm.showState('requires_action');
                            const response = await vm.STRIPE_API.confirmCardPayment(client_secret);
                            if (response.error)
                                vm.showState('error', response.error.message);
                            else
                                vm.showState('success'); // Show success state
                        }
                        else {
                            //vm.showState('success'); // Show success state
                            vm.showState('error', responseObj.errorMessage);
                        }
                    } else {
                        /* If no payment intent exists, show the success state
                         * Usually in this case if you set up a trial with the subscription
                         */
                        vm.showState('success');
                    }
                }
                else
                {
                    vm.showState('error', response.error.message);
                }
                // else {
                //     let errMessage;
                //     if (responseObj.error && responseObj.error.raw)
                //         errMessage = responseObj.error.raw.message;
                //     else if (responseObj.error)
                //         errMessage = responseObj.error.message;
                //     vm.showState("error", errMessage);
                // }
            }
            catch (err) {
                vm.showState('error', err.message);
            }
        }






































    }
})()