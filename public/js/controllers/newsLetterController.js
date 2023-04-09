(function () {

    angular.module('mainApp').controller('newsLetterController', NewsLetterController);

    function NewsLetterController($scope, $rootScope, $state, $location, newsLetterService, countryService, $translate) {

        var VM = this;
        VM.formData = {};
        VM.formDataReadOnly = false;
        VM.countryList = [];
        VM.addSubscription = addSubscription;
        VM.removeSubscription = removeSubscription;
        VM.getNewsLetter = getNewsLetter;
        VM.fillLoggedInUserDetails = fillLoggedInUserDetails;
        VM.resetDetails = resetDetails;
        VM.showHideNewsletter = showHideNewsletter;
        VM.loadJQAgain = loadJQAgain;
        countryService.getCountryList().then(function (response) {
            VM.countryList = response.data || [];
            VM.countryList = VM.countryList.map(c => {
                if (localStorage.getItem('lang') === 'FRN') {
                    c.name = c.nameFRN;
                } else if (localStorage.getItem('lang') === 'ARB') {
                    c.name = c.nameARB;    
                }
                return c;
            })
        });
        jQuery("#newsLetterContent .froala-view").html();

        function loadJQAgain() {
            jQuery(document).ready(
                function () {
                    jQuery('.nav-drop').dropit();
                    let elem = document.getElementById('menu');
                    if (elem.classList.contains("mm-menu_opened")) {
                        elem.classList.remove('elem.classList')
                    }
                });
        }

        function getNewsLetter() {
            newsLetterService.getNewsletterList().then(function (res) {
                VM.newsletterList = res.data;
                return res;

            });
        }

        function addSubscription(isValid) {
            if (isValid) {
                newsLetterService.addSubscription(VM.formData).then(function (response) {
                    if (response.status == 200) {
                        VM.formData = {};
                        jQuery('.newsletterPopupBox').toggleClass('hide');
                        let toastMsg;
                        if(response.message == 'You have already subscribed!'){
                            if (localStorage.getItem('lang') == 'ARB') {
                                toastMsg = "!لقد قمت بالإشتراك قبل ذلك";
                            } else if (localStorage.getItem('lang') == 'FRN') {
                                toastMsg = "Vous êtes déjà inscrit !";
                            } else {
                                toastMsg = response.message;
                            }
                        }
                        if (localStorage.getItem('lang') == 'FRN') {
                            
                            swal(
                                'Succès !',
                                'Abonnement réussi !',
                                'success'
                            );
                            }
                           else if (localStorage.getItem('lang') == 'ARB') {
                            
                                swal(
                                    '!تم',
                                    '!تم الإشتراك ',
                                    'success'
                                );
                                }else{
                                
                            swal(
                                $translate.instant('Success!'),
                                'Subscription Successful!',
                                'success'
                            );
                            }
                    } else {
                        let toastMsg;
                        if(response.message == 'You have already subscribed!'){
                            if (localStorage.getItem('lang') == 'ARB') {
                                toastMsg = "!لقد قمت بالإشتراك قبل ذلك";
                            } else if (localStorage.getItem('lang') == 'FRN') {
                                toastMsg = "Vous êtes déjà inscrit!";
                            } else {
                                toastMsg = response.message;
                            }
                        }
                        if (localStorage.getItem('lang') == 'FRN') {
                            swal(
                                'Echec !',
                                toastMsg || 'Failed to subscribe',
                                'error'
                            )
                        }
                        else if (localStorage.getItem('lang') == 'ARB') {
                            swal(
                                '!لم يتم',
                                toastMsg || 'فشل في الاشتراك',
                                'error'
                            )
                        }
                        else{
                            swal(
                                'Failed !',
                                toastMsg || 'Failed to subscribe',
                                'error'
                            )
                        }
                       
                    }
                });
            }
        }

        function removeSubscription(isValid) {
            if (isValid) {
                newsLetterService.addSubscription(VM.formData).then(function (response) {
                    if (response.status == 200) {
                        VM.formData = {};
                        jQuery('.newsletterPopupBox').toggleClass('hide');
                        if (localStorage.getItem('lang') == 'FRN') {
                            
                        swal(
                            'Succès !',
                            'Abonnement réussi !',
                            'success'
                        );
                        }
                        else if (localStorage.getItem('lang') == 'ARB') {
                            
                            swal(
                                'نجاح !',
                                'نجح الإشتراك!',
                                'success'
                            );
                            }else{
                            
                        swal(
                            $translate.instant('Success!'),
                            'Subscription Successful!',
                            'success'
                        );
                        }
                    } else {
                        if (localStorage.getItem('lang') == 'FRN') {
                            swal(
                                'Echec !',
                                toastMsg || 'Failed to subscribe',
                                'error'
                            )
                        } else if (localStorage.getItem('lang') == 'ARB') {
                            '!لم يتم',
                            toastMsg || 'فشل في الاشتراك',
                            'error'
                        }
                        else{
                            swal(
                                'Failed !',
                                toastMsg || 'Failed to subscribe',
                                'error'
                            )
                        }
                       
                    }
                });
            }
        }

        function fillLoggedInUserDetails() {
            VM.showNewsModal = !VM.showNewsModal;
            if ($rootScope.loggedInUserDetails) {
                // VM.formData.email = $rootScope.loggedInUserDetails.email;
            }
        }

        function resetDetails() {
            VM.formData = {};
            VM.formDataReadOnly = false;
        }

        jQuery('.newsletterPopupBtn').on('click', function (e) {
            // jQuery('.newsletterPopupBox').toggleClass('hide');
            jQuery('#headerLoginPopup').removeClass('open');
            e.stopPropagation();
        });

        jQuery(".newsletterPopupBox").click(function(e){
            e.stopPropagation();
        });


        jQuery(document).click(function(){
            // jQuery(".newsletterPopupBox").addClass('hide');
        });

        function showHideNewsletter() {
            // jQuery('.newsletterPopupBox').addClass('hide');
        }
    }
})()