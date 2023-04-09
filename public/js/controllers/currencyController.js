(function () {

    angular.module('mainApp').controller('currencyController', CurrencyController);

    function CurrencyController($scope, $sce, $state, $location, multipartForm, webSettingsService, currencyService, $translate) {

        var currencyVM = this;
        currencyVM.details = {};
        currencyVM.currencyList = [];
        currencyVM.selectCurrencyRate = "";
        currencyVM.setCurrency = setCurrency;
        currencyVM.getCurrency = getCurrency;
        currencyVM.getCurrencyByName = getCurrencyByName;
        currencyVM.editCurrency = editCurrency;
        currencyVM.changeCurrencyStatus = changeCurrencyStatus;

        currencyVM.formTitle = 'ADD CURRENCY RATE DETAILS';
        currencyVM.submitButtonText = 'ADD';
        currencyVM.allCurrencyList  = [];
        currencyVM.selectedCurrency;
        currencyVM.getSelectedCurrencyData = getSelectedCurrencyData;
        currencyVM.details.translatedTitle = {
            Name:"",
            value:{}
        };
       
        async function loadAllCurrencies(){

           let allCurrency = await currencyService.getAllAvailableCurrency()
           if(allCurrency){
            currencyVM.allCurrencyList = allCurrency.data;
           }

        }


        async function updateCurrencyState(obj)
        {
            let response = await currencyService.changeCurrencyStatus(obj);
            if(response && response.status == 200)
            {
                getCurrency();
                swal(
                    $translate.instant('Success!'),
                    response.data,
                    'success'
                );
                
            }else {
                swal(
                    'Failed!',
                    'Failed to change status',
                    'error'
                )
            }
        }


       function changeCurrencyStatus (name,state){

            let Obj = {
                name:name,
                status:state
            };
            updateCurrencyState(Obj);
          
        }

function getSelectedCurrencyData(){

 if(currencyVM.selectedCurrency){


    let alreadyExist = currencyVM.currencyList.filter(c => c.name  == currencyVM.selectedCurrency.code);
    if(alreadyExist && alreadyExist.length > 0)
    {
        currencyVM.formTitle = 'ADD CURRENCY RATE DETAILS';
        currencyVM.submitButtonText = 'ADD';
                 currencyVM.details.name = 0;
                 currencyVM.details.symbol = '';
                 currencyVM.details.displayOrder = '';
        //alert user that selected currency already exist 
        swal(
            $translate.instant('Oops!'),
            'Selected Currency Already Exists',
            'info')
        
    }
    else{
  // get selected currency data for rest fields 
                currencyVM.formTitle = 'ADD CURRENCY RATE DETAILS';
                 currencyVM.submitButtonText = 'ADD';
                 currencyVM.details.name = currencyVM.selectedCurrency.code;
                 currencyVM.details.symbol = currencyVM.selectedCurrency.symbol;
                 currencyVM.details.displayOrder =  currencyVM.currencyList.length + 1;
                 currencyVM.details.translatedTitle.Name = currencyVM.details.name;
                 currencyVM.details.translatedTitle.value = {};
                 currencyVM.details.rate = "";
    }
}

 
  
  

};


        function setCurrency() {

            let alreadyExist = currencyVM.currencyList.filter(c => c.name  == currencyVM.selectedCurrency.code);
           // currencyVM.details.translatedTitle.Name = currencyVM.details.name;
            if (currencyVM.details.id == undefined) {
                currencyService.getCurrency().then(function (response) {
                    if (alreadyExist.length <= 0) {
                        currencyService.saveCurrency(currencyVM.details)
                            .then(function (response) {
                                if (response.data == "Currency Rate Saved Successfully") {
                                    swal(
                                        $translate.instant('Success!'),
                                        response.data,
                                        'success'
                                    ).then(function () {
                                        currencyVM.getCurrency();
                                        currencyVM.details.name = "";
                                        currencyVM.details.rate = "";
                                        currencyVM.details.symbol = "";
                                        currencyVM.details.displayOrder = "";
                                        currencyVM.selectedCurrency = null;
                                        currencyVM.details.translatedTitle = {};
                                    });

                                } else {
                                    swal(
                                        'Error!',
                                        'Duplication Error',
                                        'error'
                                    ).then(function () {
                                        currencyVM.getCurrency();
                                        currencyVM.details.name = "";
                                        currencyVM.details.rate = "";
                                        currencyVM.details.symbol = "";
                                        currencyVM.details.displayOrder = "";
                                        currencyVM.selectedCurrency = null;
                                        currencyVM.details.translatedTitle = {}
                                    });
                                }
                            });

                    } else {
                        swal(
                            'Error!',
                            'Maximum No. Of currency already added',
                            'error'
                        )

                    }
                })

            } else {
                currencyService.getCurrency().then(function (response) {
                    // if (response.data.length <= 3) {
                        currencyService.updateCurrency(currencyVM.details)
                            .then(function (response) {
                                if (response.data == "currency updated Sucessfully") {
                                    swal(
                                        $translate.instant('Success!'),
                                        response.data,
                                        'success'
                                    ).then(function () {
                                        currencyVM.getCurrency();
                                        currencyVM.details.name = "";
                                        currencyVM.details.rate = "";
                                        currencyVM.details.symbol = "";
                                        currencyVM.details.displayOrder = "";
                                        currencyVM.selectedCurrency = null;
                                        currencyVM.details.translatedTitle = {}
                                    });
                                } else {
                                    swal(
                                        'Error!',
                                        'Duplication Error',
                                        'error'
                                    ).then(function () {
                                        currencyVM.getCurrency();
                                        currencyVM.details.name = "";
                                        currencyVM.details.rate = "";
                                        currencyVM.details.symbol = "";
                                        currencyVM.details.displayOrder = "";
                                        currencyVM.selectedCurrency = null;
                                        currencyVM.details.translatedTitle = {}
                                    });
                                }
                            });
                    // } else {
                    //     swal(
                    //         'Error!',
                    //         'Maximum No. Of currency already added',
                    //         'error'
                    //     )
                    // }
                })
            }
        }

       async function getCurrency() {
            currencyService.getCurrency().then(function (response) {
                currencyVM.currencyList = response.data || [];
            });
            loadAllCurrencies();
        }

        function editCurrency(currency) {

            currencyVM.submitButtonText = 'UPDATE';

            currencyVM.formTitle = 'UPDATE_CURRENCY_RATE_DETAIL';

            currencyVM.details.name = currency.name;
            currencyVM.details.rate = Number(currency.rate);
            currencyVM.details.symbol = currency.symbol;
            currencyVM.details.id = currency._id;
            item = currencyVM.allCurrencyList.filter(c => c.code  == currency.name);
            currencyVM.selectedCurrency = item[0];
            currencyVM.details.displayOrder = currency.displayOrder  ? currency.displayOrder : ''
            currencyVM.details.translatedTitle =  currency.translatedTitle ? currency.translatedTitle : {
                Name:currency.name,
                value:{}
            };
        }


        function getCurrencyByName(name) {
            currencyService.getCurrencyByName(name).then(function (response) {
                currencyVM.selectCurrencyRate = response.data || [];
            });
        }
    }
})();