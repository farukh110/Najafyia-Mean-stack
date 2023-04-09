(function () {

    angular.module('mainApp').factory('cartService', cartService);

    function cartService($http, config) {
        return {
            getCartDetail: getCartDetail,
            addCartItem: addCartItem,
            updateCartItem: updateCartItem,
            removeCartItem: removeCartItem,
            cartCheckOut: cartCheckOut,
            createCustomer: createCustomer,
            sentEmailAfterCheckout: sentEmailAfterCheckout,
            sendEmailWithReciept: sendEmailWithReciept,
            checkSponsorships: checkSponsorships,
            stripeCheckout: stripeCheckout,
            performDonation: performDonation,
            stripePublishKey: config.Stripe.PublishKey
        }

        function checkSponsorships(items) {
            return $http({
                method: 'post',
                url: '/api/checkSponsorships',
                headers: { 'Content-Type': 'application/json' },
                data: { items },
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function createCustomer(obj) {
            return $http({
                method: 'post',
                url: '/api/create/customer',
                headers: { 'Content-Type': 'application/json' },
                data: obj,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function stripeCheckout(obj) {
            return $http({
                method: 'post',
                url: '/api/stripe-checkout',
                headers: { 'Content-Type': 'application/json' },
                params: { lang: localStorage.getItem('lang') },
                data: obj,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function cartCheckOut(obj) {
            return $http({
                method: 'post',
                url: ' /api/checkout',
                headers: { 'Content-Type': 'application/json' },
                data: obj,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function getCartDetail() {
            return $http({
                method: 'get',
                url: '/api/get-cart',
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }
        function performDonation(id, sessionId) {
            return $http({
                method: 'get',
                url: '/api/get-donation-status',
                params: { id, sessionId, lang: localStorage.getItem('lang') },
                headers: { 'Content-Type': 'application/json' },
                success: (function (response) {
                    return response.data;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function addCartItem(cartItem) {
            return $http({
                method: 'post',
                url: '/api/add-to-cart',
                headers: { 'Content-Type': 'application/json' },
                data: cartItem,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        function updateCartItem(cartItems) {
            return $http({
                method: 'post',
                url: '/api/update-to-cart',
                headers: { 'Content-Type': 'application/json' },
                data: cartItems,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                })
            });
        }

        function removeCartItem(cartItem) {

            let apiUrl = '';
            if (Array.isArray(cartItem)) {
                apiUrl = 'api/remove-multiple-cart-items'
            } else {
                apiUrl =  '/api/remove-cart-item'
            }

            return $http({
                method: 'post',
                url: apiUrl,
                headers: { 'Content-Type': 'application/json' },
                data: cartItem,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });

        }

        function sentEmailAfterCheckout(donor) {
            return $http({
                method: 'post',
                url: ' /api/sendEmail',
                headers: { 'Content-Type': 'application/json' },
                data: donor,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

        function sendEmailWithReciept(obj) {
            return $http({
                method: 'post',
                url: ' /api/sendEmailWithReceipt',
                headers: { 'Content-Type': 'application/json' },
                data: obj,
                success: (function (response) {
                    return response;
                }),
                error: (function (error) {
                    return error;
                }
                )
            });
        }

    }
})()