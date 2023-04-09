(function () {

    angular.module('mainApp').controller('intermediatepageController', intermediatepageController);

    function intermediatepageController($scope, $rootScope, $state, $location, $stateParams, $translate, config,$window) {

        var PageVM = this;
        PageVM.onPageLoad = async function () {

            let dpd = $location.search().dpd;

            let donItem = $location.search().donItem ;
            let donId = $location.search().donId;
            let sadaqah = $location.search().sadaqah;

            let sucessUrl = '';
            let perfromWork = false;

            if (dpd && dpd != '' && sadaqah != 'true' ) {
                perfromWork = true;
                sucessUrl = "/renewOrphanSponsorshipSubscription?dpd="+dpd+"&confirmed=true";
            }

            if( donItem && donItem != '' && donId && donId != '' && sadaqah != 'true' ){
                perfromWork = true;
                sucessUrl = "/renewOrphanSponsorshipSubscription?donItem="+donItem+"&donId="+donId+"&confirmed=true";
            }

            if(sadaqah &&  sadaqah == 'true' && donItem && donItem != '' && donId && donId != '' )
            {
                perfromWork = true;
                sucessUrl = "/api/renewal/sadaqah?donItem="+donItem+"&donId="+donId+"&confirmed=true";
            }

            if (perfromWork) {
               
                swal({
                    title: "",
                    text: "Are you sure you want proceed?",
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "Yes",
                    cancelButtonText: "No"
                }).then((result) => { // <--
                    if (result.value) { // <-- if confirmed

                        $window.location.href = sucessUrl;
                    }
                    else{
                        // swal(
                        //     $translate.instant('Success!'),
                        //     'Thank you for using Najafyia.org , you can renew the sponsorship later on till eligbility criteria exists',
                        //     'info',
                        // );
                        $window.location.href =  "/#/home";
                    }

                });
            }





        }


    }
})()
