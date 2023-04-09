(function () {

    angular.module('mainApp').factory('currencyService', currencyService);
    function currencyService($http) {
        return {

            saveCurrency: saveCurrency,
            getCurrency: getCurrency,
            getCurrencyByName: getCurrencyByName,
            updateCurrency: updateCurrency,
            currencyConversionFormula: currencyConversionFormula,
            getAllAvailableCurrency : getAllAvailableCurrency,
            changeCurrencyStatus:changeCurrencyStatus
        }

        function saveCurrency(currencyObject) {

            return $http({
                method: 'post',
                url: '/api/currency/save',
                data: currencyObject,
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

        function updateCurrency(currencyObject) {

            return $http({
                method: 'post',
                url: '/api/currency/update',
                data: currencyObject,
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

        function getCurrency(state) {
            return $http({
                method: 'get',
                url: '/api/currency/get?state='+state,
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


        function getCurrencyByName(name) {
            return $http({
                method: 'get',
                url: '/api/currency/getByName/' + name,
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
        function round(x, mul) {
            return (Math.ceil(x / mul) * mul);
        }
        function currencyConversionFormula(num) {
            if (num <= 2) {
                num = Math.round(num);
            } else if (num <= 25) {
                num = round(num, 1);
            } else if (num <= 500) {
                num = round(num, 5);
            } else if (num <= 1000) {
                num = round(num, 10)
            } else if (num <= 10000) {
                num = round(num, 50)
            } else if (num <= 50000) {
                num = round(num, -100)
            } else if (100000 > num) {
                num = round(num, 1000)
            }
            return num;
        }

       async function getAllAvailableCurrency()
       { 
        return $http({
        method: 'get',
        url: '/api/currency/getAllAvailableCurrency',
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

       function changeCurrencyStatus(cuurencyObj) {

        return $http({
            method: 'put',
            url: '/api/currency/changeStatus',
            data: cuurencyObj,
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


       


    }
})();