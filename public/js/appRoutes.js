angular.module('appRoutes', []).config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/home');

    $stateProvider.state('home', {
        url: '/home',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/home.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('home2', {
        url: '/home/:lang',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/home.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('payment', {
        url: '/payment/:donationId',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/payment.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('cart', {
        url: '/cart',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/cart.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('login', {
        url: '/login',
        views: {
            'mainContent': {
                templateUrl: 'views/login.html'
            },
            controller: 'loginController'
        }

    }).state('successCheckout', {
        url: '/success-checkout/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/success.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },
            controller: 'stripeController'
        }
    }).state('cancelCheckout', {
        url: '/cancel-checkout/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/cancel.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },
            controller: 'stripeController'
        }
    }).state('stripeCheckout', {
        url: '/stripe-checkout',
        views: {
            'header': {
                templateUrl: 'views/payment/header.html'
            },
            'mainContent': {
                templateUrl: 'views/payment/payment_checkout.html'
            },
            'footer': {
                templateUrl: 'views/payment/footer.html'
            },
            controller: 'loginController'
        }
    }).state('stripeCheckoutRenewal', {
        url: '/stripe-checkout-renewal',
        views: {
            'header': {
                templateUrl: 'views/payment/header.html'
            },
            'mainContent': {
                templateUrl: 'views/payment/renew_payment_checkout.html'
            },
            'footer': {
                templateUrl: 'views/payment/footer.html'
            },
            controller: 'renewPaymentController'
        }
    }).state('intermediaryWork', {
        url: '/middle-work',
        views: {
            'header': {
                templateUrl: 'views/payment/header.html'
            },
            'mainContent': {
                templateUrl: 'views/intermediatepage.html'
            },
            'footer': {
                templateUrl: 'views/payment/footer.html'
            },
            controller: 'intermediatepageController'
        }
    }).state('registration', {
        url: '/registration',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/registration.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },
            controller: 'loginController'
        }
    }).state('ziyaratRegistration', {
        url: '/ziyaratRegistration',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyaratRegistration.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },
            controller: 'loginController'
        }
    }).state('dashboard', {
        url: '/admin/dashboard',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/dashboard.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addpage', {
        url: '/admin/addpage',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/page/add_page.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            },
            controller: 'pagecontroller'
        }
    }).state('updatepage', {
        url: '/admin/updatepage',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/page/update_page.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addPageContent', {
        url: '/admin/addPageContent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/page/addPageContent.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addDynamicPageContent', {
        url: '/admin/addDynamicPageContent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/page/addDynamicPageContent.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addproject', {
        url: '/admin/addproject',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/project/add_project.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateproject', {
        url: '/admin/updateproject',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/project/update_project.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addReligiousPayment', {
        url: '/admin/addReligiousPayment',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/religiousPayments/add_religious_payment.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('religiousPaymentslist', {
        url: '/admin/religiousPaymentslist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/religiousPayments/religious_payments_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updatereligiousPayment', {
        url: '/admin/updatereligiousPayment',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/religiousPayments/update_religious_payment.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addsadaqa', {
        url: '/admin/addsadaqa',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/sadaqa/add_sadaqa.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updatesadaqa', {
        url: '/admin/updatesadaqa',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/sadaqa/update_sadaqa.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('sadaqalist', {
        url: '/admin/sadaqalist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/sadaqa/sadaqa_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addOrphan', {
        url: '/admin/addOrphan',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/add_orphan.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('orphanList', {
        url: '/admin/orphanList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/orphan_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('orphanContent', {
        url: '/admin/orphanContent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/orphan_content.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateOrphan', {
        url: '/admin/updateOrphan',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/update_orphan.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addGeneralCare', {
        url: '/admin/addGeneralCare',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/add_general_care.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('generalCareList', {
        url: '/admin/generalCareList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/general_care_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateGeneralCare', {
        url: '/admin/updateGeneralCare',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/orphan/update_general_care.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addStudent', {
        url: '/admin/addStudent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/add_student_profile.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('studentList', {
        url: '/admin/studentList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/student_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateStudent', {
        url: '/admin/updateStudent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/update_student.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addDarAlZahraModule', {
        url: '/admin/addDarAlZahraModule',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/add_daral_zahra_module.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('darAlZahraList', {
        url: '/admin/darAlZahraList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/daral_zahra_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateDarAlZahra', {
        url: '/admin/updateDarAlZahra',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/student/update_darAl_Zahra.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addpost', {
        url: '/admin/addpost',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/post/add_post.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updatepost', {
        url: '/admin/updatepost',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/post/update_post.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('adduser', {
        url: '/admin/adduser',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/add_user.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    })
    .state('addTarget', {
        url: '/admin/setTarget',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setTarget.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    })
    .state('updateUser', {
        url: '/admin/updateUser/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/add_user.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addRepresentative', {
        url: '/admin/addRepresentative',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/representative/addRepresentative.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('representativeList', {
        url: '/admin/representativeList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/representative/representativeList.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('representatives', {
        url: '/representatives',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/representative/representatives.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('addCampaign', {
        url: '/admin/addCampaign',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/campaign/addCampaign.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('campaignList', {
        url: '/admin/campaignList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/campaign/campaignList.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('webSettings', {
        url: '/admin/webSettings',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/webSettings.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('suggestedDonations', {
        url: '/admin/suggestedDonations',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/suggestedDonations.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('pagelist', {
        url: '/admin/pagelist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/page/page_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('projectlist', {
        url: '/admin/projectlist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/project/project_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addsubcategory', {
        url: '/admin/addsubcategory',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/add_subcategory.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateSubCategory', {
        url: '/admin/updateSubcategory',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/update_subcategory.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addOccasion', {
        url: '/admin/addOccasion',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/add_occasion.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('occasionList', {
        url: '/admin/occasionList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/occasion_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateOccasion', {
        url: '/admin/updateOccasion',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/update_occasion.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('addDua', {
        url: '/admin/addDua',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/addDua.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('duaList', {
        url: '/admin/duaList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/dua_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('updateDua', {
        url: '/admin/updateDua',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/update_dua.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('projects', {
        url: '/projects',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/projects/projects.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('posts', {
        url: '/posts',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/post/posts.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('sadaqas', {
        url: '/sadaqas',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/sadaqa/sadaqas.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('religiouspayments', {
        url: '/religiouspayments',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/religious_payments/religiouspayments.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('orphans', {
        url: '/orphans',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/orphans/orphans.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('generalcares', {
        url: '/generalcares',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/orphans/general_care.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('generalcaredetails/', {
        url: '/generalcaredetails/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/orphans/general_care_detail.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('donarDashboard', {
        url: '/donar/dashboard',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/donarDashboard.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },


        },
        params: {'campaignCount': null, 'userId': null}
    })
    .state('donarRecurring', {
        url: '/donar/recurring',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/donarRecurring.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            },


        },
        params: {'campaignCount': null, 'userId': null}
    }).state('editProfile', {
        url: '/editProfile',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/edit_profile.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('generalCareSponsorship', {
        url: '/donar/generalCareSponsorship',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/generalCareSponsorship.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('DAZSchool', {
        url: '/donar/DAZSchool',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/DAZSchool.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('student', {
        url: '/donar/DAZSchool/student/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/studentDetails.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('donations', {
        url: '/donar/donations',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/donations.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('khums', {
        url: '/donar/khums',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/khums.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('renewals', {
        url: '/donar/renewals',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/renewals.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('religiouspayment_subcategories', {
        url: '/religiouspayment_subcategories/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/religious_payments/religiouspayment-subcategories.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('ziyarat', {
        url: '/ziyarat',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyarat/ziyarat.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        },
        params: {
            userLoggedIn: null
        }
    }).state('ziyaratList', {
        url: '/admin/ziyaratList',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyarat/ziyaratList.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('ziyaratPerformNotification', {
        url: '/ziyaratPerformNotification',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyarat/ziyaratPerformNotification.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('ziyaratAdminSetting', {
        url: '/admin/ziyaratAdminSetting',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyarat/ziyaratAdminSetting.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('zaireenList', {
        url: '/zaireenList',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/ziyarat/zaireenList.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('donation/successful', {
        url: '/donation/successful/:message',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/page/donationSuccessful.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('sadaqadetails/', {
        url: '/sadaqadetails/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/sadaqa/sadaqaDetail.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('religiouspaymentdetails/', {
        url: '/religiouspaymentdetails/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/religious_payments/religiouspayment-detail.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('subcategorydetail/', {
        url: '/subcategorydetail/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/religious_payments/subcategory-detail.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('postdetail/', {
        url: '/postdetail/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/post/postDetail.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('projectdetails/', {
        url: '/projectdetails/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/projects/projectDetails.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('postlist', {
        url: '/admin/postlist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/post/post_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('subcategorylist', {
        url: '/admin/subcategorylist',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/subcategory_list.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    })
        .state('userlist', {
            url: '/admin/userlist',
            views: {
                'header': {
                    templateUrl: 'views/header_admin2.html'
                },
                'sidebar': {
                    templateUrl: 'views/sidebar_admin.html'
                }
                ,
                'mainContent': {
                    templateUrl: 'views/admin/user_list.html'
                },
                'footer': {
                    templateUrl: 'views/footer_admin.html'
                }
            }
        }).state('setmenu', {
        url: '/admin/setmenu',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/set_menu.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('translate', {
        url: '/admin/translate',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/translate/translate.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('receipts', {
        url: '/admin/receipts',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/receipts/receipts.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('contact', {
        url: '/admin/contactUs',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/contact_admin.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('orphanslis', {
        url: '/admin/contactUs',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/contact_admin.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('khumsreceipts', {
        url: '/admin/khumsreceipts',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/receipts/khumsReceipts.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    })
        .state('forgotpassword', {
            url: '/forgot',
            views: {

                'mainContent': {
                    templateUrl: 'views/forgotpassword.html'
                },

                controller: 'loginController'
            }
        }).state('resetpassword', {
        url: '/resetpassword',
        views: {
            'mainContent': {
                templateUrl: 'views/resetpassword.html'
            },

            controller: 'loginController'
        }
    })
        .state('daralzahradetails/', {
            url: '/daralzahradetails/:id',
            views: {
                'header': {
                    templateUrl: 'views/header_admin.html'
                },
                'mainContent': {
                    templateUrl: 'views/orphans/daral_zahra_detail.html'
                },
                'footer': {
                    templateUrl: 'views/footer.html'
                }
            }
        })
        .state('/reset/:tpl', {
            url: '/reset/:tpl',
            views: {
                'mainContent': {
                    templateUrl: function (attr) {
                        jQuery.ajax({
                            type: 'GET',
                            async: false,
                            cache: false,
                            url: 'api/reset/' + attr.tpl,
                            success: function (data) {
                                top.location.href = "/#/resetpassword?token=" + data.message;
                            }
                        });
                    }
                }

            }

        }).state('daralzahra', {
        url: '/daralzahra',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/orphans/daral_zahra.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('sendNotification', {
        url: '/admin/sendNotification',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/notification/sendNotification.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('currencySetup', {
        url: '/admin/currencySetup',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            }
            ,
            'mainContent': {
                templateUrl: 'views/admin/setup/currencySetup.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('socialLoginSucess', {
        url: '/socialLoginSucess/:email/:aunthentication',
        views: {
            'mainContent': {
                templateUrl: 'views/socialLoginSuccess.html'
            }
        }
    }).state('consolidatedReport', {
        url: '/admin/consolidatedReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/consolidatedReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('donarWiseReport', {
        url: '/admin/donarWiseReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/donarWiseReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('projectionReport', {
        url: '/admin/projectionReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/projectionReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('donarDetailReport', {
        url: '/admin/donarDetailReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/donarDetailsReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('accountingReport', {
            url: '/admin/accountingReport',
            views: {
                'header': {
                    templateUrl: 'views/header_admin2.html'
                },
                'sidebar': {
                    templateUrl: 'views/sidebar_admin.html'
                },
                'mainContent': {
                    templateUrl: 'views/reports/accountingReport.html'
                },
                'footer': {
                    templateUrl: 'views/footer_admin.html'
                }
            }
        }).state('hajjZiyarahReport', {
           url: '/admin/hajjZiyarahReport',
            views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/hajjZiyarahReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('islamicPaymentsReport', {
        url: '/admin/islamicPaymentsReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/islamicPaymentsReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('khumsReport', {
        url: '/admin/khumsReport',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/reports/khumsReport.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    })
        .state('profileReport', {
            url: '/admin/profileReport',
            views: {
                'header': {
                    templateUrl: 'views/header_admin2.html'
                },
                'sidebar': {
                    templateUrl: 'views/sidebar_admin.html'
                },
                'mainContent': {
                    templateUrl: 'views/reports/profileReport.html'
                },
                'footer': {
                    templateUrl: 'views/footer_admin.html'
                }
            }
        })
        .state('sponsorshipRenewalReport', {
            url: '/admin/sponsorshipRenewalReport',
            views: {
                'header': {
                    templateUrl: 'views/header_admin2.html'
                },
                'sidebar': {
                    templateUrl: 'views/sidebar_admin.html'
                },
                'mainContent': {
                    templateUrl: 'views/reports/sponsorshipRenewalReport.html'
                },
                'footer': {
                    templateUrl: 'views/footer_admin.html'
                }
            }
        })
        .state('page/', {
            url: '/page/:pageName',
            views: {
                'header': {
                    templateUrl: 'views/header_admin.html'
                },
                'mainContent': {
                    templateUrl: 'views/page/pageTemplate.html'
                },
                'footer': {
                    templateUrl: 'views/footer_admin.html'
                }
            }
        }).state('pages/', {
        url: '/pages/:id',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/page/pageTemplate2.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('aboutUs', {
        url: '/aboutUs',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/aboutUs.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('getInvolved', {
        url: '/getInvolved',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/getInvolved.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('faq', {
        url: '/faq',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/FAQ.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('contact_us', {
        url: '/contact_us',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/contact_us.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('newsLetter-list', {
        url: '/admin/newsLetter-list',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/newsLetter_admin.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('volunteer', {
        url: '/volunteer',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/volunteer.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('gallery', {
        url: '/gallery',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/contentPages/gallery.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    }).state('aboutUsContent', {
        url: '/admin/aboutUsContent',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/page/aboutUsContent.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('manageorphans', {
        url: '/admin/manageorphans',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/manageorphans.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('managestudents', {
        url: '/admin/managestudents',
        views: {
            'header': {
                templateUrl: 'views/header_admin2.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_admin.html'
            },
            'mainContent': {
                templateUrl: 'views/admin/managestudents.html'
            },
            'footer': {
                templateUrl: 'views/footer_admin.html'
            }
        }
    }).state('donorProgram', {
        url: '/donar/Program',
        views: {
            'header': {
                templateUrl: 'views/header_admin.html'
            },
            'sidebar': {
                templateUrl: 'views/sidebar_donar.html'
            },
            'mainContent': {
                templateUrl: 'views/donar/donorPrograms.html'
            },
            'footer': {
                templateUrl: 'views/footer.html'
            }
        }
    })

    $locationProvider.html5Mode(false);
    $locationProvider.hashPrefix('');


    // $urlRouterProvider.otherwise('login');

    // $stateProvider.state('home', {
    //     url: '/home',
    //     templateUrl: 'views/home.html',
    //     controller: 'testController'

    // }).state('login',{
    //     url:'/login',
    //     templateUrl:'views/login.html',
    //     controller:'loginController'
    // }).state('registration',{
    //     url:'/registration',
    //     templateUrl:'views/registration.html',
    //     controller:'loginController'
    // }).state('social',{
    //     url:'/social',
    //     templateUrl:'views/home.html'
    // })

    // $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('');
}]);