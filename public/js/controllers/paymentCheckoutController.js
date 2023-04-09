(function () {

    angular.module('mainApp').controller('paymentCheckoutController', paymentCheckoutController);

    function paymentCheckoutController($translate, $location, $window, countryService, config) {

        var vm = this;
        vm.countryList = [];
        vm.generalErrorMessage = "Something went wrong while processing payment, please try again."
        vm.donationItem = null;
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






        vm.onPageLoad = async function () {

            let message = $location.search().message;
            let icon = $location.search().icon ? $location.search().icon : 'error';
            if (message && message != '') {
                swal("", message, icon);

            }
            jQuery('.modal-backdrop').remove();
            await populateDonationItem();

            disablePaymentButton(true);
            await populateCardDetails();



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
        vm.onPaymentFormSubmission = async function () {
            vm.showState('loading');//start showing wait screen
            vm.paymentCheckoutModel.selectedCountry = vm.countryList.find(x => x.code == vm.selectedCountryCode)
            vm.paymentCheckoutModel.donationItem = vm.donationItem;
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
                    vm.paymentCheckoutModel.paymentMethod = response.paymentMethod;
                    await stripePaymentMethodHandler(response.paymentMethod);
                }
            }
            else {
                await stripePaymentMethodHandler(vm.paymentMethod);
            }
        }
        vm.onCancelCheckout = function () {
            $window.location.hash = "/cart";
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
            if (cItem.marhomeenName)
                name += "<br/>" + cItem.marhomeenName
            let billingTagLine = `BILL_ONCE`
            if (cItem.paymentPlan) {
                switch (cItem.paymentPlan.Name) {
                    case "MONTHLY":
                        billingTagLine = `BILL_MONTHLY`
                        break;
                }
            }
            billingTagLine = $translate.instant(billingTagLine);
            nameHtml = `<div class='cart-header'>${name}</div><em>${cItem.currency.symbol}${vm.donationItem.body.noOfInstallments ? vm.donationItem.body.noOfInstallments * cItem.totalAmount : cItem.totalAmount} ${billingTagLine}</em>`

            return nameHtml;
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
        //Non-VM  functions
        let counter = 0;
        async function stripePaymentMethodHandler(paymentMethod) {
            //showState('loading'); // Show loader
            vm.paymentCheckoutModel.paymentMethod = paymentMethod;
            try {
                let response = await fetch('/api/handlePayment', {
                    method: 'post',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(vm.paymentCheckoutModel),
                });
                response = await response.json();
                console.log(response);
                if (response.isSuccess) {
                    /* Proceed to next step of checking Payment Intent status */
                    let subscriptions = response.data;
                    if (subscriptions.length > 0) {
                        //PHASE1 - ONLY ONE SUBSCRIPTION WILL BE APPEARING - NEED CODE CHANGES WHEN WE HAVE MULTIPLE
                        for (var i = 0; i < subscriptions.length; i++) {
                            subscription = subscriptions[i];
                            console.log("******* 3d secure *********")
                            await manageSubscriptionStatus(subscription);
                            // if (counter >= subscriptions.length)
                            //     vm.showState('success');
                            // else if (counter === 0)
                            //     vm.showState('error', );
                            // else if (counter > 0)
                            //     vm.showState('partial_error');
                        }
                    }
                    else {
                        //error in creating subscriptions
                        vm.showState('error');
                    }
                }
                else {
                    console.error('Error creating subscription:', response.errorMessage);
                    vm.showState('error', response.errorMessage); // Show error state
                }
            }
            catch (err) {
                console.log(err);
            }
        }


        async function manageSubscriptionStatus(responseObj) {
            try {
                if (responseObj.isSuccess) {
                    const { latest_invoice } = responseObj.subscription;
                    const { payment_intent } = latest_invoice;
                    if (payment_intent) {
                        /* Do NOT share or embed your client_secret anywhere */
                        const { client_secret, status } = payment_intent;
                        if (status === "requires_action" || status === "requires_payment_method") {
                            vm.showState('requires_action')
                            const response = await vm.STRIPE_API.confirmCardPayment(client_secret);
                            if (response.error)
                                vm.showState('error', response.error.message);
                            else
                                vm.showState('success'); // Show success state
                        } else {
                            vm.showState('success'); // Show success state
                        }
                    } else {
                        /* If no payment intent exists, show the success state
                         * Usually in this case if you set up a trial with the subscription
                         */
                        vm.showState('success');
                    }
                }
                else {
                    let errMessage;
                    if (responseObj.error && responseObj.error.raw)
                        errMessage = responseObj.error.raw.message;
                    else if (responseObj.error)
                        errMessage = responseObj.error.message;
                    vm.showState("error", errMessage);
                }
            }
            catch (err) {
                vm.showState('error', err.message);
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
                    color: "#ff5252",
                    iconColor: "#ff5252",
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
        function disablePaymentButton(isDisable) {
            let button = document.getElementById('btn_pay_subscribe');
            if (button)
                button.disabled = isDisable;
        }
        //Get Country List
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

        async function populateDonationItem() {
            console.log($location.search());
            let response = await fetch('/api/getitem', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    "dataKey": "DON_ITEM",
                    "dataFilter": {
                        "_id": $location.search().di || "-1",
                        "state": "NotStarted"
                    },
                    "dataFields": {
                        "body.amount": 1,
                        "body.donarEmail": 1,
                        "body.donar.donarName": 1,
                        "body.donar.customerId": 1,
                        "body.donar._id": 1,
                        "body.selectedLang": 1,
                        "body.items": 1,
                        "body.paymentCurrency": 1,
                        "body.paymentTitle": 1,
                        "body.country": 1,
                        "body.noOfInstallments": 1,
                        "body.stripeSubscriptionStartDate": 1,
                        "body.donar.stripeCustomerIds": 1,
                    }
                }),
            })
            response = await response.json();
            vm.donationItem = response.isSuccess ? response.data : null;
        }



        async function populateCardDetails() {

            let customerId = vm.donationItem.body.donar.customerId;

            let stripeCustomerIds = vm.donationItem.body.donar.stripeCustomerIds;

            if (stripeCustomerIds && stripeCustomerIds.length > 0) {
                let validItem = stripeCustomerIds.find(item => item.currency == vm.donationItem.body.paymentTitle);
                if (validItem) { customerId = validItem.customerId; }
            }
            // let response = await fetch('/api/getitem', {
            //     method: 'post',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         "dataKey": "DON_PRG",
            //         "dataFilter": {
            //             "stripeSubscriptionId": subscriptionId || "-1",
            //             isRecurringProgram: true,
            //             isRecurringProgram: { $exists: true }
            //         },
            //         "dataFields": {
            //             "donor": 1
            //         }
            //     }),
            // })



            if (customerId) {
                let response = await fetch('/api/getCustomerDefaultPaymentMethod?cusId=' + customerId, {
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

                response = await response.json();

                let resp = response;

                // response = await response.json();
                vm.donorCardDetail = response.paymentMethod ? response.paymentMethod.card : null;

                vm.paymentMethod = response.paymentMethod ? response.paymentMethod.id : null;
                if (vm.paymentMethod) { vm.useExistingCard = true; }

                vm.cardText = vm.donorCardDetail ? ' **** ' + vm.donorCardDetail.last4: null;

            }

        }

        vm.changePaymentOption = async function () {
            vm.useExistingCard = !vm.useExistingCard
            if (!vm.useExistingCard) {
                disablePaymentButton(true);
            }
            else {
                disablePaymentButton(false);
            }
        }



    }
})()