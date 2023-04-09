
(function () {
  angular
    .module("mainApp")
    .controller("pageContentController", PageContentController);

  function PageContentController(
    $scope,
    $rootScope,
    $sce,
    $state,
    $location,
    $compile,
    $window,
    $translate,
    multipartForm,
    pageContentService,
    representativeService,
    dynamicPageContentService,
    religiousPaymentService,
    webSettingsService,
    programTypeService,
    campaignService,
    sadaqaService,
    projectService,
    countryService,
    cartService,
    occasionService,
    duaService,
    utilService,
    generalCareService,
    darAlZahraService,
    currencyService,
    orphanService,
    studentProfileService,
    ziyaratService,
    $filter,
    userService,
    loginService,
    config,
    eventLogsService
  ) {
    var pageVM = this;
    getTarget();
    pageVM.sadaqa = {};
    pageVM.pageData = null;
    pageVM.countryList = [];
    pageVM.pageContentForm = null;
    pageVM.pageDetails = {};
    pageVM.programTypesList = [];
    pageVM.socialMedia = {};
    pageVM.socialMediaList = [];
    pageVM.faqQuestionAnswers = {};
    pageVM.faqQuestionAnswersList = [];
    pageVM.homeSlider = {};
    pageVM.sliderImagesList = [];
    pageVM.queryDetails = {};
    pageVM.representativeList = [];
    pageVM.religiousPaymentsList = [];
    pageVM.webSettings = {};
    pageVM.campaignList = [];
    pageVM.campaignFeatured = {};
    pageVM.sliderIndex = 0;
    pageVM.carouselIndex = 0;
    pageVM.editRow = false;
    pageVM.queryDetails = {};
    pageVM.languageList = [];
    pageVM.volunterLanguageList = [];
    pageVM.volunteerDetails = {};
    pageVM.galleryMedia = {};
    pageVM.galleryMediaList = [];
    pageVM.registeredForZiyarat = false;

    pageVM.getZiyaratByUserId = getZiyaratByUserId;
    pageVM.registerForZiyarat = registerForZiyarat;
    pageVM.sendEmail = sendEmail;
    pageVM.addLanguage = addLanguage;
    pageVM.deleteLanguage = deleteLanguage;
    pageVM.saveVolunteer = saveVolunteer;
    pageVM.getPagesListByTitle = getPagesListByTitle;
    pageVM.getProgramTypes = getProgramTypes;
    pageVM.getRepresentative = getRepresentative;
    pageVM.getReligiousPayments = getReligiousPayments;
    pageVM.getWebSettings = getWebSettings;
    pageVM.getTopicFAQs = getTopicFAQs;
    pageVM.getCampaigns = getCampaigns;
    pageVM.validation = validation;
    pageVM.sliderNavigation = sliderNavigation;
    pageVM.nextPreviousSlider = nextPreviousSlider;
    pageVM.nextPreviousCarousel = nextPreviousCarousel;
    pageVM.donateNow = donateNow;
    pageVM.getPageContentByName = getPageContentByName;
    pageVM.savePageContentByName = savePageContentByName;
    pageVM.addSocialMedia = addSocialMedia;
    pageVM.deleteSocialMedia = deleteSocialMedia;
    pageVM.addQuestionAnswers = addQuestionAnswers;
    pageVM.deleteQuestionAnswers = deleteQuestionAnswers;
    pageVM.addSlider = addSlider;
    pageVM.deleteSlider = deleteSlider;
    pageVM.addMedia = addMedia;
    pageVM.deleteMedia = deleteMedia;
    pageVM.filterGallery = filterGallery;
    pageVM.resetForm = resetForm;
    pageVM.sendEmailContactUs = sendEmailContactUs;

    //FAST DONATION START
    $scope.checkBoxNotChecked = true;
    pageVM.programType = {};
    pageVM.subCategories = [];
    pageVM.getLanguagesList = getLanguagesList;
    pageVM.getActiveSadaqas = getActiveSadaqas;
    pageVM.selectSadqaCalculator = selectSadqaCalculator;
    pageVM.setCalculatorForDailySadaqa = setCalculatorForDailySadaqa;
    pageVM.getSadqaCalculator = getSadqaCalculator;
    pageVM.getActiveProjects = getActiveProjects;
    pageVM.selectProjectCalculator = selectProjectCalculator;
    pageVM.getProjectCalculator = getProjectCalculator;
    pageVM.checkSubCategory = checkSubCategory;
    pageVM.selectRpCalculator = selectRpCalculator;
    pageVM.getRpCalculator = getRpCalculator;
    pageVM.setSubcategory = setSubcategory;
    pageVM.getCountryList = getCountryList;
    pageVM.getActiveReligiousPayments = getActiveReligiousPayments;
    pageVM.donate = donate;
    pageVM.addCartItem = addCartItem;
    $scope.isDetail = false;
    pageVM.showComments = showComments;
    pageVM.getActiveGeneralCares = getActiveGeneralCares;
    pageVM.getAllActiveDarAlZahra = getAllActiveDarAlZahra;
    pageVM.getGcCalculator = getGcCalculator;
    pageVM.getDzCalculator = getDzCalculator;
    pageVM.clearOrphanCalculator = clearOrphanCalculator;
    pageVM.donateNowCarousel = donateNowCarousel;
    $scope.duaList = [];

    pageVM.orphanCompleteList = [];

    pageVM.browserLanguage = localStorage.getItem("lang");
    if (pageVM.browserLanguage === 'ARB') {
      pageVM.sliderStyle = { 'float': 'none !important' };
    } else {
      pageVM.sliderStyle = {};
    }
    pageVM.selectedRecurring = false;
    $scope.qurbaniPerformPlace = null;
    $scope.selectedRecurring = false;

    $scope.isAutoRenew = false;
    $scope.childName = null;

    $scope.paymentMethod = $translate.instant('ONETIME');

    if (window.innerWidth > 600 && window.innerWidth < 1200) {
      pageVM.showSlides = 3;
      pageVM.slidesToScroll = 2;
    } else if (window.innerWidth > 1200) {
      pageVM.showSlides = 4;
      pageVM.slidesToScroll = 2;
    } else {
      pageVM.showSlides = 1;
      pageVM.slidesToScroll = 1;
    }

    $scope.selectedDescend = 'Any';
    $scope.selectedGender = 'Any';
    $scope.customerNote = null;


    async function getNoteBasedOnSlug(slug) {

      $scope.customerNote = null;
      let messages = await religiousPaymentService.getNoteBasedOnSlug(slug);
      if (messages && messages.data) {
        let note = messages.data.value.translatedMessage[lang];
        $scope.customerNote = note;
      }

    }


    function donateNowCarousel(program) {
      if (program.programSubCategory && program.programSubCategory.length) {
        $state.go("religiouspayment_subcategories", { id: program.slug });
      } else {
        const newSlug =
          program.mainSlug &&
          program.mainSlug
            .split("-")
            .join(" ")
            .trim()
            .toUpperCase();
        const pagesToRestrict = [
          "KHUMS",
          "DONATIONS FOR HOLY SHRINES",
          "NIYAZ"
        ];
        if (pagesToRestrict.indexOf(newSlug) > -1) {
          $state.go("religiouspayment_subcategories", { id: program.mainSlug });
        } else {
          window.location.href = `/#/subcategorydetail/${program.slug}?programid=${program.mainSlug}`;
        }
      }
    }
    let myobj = JSON.parse(sessionStorage.getItem("currency"));
    $scope.prices = [1000, 1500, 2000];
    $scope.originalPrices = [1000, 1500, 2000];
    //FAST DONATION END
    for (let i = 0; i < $scope.prices.length; i++) {
      if (myobj.title != "USD") {
        $scope.prices[i] = currencyService.currencyConversionFormula(
          myobj.rateExchange * $scope.prices[i]
        );
      } else {
        break;
      }
    }
    $scope.bindUrl = function (id) {
      return `/#/pages/${id}`;
    };
    function getTarget() {
      let currency = JSON.parse(sessionStorage.getItem("currency"));
      userService.getAchievementRates('USD').then(function (res) {
        pageVM.target = res.data.target;
        pageVM.achieved = res.data.achieved;
        // if (res.status == 200 && res.data) {
        //   if (currency.title !== 'USD') {
        //     pageVM.target = Math.round(currencyService.currencyConversionFormula(res.data.target * currency.rateExchange)).toFixed(0);
        //     pageVM.achieved = Math.round(currencyService.currencyConversionFormula(res.data.achieved * currency.rateExchange)).toFixed(0);
        //   } else {
        //   }
        let elem = angular.element(".progress-bar-striped")[0];
        if (elem && elem.style) {
          elem.style.width = res.data.percent;
        }
        // }
      });
    }
    countryService.getCountryList().then(function (response) {
      pageVM.countryList = response.data || [];
      pageVM.countryList = pageVM.countryList.map(c => {
        if (localStorage.getItem('lang') === 'FRN') {
          c.name = c.nameFRN;
        } else if (localStorage.getItem('lang') === 'ARB') {
          c.name = c.nameARB;
        }
        return c;
      })
    });
    $scope.age = function (birthday) {
      if (birthday) {
        let bday = new Date(birthday);
        var ageDifMs = Date.now() - bday.getTime();
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      }
    };
    $scope.isNumberKey = function (event) {
      let amount = String.fromCharCode(event.which || event.keyCode);
      let pattern = /^[0-9]\d*(\.\d+)?$/;
      if (!pattern.test(amount)) {
        event.preventDefault();
      }
    };

    function getLanguagesList() {
      countryService.getLanguagesList().then(response => {
        pageVM.languageList = response || [];
        if (pageVM.languageList.length) {
          pageVM.language = null;
        }
      });
    }

    // this code is written for target bar in arabic
    let lang = localStorage.getItem('lang');
    if (lang == 'ARB') {
      pageVM.targetBarArb = true
    } else if (lang == 'FRN' || lang == 'ENG') {
      pageVM.targetBarArb = false
    }

    function getZiyaratByUserId() {
      ziyaratService.getZiyaratByUserId().then(function (response) {
        pageVM.registeredForZiyarat = response.data;
      });
    }

    $rootScope.$on("$getZiyaratByUserId", function (event, next, current) {
      pageVM.getZiyaratByUserId();
    });

    function showError() {
      let validateMsg;
      if (pageVM.browserLanguage == "ARB") {
        validateMsg = "يرجى ملء الحقول الفارغة";
      } else if (pageVM.browserLanguage == "FRN") {
        validateMsg = "Veuillez remplir les champs manquants";
      } else {
        validateMsg = "Please fill the missing fields";
      }
      swal({
        title: validateMsg,
        position: "center-center",
        type: "error",
        allowOutsideClick: false
      });
      return false;
    }
    function registerForZiyarat() {
      if ($rootScope.isLogin) {
        if (pageVM.registeredForZiyarat) {
          let validateMsg;
          validateMsg = $translate.instant('ALREADY REGISTERED FOR ZIYARAT')
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
        } else {
          var obj = {
            fullName: $rootScope.loggedInUserDetails.fullName,
            email: $rootScope.loggedInUserDetails.email,
            phone: $rootScope.loggedInUserDetails.mobile,
            language: $rootScope.loggedInUserDetails.language,
            date: new Date(),
            country: $rootScope.loggedInUserDetails.country,
            hasAssigned: true,
          };
          ziyaratService.registerForZiyarat(obj).then(function (response) {
            if (response.status == 200) {
              pageVM.getZiyaratByUserId();
              if (response.data == config.Messages.ZiaratRegSuccess) {
                let toastMsg;
                if (pageVM.browserLanguage == "ARB") {
                  toastMsg = 'تم حفظ الزيارة بنجاح';
                } else if (pageVM.browserLanguage == "FRN") {
                  toastMsg = "Vous êtes inscrits pour la Ziyarah d'Imam Hussain (as) ce jeudi soir!";
                } else {
                  toastMsg = response.data;
                }
                swal($translate.instant('Success!'), toastMsg, "success");
              }
            } else {
              swal("Failed!", "Failed to save", "error");
            }
          });
        }
      } else {
        loginService.requestForZiyarah = true;
        jQuery("#ziyaratLoginModal").modal("show");
      }
    }

    function sendEmail(isValid) {
      if (isValid) {
        pageVM.queryDetails.html = JSON.stringify(
          '<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head>' +
          pageVM.queryDetails.message +
          "</html>"
        );

        utilService.loader({
          status: "START",
          msg: "Sending Email Please wait..."
        });
        pageContentService.sendEmail(pageVM.queryDetails).then(function (res) {
          utilService.loader({ status: "STOP" });
          if (res.data === "sent") {
            pageVM.queryDetails = {};
            swal({
              title: "Email sent",
              position: "center-center",
              type: "success",
              allowOutsideClick: false
            });
          }
        });
      }
    }

    function sendEmailContactUs(isValid) {
      if (isValid) {

        let checkEmail = config.EmailRegex;

        if (pageVM.queryDetails.email && !checkEmail.test(pageVM.queryDetails.email))  {
          swal({
            position: 'center-center',
            type: 'error',
            title: $translate.instant('Email format is not correct'),
            showConfirmButton: false,
            timer: 2000
          });
          return
        }

        const title = $translate.instant("Sending email please wait");
        pageVM.queryDetails.html = JSON.stringify(
          '<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head>' +
          pageVM.queryDetails.message +
          "</html>"
        );
        pageVM.queryDetails.language = pageVM.browserLanguage;
        utilService.loader({ status: "START", msg: title });
        pageContentService
          .sendEmailContactUs(pageVM.queryDetails)
          .then(function (res) {
            utilService.loader({ status: "STOP" });
            if (res.data === "sent") {
              pageVM.queryDetails = {};
              swal({
                title: $translate.instant("Email Sent"),
                position: "center-center",
                type: "success",
                allowOutsideClick: false
              });
            } else {
              swal({
                title: $translate.instant("Failed to send email."),
                position: "center-center",
                type: "error",
                allowOutsideClick: false
              });
            }
          });
      }
    }

    function addLanguage() {
      if (pageVM.language) {
        let langObj = {
          language: pageVM.language || null,
          read: pageVM.languageLevelRead || false,
          write: pageVM.languageLevelWrite || false,
          speak: pageVM.languageLevelSpeak || false
        };
        if (
          !_.find(pageVM.volunterLanguageList, { language: pageVM.language })
        ) {
          pageVM.volunterLanguageList.push(langObj);
        }
        //reset language
        pageVM.language = null;
        pageVM.languageLevelRead = false;
        pageVM.languageLevelWrite = false;
        pageVM.languageLevelSpeak = false;
      }
    }

    function deleteLanguage(idx) {
      if (idx != null) {
        pageVM.volunterLanguageList.splice(idx, 1);
      }
    }

    function saveVolunteer(isValid) {
      if (isValid) {
        if (pageVM.file) {
          multipartForm.post("/upload", pageVM.file).then(function (res) {
            if (res) {
              pageVM.volunteerDetails.photo = res.data.name;
              pageVM.volunteerDetails.language = pageVM.volunterLanguageList;
              pageContentService
                .saveVolunteer(pageVM.volunteerDetails)
                .then(function (response) {
                  if (response.status === 200) {
                    pageVM.resetForm();
                    if (
                      response.data ==
                      "Your form has been submitted. Thank You for extending your help"
                    ) {
                      let toastMsg;
                      if (pageVM.browserLanguage == "ARB") {
                        toastMsg = "تم تقديم الإستمارة، شكرا لك";
                      } else if (pageVM.browserLanguage == "FRN") {
                        toastMsg =
                          "Votre formulaire a bien été reçu ! Merci de proposer votre aide !";
                      } else {
                        toastMsg = response.data;
                      }
                      swal({
                        title: toastMsg,
                        position: "center-center",
                        type: "success",
                        allowOutsideClick: false
                      });
                    } else {
                      swal({
                        title: $translate.instant(response.data),
                        position: "center-center",
                        type: "success",
                        allowOutsideClick: false
                      });
                    }
                  } else {
                    swal({
                      title: "Failed to save",
                      position: "center-center",
                      type: "error",
                      allowOutsideClick: false
                    });
                  }
                });
            }
          });
        }
        if (pageVM.cv) {
          multipartForm.post("/upload", pageVM.cv).then(function (res) {
            if (res) {
              pageVM.volunteerDetails.cv = res.data.name;
              pageVM.volunteerDetails.language = pageVM.volunterLanguageList;
              pageContentService
                .saveVolunteer(pageVM.volunteerDetails)
                .then(function (response) {
                  if (response.status === 200) {
                    pageVM.resetForm();
                    if (
                      response.data ==
                      "Your form has been submitted. Thank You for extending your help"
                    ) {
                      let toastMsg;
                      if (pageVM.browserLanguage == "ARB") {
                        toastMsg = "تم تقديم الإستمارة، شكرا لك";
                      } else if (pageVM.browserLanguage == "FRN") {
                        toastMsg =
                          "Votre formulaire a bien été reçu ! Merci de proposer votre aide !";
                      } else {
                        toastMsg = response.data;
                      }
                      swal({
                        title: toastMsg,
                        position: "center-center",
                        type: "success",
                        allowOutsideClick: false
                      });
                    } else {
                      swal({
                        title: $translate.instant(response.data),
                        position: "center-center",
                        type: "success",
                        allowOutsideClick: false
                      });
                    }
                  } else {
                    swal({
                      title: "Failed to save",
                      position: "center-center",
                      type: "error",
                      allowOutsideClick: false
                    });
                  }
                });
            }
          });
        } else {
          pageVM.volunteerDetails.language = pageVM.volunterLanguageList;
          pageContentService
            .saveVolunteer(pageVM.volunteerDetails)
            .then(function (response) {
              if (response.status === 200) {
                pageVM.resetForm();
                if (
                  response.data ==
                  "Your form has been submitted. Thank You for extending your help"
                ) {
                  let toastMsg;
                  if (pageVM.browserLanguage == "ARB") {
                    toastMsg = "تم تقديم الإستمارة، شكرا لك";
                  } else if (pageVM.browserLanguage == "FRN") {
                    toastMsg =
                      "Votre formulaire a bien été reçu ! Merci de proposer votre aide !";
                  } else {
                    toastMsg = response.data;
                  }
                  swal({
                    title: toastMsg,
                    position: "center-center",
                    type: "success",
                    allowOutsideClick: false
                  });
                } else {
                  swal({
                    title: $translate.instant(response.data),
                    position: "center-center",
                    type: "success",
                    allowOutsideClick: false
                  });
                }
              } else {
                swal({
                  title: "Failed to save",
                  position: "center-center",
                  type: "error",
                  allowOutsideClick: false
                });
              }
            });
        }
      }
    }

    function getPagesListByTitle(pageName) {
      var lang = pageVM.browserLanguage;
      dynamicPageContentService
        .getPagesListByTitle(pageName, lang)
        .then(function (response) {
          if (response.data) {
            pageVM.pagesList = response.data || [];
            pageVM.pagesList = pageVM.pagesList.sort((a, b) => a.order - b.order);
          }
        });
    }

    //Get All Program Types
    function getProgramTypes() {
      programTypeService.getProgramTypes().then(function (res) {
        pageVM.programTypesList = res.data;
      });
    }

    // get all Representative
    function getRepresentative() {
      var lang = pageVM.browserLanguage;
      representativeService.getRepresentative(lang, false).then(function (response) {
        pageVM.representativeList = response.data || [];
      });
    }

    // get all Religious Payments
    function getReligiousPayments() {
      if (pageVM.browserLanguage == "ARB") {
        religiousPayment = "المدفوعات الدينية";
      } else if (pageVM.browserLanguage == "FRN") {
        religiousPayment = "Paiements religieux";
      } else {
        religiousPayment = "Religious Payments";
      }
      programTypeService.getProgramType(religiousPayment).then(function (res) {
        pageVM.programType = res.data[0];
        var programTypeId = pageVM.programType._id;
        religiousPaymentService
          .getReligiousPayments(programTypeId)
          .then(function (res) {
            pageVM.religiousPaymentsList = res.data;
            $scope.carousel = [];
            let progsList = []
            for (let i = 0; i < pageVM.religiousPaymentsList.length; i++) {
              let obj = pageVM.religiousPaymentsList[i];
              if (obj.isActive) {
                progsList.push(obj);
              }
              //   if (
              //     obj &&
              //     obj.programSubCategory &&
              //     obj.programSubCategory.length
              //   ) {
              //     for (let j = 0; j < obj.programSubCategory.length; j++) {
              //       if (obj.programSubCategory[j].isActive) {
              //         obj.programSubCategory[j].mainSlug = obj.slug;
              //         progsList.push(obj.programSubCategory[j]);
              //       }
              //     }
              //   }
              // }
            }
            //pick random elements and set to scope
            $scope.carousel = _.sampleSize(progsList, 10)
            return res;
          });
      });
    }

    // get web Settings
    function getWebSettings() {
      webSettingsService.getWebSettings().then(function (response) {
        if (response.status == 200) {
          pageVM.webSettings = response.data;
        }
      });
    }

    function getTopicFAQs(id) {
      if (id) {
        pageVM.faqQuestionAnswersList = _.filter(
          pageVM.pageData.faqQuestionAnswers,
          { topic: id }
        );
      } else {
        pageVM.faqQuestionAnswersList = pageVM.pageData.faqQuestionAnswers;
      }
    }

    // get campaigns
    function getCampaigns() {
      var lang = pageVM.browserLanguage;
      campaignService.getActiveCampaigns(lang).then(function (response) {
        if (response.status == 200 && response.data.length > 0) {
          pageVM.campaignFeatured = response.data[0];
          if (
            pageVM.campaignFeatured &&
            pageVM.campaignFeatured.program &&
            pageVM.campaignFeatured.program.length
          ) {
            switch (pageVM.campaignFeatured.programType[0].programTypeName) {
              case "Religious Payments":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/religiouspayment_subcategories/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '" ><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/religiouspayment_subcategories/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "Paiements religieux":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/religiouspayment_subcategories/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '" ><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/religiouspayment_subcategories/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "الدفع الديني":
              case "المدفوعات الدينية":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/religiouspayment_subcategories/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '" ><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/religiouspayment_subcategories/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "Project":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/projectdetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>>';
                pageVM.donateBtnLink =
                  "/#/projectdetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "Projets":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/projectdetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>>';
                pageVM.donateBtnLink =
                  "/#/projectdetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "مشروع":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/projectdetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>>';
                pageVM.donateBtnLink =
                  "/#/projectdetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "Sadqa":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/sadaqadetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/sadaqadetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "Sadaqah":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/sadaqadetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/sadaqadetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "الصدقة":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/sadaqadetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a>';
                pageVM.donateBtnLink =
                  "/#/sadaqadetails/" + pageVM.campaignFeatured.program[0]._id;
                break;
              case "General Care":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit"  href="/#/generalcaredetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a></div>';
                pageVM.donateBtnLink =
                  "/#/generalcaredetails/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "الرعاية العامة":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit"  href="/#/generalcaredetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a></div>';
                pageVM.donateBtnLink =
                  "/#/generalcaredetails/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "Dar Al Zahra":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit"  href="/#/daralzahradetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a></div>';
                pageVM.donateBtnLink =
                  "/#/daralzahradetails/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              case "(دار الزهراء (ع":
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit"  href="/#/daralzahradetails/' +
                  pageVM.campaignFeatured.program[0]._id +
                  '"><span>Donate Now</span></a></div>';
                pageVM.donateBtnLink =
                  "/#/daralzahradetails/" +
                  pageVM.campaignFeatured.program[0]._id;
                break;
              default:
                pageVM.donateBtn =
                  '<a class="grop-btn-donateSlider grop-btn_submit" ><span>Donate Now</span></a></div>';
                pageVM.donateBtnLink = "";
            }
          }
        }
        var sliderList = checkCampaignExpiry(response.data);
        initializeCampaignSlider(sliderList);
        initializePieChart(sliderList);
        sliderAutoRunner(sliderList);
      });
    }
    function checkCampaignExpiry(list) {
      var fullDate = new Date();
      var twoDigitMonth =
        fullDate.getMonth().length + 1 === 1 ?
          fullDate.getMonth() + 1 :
          "0" + (fullDate.getMonth() + 1);
      var twoDigitDate =
        fullDate.getDate() <= 9 ? "0" + fullDate.getDate() : fullDate.getDate();
      var currentDate =
        twoDigitMonth + "/" + twoDigitDate + "/" + fullDate.getFullYear();

      var newList = [];
      for (let i = 0; i < list.length; i++) {
        if (list[i].endDate != null) {
          if (fullDate > new Date(list[i].startDate) && new Date(list[i].endDate) >= new Date(currentDate)) {
            newList.push(list[i]);
          }
        } else {
          newList.push(list[i]);
        }
      }
      return newList;
    }

    function initializeCampaignSlider(list) {
      pageVM.campaignList = list;
      for (let i = 0; i < pageVM.campaignList.length; i++) {
        var btn = null;
        if (
          !pageVM.campaignList[i].isBanner &&
          pageVM.campaignList[i].program.length > 0
        ) {
          switch (pageVM.campaignList[i].programType[0].programTypeName) {
            case $translate.instant("RELIGIOUS PAYMENTS"):
            case $translate.instant("ISLAMIC PAYMENTS"):
            case "المدفوعات الدينية":
              let navURL = pageVM.campaignList[i].programSubCategory && pageVM.campaignList[i].programSubCategory.length > 0 ? `/#/subcategorydetail/${pageVM.campaignList[i].programSubCategory[0].slug}?programid=${pageVM.campaignList[i].program[0].slug}` : `/#/religiouspayment_subcategories/${pageVM.campaignList[i].program[0].slug}`
              btn =
                `<a class="grop-btn-donateSlider grop-btn_submit" href="${navURL}"><span>${$translate.instant("DONATE NOW")}</span></a>`;

              break;
            case $translate.instant("PROJECTS"):
            case 'مشروع':
              btn =
                '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/projectdetails/' +
                pageVM.campaignList[i].program[0].slug +
                '"><span>' +
                $translate.instant("DONATE NOW") +
                "</span></a> </div>";
              break;
            case $translate.instant("SADAQAH"):
            case "Sadaqa":
              btn =
                '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/sadaqadetails/' +
                pageVM.campaignList[i].program[0].slug +
                '"><span>' +
                $translate.instant("DONATE NOW") +
                "</span></a>";
              break;

            case $translate.instant("GENERAL CARE"):
              btn =
                '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/generalcaredetails/' +
                pageVM.campaignList[i].program[0].slug +
                '"><span>' +
                $translate.instant("DONATE NOW") +
                "</span></a>";
              break;
            case $translate.instant("DAR AL ZAHRA"):
              btn =
                '<a class="grop-btn-donateSlider grop-btn_submit" href="/#/daralzahradetails/' +
                pageVM.campaignList[i].program[0].slug +
                '"><span>' +
                $translate.instant("DONATE NOW") +
                "</span></a>";
              break;
            default:
              btn = "";
              break;
          }
          pageVM.campaignList[i].donateBtn = btn;
        } else if (pageVM.campaignList[i].programType === "Ziyarat") {
          pageVM.campaignList[i].donateBtnZiyarat = true;
        }
      }
    }

    $scope.getFile = function (file) {
      $scope.url = $sce.trustAsResourceUrl(file);
    };

    function initializePieChart(list) {
      var pieChartData = {
        Project: {
          list: [],
          amount: 0
        },
        ReligiousPayments: {
          list: [],
          amount: 0
        },
        Sadaqa: {
          list: [],
          amount: 0
        },
        GeneralCare: {
          list: [],
          amount: 0
        },
        DarAlZahra: {
          list: [],
          amount: 0
        }
      };
      var sortedListCount = 0;
      //sorting list program type wise
      _.find(list, function (o) {
        if (o.program != null && o.program.length > 0) {
          sortedListCount = sortedListCount + 1;
          switch (o.programType[0].programTypeName) {
            case "Religious Payments":
              pieChartData.ReligiousPayments.list.push(o);
              break;
            case "Projects":
              pieChartData.Project.list.push(o);
              break;
            case "Sadaqa":
              pieChartData.Sadaqa.list.push(o);
              break;
            case "General Care":
              pieChartData.GeneralCare.list.push(o);
              break;
            case "Dar Al Zahra":
              pieChartData.DarAlZahra.list.push(o);
              break;
            default:
              break;
          }
        }
      });
      // Pie Charts for Campaign Info Graphics
      $scope.pieDiskData = {
        data: [
          calculatePercentage(
            pieChartData.Project.list.length,
            sortedListCount
          ),
          calculatePercentage(
            pieChartData.ReligiousPayments.list.length,
            sortedListCount
          ),
          calculatePercentage(pieChartData.Sadaqa.list.length, sortedListCount),
          calculatePercentage(
            pieChartData.GeneralCare.list.length,
            sortedListCount
          ),
          calculatePercentage(
            pieChartData.DarAlZahra.list.length,
            sortedListCount
          )
        ],
        labels: [
          "Projects",
          "Religious Payments",
          "Sadaqa",
          "Orphans",
          "Dar Al Zahra"
        ],
        colours: ["#f3be78", "#f0c84c", "#f2a41e", "#F44336", "#f07a22"],
        options: {
          elements: {
            arc: {
              borderWidth: 0.7
            }
          },
          legend: {
            display: true,
            position: "bottom",
            labels: {
              boxWidth: 12
            }
          },
          tooltips: {
            enabled: true,
            callbacks: {
              label: function (tooltipItem, data) {
                return (
                  data.labels[tooltipItem.index] +
                  ": " +
                  data.datasets[0].data[tooltipItem.index] +
                  " " +
                  tooltipSuffix
                );
              }
            }
          }
        }
      };
    }

    function calculatePercentage(items, list) {
      return Math.round((items * 100) / list);
    }

    function sliderNavigation(idx) {
      if (idx != null) {
        pageVM.sliderIndex = idx;
      }
    }

    function nextPreviousSlider(btn) {
      if (btn == "PREVIOUS") {
        if (pageVM.sliderIndex > 0) {
          pageVM.sliderIndex = pageVM.sliderIndex - 1;
        }
      } else if (btn == "NEXT") {
        if (pageVM.sliderIndex < pageVM.campaignList.length - 1) {
          pageVM.sliderIndex = pageVM.sliderIndex + 1;
        }
      } else {
        pageVM.sliderIndex = 0;
      }
    }

    function sliderAutoRunner(list) {
      setTimeout(function () {
        if (pageVM.sliderIndex < list.length - 1) {
          pageVM.sliderIndex = pageVM.sliderIndex + 1;
          $scope.$apply();
          sliderAutoRunner(list);
        } else {
          pageVM.sliderIndex = 0;
          $scope.$apply();
          sliderAutoRunner(list);
        }
      }, 10000);
    }

    function nextPreviousCarousel(btn) {
      if (btn == "PREVIOUS") {
        if (pageVM.carouselIndex > 0) {
          pageVM.carouselIndex = pageVM.carouselIndex - 1;
        }
      } else if (btn == "NEXT") {
        if (pageVM.carouselIndex < pageVM.religiousPaymentsList.length - 1) {
          pageVM.carouselIndex = pageVM.carouselIndex + 1;
        }
      } else {
        pageVM.carouselIndex = 0;
      }
    }

    // function carouselAutoRunner(list) {
    //     setTimeout(function () {
    //         if (pageVM.carouselIndex < list.length - 1) {
    //             pageVM.carouselIndex = pageVM.carouselIndex + 1;
    //             $scope.$apply();
    //             carouselAutoRunner(list);
    //         } else {
    //             pageVM.carouselIndex = 0;
    //             $scope.$apply();
    //             carouselAutoRunner(list);
    //         }
    //     }, 10000);
    // }

    function donateNow(donation) {
      if (donation) {
        if (donation.programType.length) {
          if (
            donation.programType[0].programTypeName == "Religious Payments" ||
            donation.programType[0].programTypeName == "Paiements religieux" ||
            donation.programType[0].programTypeName == "المدفوعات الدينية"
          ) {
            window.location =
              "/#/religiouspayment_subcategories/" + donation.slug;
          } else if (
            donation.programType[0].programTypeName == "Projects" ||
            donation.programType[0].programTypeName == "Projets" ||
            donation.programType[0].programTypeName == "مشروع"
          ) {
            window.location = "/#/projectdetails/" + donation.slug;
          } else if (
            donation.programType[0].programTypeName == "Sadaqah" ||
            donation.programType[0].programTypeName == "Sadaqa" ||
            donation.programType[0].programTypeName == "الصدقة"
          ) {
            window.location = "/#/sadaqadetails/" + donation.slug;
          } else if (
            donation.programType[0].programTypeName == "General Care" ||
            donation.programType[0].programTypeName == "Premières nécessités" ||
            donation.programType[0].programTypeName == "الرعاية العامة"
          ) {
            window.location = "/#/generalcaredetails/" + donation.slug;
          } else if (
            donation.programType[0].programTypeName == "Dar Al Zahra" ||
            donation.programType[0].programTypeName == "ProDar-Al-Zahra" ||
            donation.programType[0].programTypeName == "(دار الزهراء (ع"
          ) {
            window.location = "/#/daralzahradetails/" + donation.slug;
          }
        }
      }
    }

    function getPageContentByName(pageName) {
      var lang = pageVM.browserLanguage;
      if (
        $state.current.name == "gallery" ||
        pageName == $translate.instant("GALLERY PAGE")
      ) {
        pageName = $translate.instant("GALLERY PAGE");
        lang = lang;
      }

      pageContentService
        .getPageContentByName(pageName, lang)
        .then(function (response) {
          if ($state.current.name == "addPageContent") {
            pageVM.pageDetails = response.data || {};
            if (response.data.titleImage) {
              pageVM.editRow = true;
              pageVM.imegeURL = "/uploads/" + response.data.titleImage;
              jQuery("input[type=file]").val("");
            }
            pageVM.socialMediaList = response.data.contactSocialMedia || [];
            pageVM.faqQuestionAnswersList =
              response.data.faqQuestionAnswers || [];
            pageVM.sliderImagesList = response.data.homeSlider || [];
            pageVM.galleryMediaList = response.data.galleryMedia || [];
            pageVM.campaignUrl = pageVM.pageDetails.homeBanner1CampaignUrl;
            if (response.data.homeCampaignBanners) {
              jQuery("#homeCampaignBanners .froala-view").html(
                response.data.homeCampaignBanners
              );
            }
            if (response.data.homeInfoGraphicsBanner) {
              jQuery("#homeInfoGraphicsBanner .froala-view").html(
                response.data.homeInfoGraphicsBanner
              );
            }
            if (response.data.homeBanner1) {
              jQuery("#homeBanner1 .froala-view").html(
                response.data.homeBanner1
              );
            }
            if (response.data.homeBanner1CampaignUrl) {
              pageVM.campaignUrl = $sce.trustAsHtml(
                response.data.homeBanner1CampaignUrl
              );
            }
            if (response.data.homeBanner2) {
              jQuery("#homeBanner2 .froala-view").html(
                response.data.homeBanner2
              );
            }
            if (response.data.homeBanner3) {
              jQuery("#homeBanner3 .froala-view").html(
                response.data.homeBanner3
              );
            }
            if (response.data.contactHeadOffice) {
              jQuery("#contactHeadOffice .froala-view").html(
                response.data.contactHeadOffice
              );
            }
            if (response.data.contactGetInTouch) {
              jQuery("#contactGetInTouch .froala-view").html(
                response.data.contactGetInTouch
              );
            }
          } else if ($state.current.name == "home") {
            pageVM.pageData = response.data;
            if (pageVM.pageData.homeCampaignBanners) {
              pageVM.pageData.homeCampaignBanners = $sce.trustAsHtml(
                pageVM.pageData.homeCampaignBanners
              );
            }
            if (pageVM.pageData.homeInfoGraphicsBanner) {
              pageVM.pageData.homeInfoGraphicsBanner = $sce.trustAsHtml(
                pageVM.pageData.homeInfoGraphicsBanner
              );
            }
            if (pageVM.pageData.homeBanner1) {
              pageVM.pageData.homeBanner1 = $sce.trustAsHtml(
                pageVM.pageData.homeBanner1
              );
            }
            if (pageVM.pageData.homeBanner1CampaignUrl) {
              pageVM.campaignUrl = $sce.trustAsHtml(
                pageVM.pageData.homeBanner1CampaignUrl
              );
            }
            if (pageVM.pageData.homeBanner2) {
              pageVM.pageData.homeBanner2 = $sce.trustAsHtml(
                pageVM.pageData.homeBanner2
              );
            }
            if (pageVM.pageData.homeBanner3) {
              pageVM.pageData.homeBanner3 = $sce.trustAsHtml(
                pageVM.pageData.homeBanner3
              );
            }
            if (pageVM.pageData.contactHeadOffice) {
              pageVM.pageData.contactHeadOffice = $sce.trustAsHtml(
                pageVM.pageData.contactHeadOffice
              );
            }
            if (pageVM.pageData.contactGetInTouch) {
              pageVM.pageData.contactGetInTouch = $sce.trustAsHtml(
                pageVM.pageData.contactGetInTouch
              );
            }
          } else if ($state.current.name == "faq") {
            pageVM.pageData = response.data;
            if (pageVM.pageData.faqQuestionAnswers) {
              pageVM.faqQuestionAnswersList =
                pageVM.pageData.faqQuestionAnswers;
            }
          } else if ($state.current.name == "gallery") {
            pageVM.pageData = response.data;
            if (pageVM.pageData.galleryMedia) {
              pageVM.galleryMediaList = pageVM.pageData.galleryMedia;
              if (
                pageVM.pageData.galleryMedia &&
                pageVM.pageData.galleryMedia.length
              ) {
                pageVM.galleryMediaList.map(obj => {
                  if (typeof obj == "object" && obj.type == "video") {
                    return (obj.file = $sce.trustAsResourceUrl(obj.file));
                  }
                });
                $sce.trustAsResourceUrl(file);
              }
            }
          } else {
            pageVM.pageData = response.data;
          }
        });
    }
    $scope.navigateToDonateUrl = function (url) {
      $window.location.href = url;
    };
    function savePageContentByName(isValid) {
      if (isValid) {
        var lang = pageVM.browserLanguage;
        pageVM.pageDetails.language = lang;
        pageVM.pageDetails.pageName = pageVM.pageName;
        pageVM.pageDetails.homeCampaignBanners = jQuery(
          "#homeCampaignBanners .froala-view"
        ).html();
        pageVM.pageDetails.homeInfoGraphicsBanner = jQuery(
          "#homeInfoGraphicsBanner .froala-view"
        ).html();
        pageVM.pageDetails.homeBanner1 = jQuery(
          "#homeBanner1 .froala-view"
        ).html();
        pageVM.pageDetails.homeBanner2 = jQuery(
          "#homeBanner2 .froala-view"
        ).html();
        pageVM.pageDetails.homeBanner3 = jQuery(
          "#homeBanner3 .froala-view"
        ).html();
        if (typeof pageVM.campaignUrl === 'object') {
          pageVM.campaignUrl = undefined;
        }
        pageVM.pageDetails.campaignUrl = pageVM.campaignUrl;
        pageVM.pageDetails.contactHeadOffice = jQuery(
          "#contactHeadOffice .froala-view"
        ).html();
        pageVM.pageDetails.contactGetInTouch = jQuery(
          "#contactGetInTouch .froala-view"
        ).html();

        if (pageVM.faqQuestionAnswersList.length > 0) {
          pageVM.pageDetails.faqQuestionAnswers = pageVM.faqQuestionAnswersList;
        }
        if (pageVM.socialMediaList.length > 0) {
          pageVM.pageDetails.contactSocialMedia = pageVM.socialMediaList;
        }
        if (pageVM.sliderImagesList.length > 0) {
          pageVM.pageDetails.homeSlider = pageVM.sliderImagesList;
        }
        if (pageVM.galleryMediaList.length > 0) {
          pageVM.pageDetails.galleryMedia = pageVM.galleryMediaList;
        }
        if (pageVM.pageDetails.file) {
          multipartForm
            .post("/upload", pageVM.pageDetails.file)
            .then(function (res) {
              if (res) {
                pageVM.pageDetails.titleImage = res.data.name;
                pageContentService
                  .savePageContentByName(pageVM.pageDetails)
                  .then(function (response) {
                    if (response.status == 200) {
                      pageVM.resetForm();
                      swal({
                        title: $translate.instant(response.data),
                        position: "center-center",
                        type: "success",
                        allowOutsideClick: false
                      });
                    } else {

                      swal({
                        title: "Failed to save",
                        position: "center-center",
                        type: "error",
                        allowOutsideClick: false
                      });
                    }
                  });
              }
            });
        } else {
          pageContentService
            .savePageContentByName(pageVM.pageDetails)
            .then(function (response) {
              if (response.status == 200) {
                pageVM.resetForm();
                swal({
                  title: $translate.instant(response.data),
                  position: "center-center",
                  type: "success",
                  allowOutsideClick: false
                });
              } else {
                if (response.status === 203) {
                  swal({
                    title: $translate.instant(response.data),
                    position: 'center-center',
                    type: 'error',
                    allowOutsideClick: false,
                  });

                } else {
                  swal({
                    title: "Failed to save",
                    position: "center-center",
                    type: "error",
                    allowOutsideClick: false
                  });
                }
              }
            });
        }
      }
    }

    function addSocialMedia() {
      if (
        pageVM.socialMedia.socialMedia != null &&
        pageVM.socialMedia.link != null
      ) {
        pageVM.socialMediaList.push(pageVM.socialMedia);
        pageVM.socialMedia = {};
      }
    }

    function deleteSocialMedia(idx) {
      if (idx != null) {
        pageVM.socialMediaList.splice(idx, 1);
      }
    }

    function addQuestionAnswers() {
      if (
        pageVM.faqQuestionAnswers.question != null &&
        pageVM.faqQuestionAnswers.answer != null
      ) {
        pageVM.faqQuestionAnswersList.push(pageVM.faqQuestionAnswers);
        pageVM.faqQuestionAnswers = {};
      }
    }

    function deleteQuestionAnswers(idx) {
      if (idx != null) {
        pageVM.faqQuestionAnswersList.splice(idx, 1);
      }
    }

    function addSlider(isValid) {
      if (isValid) {
        //upload slider image
        multipartForm
          .post("/upload", pageVM.homeSlider.file)
          .then(function (res) {
            pageVM.homeSlider.file = res.data.name;
            pageVM.sliderImagesList.push(angular.extend({}, pageVM.homeSlider));
            pageVM.homeSlider = {};
          });
      }
    }

    function deleteSlider(idx) {
      if (idx != null) {
        pageVM.sliderImagesList.splice(idx, 1);
      }
    }

    function addMedia(isValid) {
      if (isValid) {
        if ($scope.mediaType == "PHOTO") {
          var pic = ["png", "jpg", "jpeg", "JPG"];
          var movie = ["mp4", "avi", "mwv", "mov"];
          //upload gallery media
          multipartForm
            .post("/upload", pageVM.galleryMedia.file)
            .then(function (res) {
              pageVM.galleryMedia.file = res.data.name;
              var fileExtension = res.data.name.split(".")[
                res.data.name.split(".").length - 1
              ];
              if (pic.includes(fileExtension) === true) {
                pageVM.galleryMedia.type = "photo";
              } else if (movie.includes(fileExtension) === true) {
                pageVM.galleryMedia.type = "video";
              } else {
                swal({
                  title: "Failed to save",
                  position: "center-center",
                  type: "error",
                  allowOutsideClick: false
                });
                pageVM.galleryMedia = {};
                return true;
              }
              pageVM.galleryMediaList.push(
                angular.extend({}, pageVM.galleryMedia)
              );
              pageVM.galleryMedia = {};
            });
        }
        if ($scope.mediaType == "VIDEO") {
          pageVM.galleryMedia.type = "video";
          pageVM.galleryMediaList.push(angular.extend({}, pageVM.galleryMedia));
          pageVM.galleryMedia = {};
        }
      }
    }

    function deleteMedia(idx) {
      if (idx != null) {
        pageVM.galleryMediaList.splice(idx, 1);
      }
    }

    function filterGallery(mediaType) {
      if (mediaType) {
        pageVM.galleryMediaList = _.filter(pageVM.pageData.galleryMedia, {
          type: mediaType
        });
      }
    }

    function resetForm() {
      pageVM.pageName = null;
      pageVM.pageDetails = {};
      pageVM.socialMedia = {};
      pageVM.socialMediaList = [];
      pageVM.faqQuestionAnswers = {};
      pageVM.faqQuestionAnswersList = [];
      pageVM.homeSlider = {};
      pageVM.sliderImagesList = [];
      pageVM.editRow = false;
      pageVM.volunteerDetails = {};
      pageVM.volunterLanguageList = [];
      pageVM.file = null;
      pageVM.cv = null;
      jQuery("input[type=file]").val("");
    }

    //menu and slider setting for Home page
    var url = $location.url();
    var arr = url.split("/");
    var pageUrl = arr[arr.length - 1];
    if (pageUrl == "home" || pageUrl == "FRN" || pageUrl == "ARB" || pageUrl == "ENG") {
      jQuery(".grop-header_area").css({ position: "absolute", top: "-45px" });
      jQuery(".customSlider").css("margin-top", "45px");
      jQuery(".grop-header_navigations.grop-header_sticky").css(
        "background",
        "none"
      );
      jQuery("#grop-mainmenu").addClass("whiteMenu");
    } else {
      jQuery("#grop-mainmenu").removeClass("whiteMenu");
    }

    jQuery(window).resize(function () {
      //set Slider and Yellow bar according to window size
      let screenHeight = jQuery(window).height();
      if (screenHeight > 350)
        $scope.screenHeight = {
          height: Math.round(screenHeight - 45 - 80) + "px !important"
        };
    });
    if (pageVM.browserLanguage !== "ARB") {
      jQuery(document).ready(function ($) {
        //set Slider and Yellow bar according to window size
        let screenHeight = jQuery(window).height();
        if (screenHeight > 350)
          $scope.screenHeight = {
            height: Math.round(screenHeight - 45 - 80) + "px !important"
          };
        $("#commentform").validate({
          rules: {
            author: { required: true, minlength: 2 },
            email: { required: true, email: true },
            comment: { required: true, minlength: 10 }
          }
        });
        $("#FastDonateBtnShowHide").on("click", function () {
          FastDonateBtnShowHideEvent();
        });
        $("#hidenshowChat").on("click", function () {
          ChatBtnShowHideEvent();
        });
        $.fn.fadeSlideRight = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-right": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideLeft = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-right": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideRightEn = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-left": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideLeftEn = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-left": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        jQuery("#donateButtonArrow").fadeSlideLeftEn("0px", 250);
        jQuery("#donateButton").hide(250);
        setTimeout(function () {
          if (jQuery("#tabData").css("marginLeft") != "-500px") {
            jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 0);
            jQuery("#donateButtonArrow").css("transform", "unset");
            jQuery("#donateButtonArrow").css("border-radius", "0px 13px 13px 0px");
            jQuery("#donateButton").show(250);
            jQuery("#tabData").css("z-index", "1");
            //fadeSlideRightEn('42px');
            jQuery("#tabData").fadeSlideLeftEn("-500px", 350);
          } else {
            jQuery("#donateButtonArrow").fadeSlideLeftEn("0px", 250);
            jQuery("#donateButtonArrow").css("transform", "scaleX(-1)");
            jQuery("#donateButtonArrow").css("border-radius", "13px 0px 0px 13px");
            jQuery("#donateButton").hide(0);
            jQuery("#tabData").css("z-index", "3");
            jQuery("#tabData").fadeSlideRightEn("0px", 200);
          }
        }, 1000);

        function FastDonateBtnShowHideEvent() {

          if (jQuery("#tabData").css("marginLeft") != "-500px") {
            jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 250);
            jQuery("#donateButtonArrow").css("transform", "unset");
            jQuery("#donateButtonArrow").css("border-radius", "0px 13px 13px 0px");
            jQuery("#donateButton").show(250);
            jQuery("#tabData").css("z-index", "1");
            //fadeSlideRightEn('42px');
            jQuery("#tabData").fadeSlideLeftEn("-500px", 350);
          } else {
            jQuery("#donateButtonArrow").fadeSlideLeftEn("0px", 250);
            jQuery("#donateButtonArrow").css("transform", "scaleX(-1)");
            jQuery("#donateButtonArrow").css("border-radius", "13px 0px 0px 13px");
            jQuery("#donateButton").hide(0);
            jQuery("#tabData").css("z-index", "3");
            jQuery("#tabData").fadeSlideRightEn("0px", 200);
          }
        }

        $(".chatArea").slideToggle();

        function ChatBtnShowHideEvent() {
          $(".chatArea").slideToggle();
        }
      });
    }

    /* For Arabic */

    if (pageVM.browserLanguage === "ARB") {
      jQuery(document).ready(function ($) {
        //set Slider and Yellow bar according to window size
        let screenHeight = jQuery(window).height();
        if (screenHeight > 350)
          $scope.screenHeight = {
            height: Math.round(screenHeight - 45 - 80) + "px !important"
          };
        $("#commentform").validate({
          rules: {
            author: { required: true, minlength: 2 },
            email: { required: true, email: true },
            comment: { required: true, minlength: 10 }
          }
        });
        $("#FastDonateBtnShowHide").on("click", function () {
          FastDonateBtnShowHideEvent();
        });
        $("#hidenshowChat").on("click", function () {
          ChatBtnShowHideEvent();
        });
        $.fn.fadeSlideLeft = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-left": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideRight = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-left": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideLeftEn = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-right": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        $.fn.fadeSlideRightEn = function (margin, speed, fn) {
          return $(this).animate(
            {
              "margin-right": margin
            },
            speed || 400,
            function () {
              $.isFunction(fn) && fn.call(this);
            }
          );
        };
        jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 250);
        jQuery("#donateButton").hide(250);
        setTimeout(function () {
          FastDonateBtnShowHideEvent();
          //   if (jQuery("#tabData").css("marginRight") != "0px") {
          //     jQuery("#donateButtonArrow").fadeSlideLeftEn("0px", 0);
          //     jQuery("#donateButton").show(250);
          //     jQuery("#tabData").css("z-index", "1");
          //     //fadeSlideRightEn('42px');
          //     jQuery("#tabData").fadeSlideRightEn("0px", 350);
          //   } else {
          //     jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 250);
          //     jQuery("#donateButton").hide(0);
          //     jQuery("#tabData").css("z-index", "3");
          //     // fadeSlideRightEn('42px');
          //     // jQuery("#tabData").fadeSlideLeftEn("0px", 0);
          //     jQuery("#tabData").fadeSlideRightEn("0px", 350);
          //   }
        }, 1000);

        function FastDonateBtnShowHideEvent() {

          if (jQuery("#tabData").css("marginRight") != "-500px") {
            jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 250);
            jQuery("#donateButtonArrow").css("transform", "scaleX(-1)");
            jQuery("#donateButtonArrow").css("border-radius", "0px 13px 13px 0px");
            jQuery("#donateButton").show(250);
            jQuery("#tabData").css("z-index", "1");
            //fadeSlideRightEn('42px');
            jQuery("#tabData").fadeSlideRightEn("-500px", 350);
          } else {
            jQuery("#donateButtonArrow").fadeSlideRightEn("0px", 250);
            jQuery("#donateButtonArrow").css("transform", "scaleX(1)");
            jQuery("#donateButtonArrow").css("border-radius", "13px 0px 0px 13px");
            jQuery("#donateButton").hide(0);
            jQuery("#tabData").css("z-index", "3");
            jQuery("#tabData").fadeSlideLeftEn("0px", 200);
          }
        }
        $(".chatArea").slideToggle();

        function ChatBtnShowHideEvent() {
          // $(".chatArea").slideToggle();
        }
      });
    }

    //FAST DONATION START
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

    jQuery(".nav-tabs li").click(function (e) {
      // var tab = jQuery('.nav-tabs li.active')[0].innerText.trim();
      // if (tab.toLowerCase() == 'projects') {
      //     pageVM.selectedProject = null;
      //     jQuery('#projectCalculator').html('');
      // }
      // else if (tab.toLowerCase() == 'islamic payments') {
      //     pageVM.selectedReligiousPayment = null;
      //     jQuery('#religiousPaymentCalculator').html('');
      // }
      // else if (tab.toLowerCase() == 'orphans') {
      // }
      // else if (tab.toLowerCase() == 'sadaqa') {
      //     pageVM.selectedSadaqa = null;
      //     jQuery('#sadaqaCalculator').html('');
      // }
    });

    //********* SADQA START *********/

    $scope.selectedCurrencySymbol = JSON.parse(
      sessionStorage.getItem("currency")
    ).symbol;

    $scope.sadaqahCountArray = [];

    function getActiveSadaqas() {
      if (pageVM.browserLanguage == "ARB") {
        sadaqa = "الصدقة";
      } else if (pageVM.browserLanguage == "FRN") {
        sadaqa = "Sadaqa";
      } else {
        sadaqa = "Sadaqah";
      }
      programTypeService.getProgramType(sadaqa).then(function (res) {
        if (res.data && res.data.length) {
          pageVM.programType = res.data[0];
          var programTypeId = pageVM.programType._id;
          sadaqaService.getSadaqas(programTypeId).then(function (res) {
            pageVM.Sadaqas = _.filter(res.data, function (e) {
              return e.isActive == true;
            });
            return res;
          });
        }
      });
    }

    $scope.getFixedAmount = function () {
      $scope.totalAmount = undefined;
      if ($scope.selectedCategory.value === "other") {
        $scope.allowTextBoxForRPField = true;
        $scope.checkBoxNotChecked = false;
        return;
      }
      $scope.allowTextBoxForRPField = false;
      $scope.checkBoxNotChecked = true;
      if ($scope.selectedCategory.isFixedAmount) {
        var obj = new Object();
        obj.currency = JSON.parse(sessionStorage.getItem("currency"));
        if (obj.currency.title == "USD") {
          $scope.amount = Math.round($scope.selectedCategory.fixedAmount).toFixed(2);
        } else {
          $scope.amount = currencyService.currencyConversionFormula(
            obj.currency.rateExchange * $scope.selectedCategory.fixedAmount)
        }
      }
      // else {
      //     $scope.amount = '';
      // }
    };
    $scope.refreshSadaqaField = function () {
      pageVM.selectedDonationDuration = undefined;
      pageVM.sadaqa.amount = null;
    };
    function selectSadqaCalculator() {
      $scope.clearValuesFastDonations();
      let selectedSadaqa = pageVM.selectedSadaqa;
      pageVM.sadaqa.amount = undefined;
      pageVM.sadaqa.totalAmount = undefined;
      $scope.totalAmount = undefined;
      $scope.paymentChargeMessage = undefined;
      $scope.cancellationMessage = undefined;
      $scope.selectedPaymentPlan = undefined;
      getSadqaCalculator(selectedSadaqa);
    }

    function getSadqaCalculator(sadaqaDetail) {
      $scope.sadaqaDetail = sadaqaDetail;
      pageVM.sadaqaCalculator = "";
      $scope.selectedCurrencySymbol = JSON.parse(
        sessionStorage.getItem("currency")
      ).symbol;
      if (sadaqaDetail != undefined) {
        let donationProcess = sadaqaDetail.donationProcess[0];

        if (donationProcess.isRecurring) {
          $scope.selectedPaymentPlan = donationProcess.subscriptionDetail.paymentPlan[0];
          getSadaqahCountValues();

          //NF-I175 (this function is replaced by the sadaqah-component)
          //daily sadaqa calculator
          //setCalculatorForDailySadaqa();
        } else {
          pageVM.subCategories = sadaqaDetail.programSubCategory;
          pageVM.subCategories = pageVM.subCategories.filter(
            sProg => sProg.isActive && sProg.programSubCategoryName !== $translate.instant('OTHER') && sProg.isActive && sProg.programSubCategoryName !== $translate.instant('OTHERS')
          );
          pageVM.subCategories.push({
            _id: "5acb5dd62af4f01c4850afa5",
            value: "other",
            programSubCategoryName: $translate.instant("OTHER")
          });
          if (pageVM.subCategories.length) {
            pageVM.sadaqaCalculator += "<div class='col-md-6 col-xs-12'>";
            // pageVM.sadaqaCalculator += "<div class='form-group' ng-show='checkBoxNotChecked'>";
            pageVM.sadaqaCalculator +=
              " <label >{{ 'HOLY PERSONALITY' | translate}}</label>";
            pageVM.sadaqaCalculator +=
              "<select  class='form-control' ng-model='selectedCategory' ng-change='getFixedAmount()' ng-options='x.programSubCategoryName for x in pageVM.subCategories'>";
            pageVM.sadaqaCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.sadaqaCalculator += "</select>";
            pageVM.sadaqaCalculator += "</div>";
          }
          if (donationProcess.isOtherFieldForRP) {
            var placeholderText;
            if (pageVM.browserLanguage == "ARB") {
              placeholderText = 'يرجى كتابة الشخصية المقدسة';
            } else if (pageVM.browserLanguage == "FRN") {
              placeholderText = "Saisir nom";
            } else {
              placeholderText = "Please type the Holy Personality";
            }
            pageVM.sadaqaCalculator += "<div class='col-md-6 col-xs-12'  ng-if='!checkBoxNotChecked'>";
            pageVM.sadaqaCalculator +=
              "<div>";
            pageVM.sadaqaCalculator +=
              " <label >{{ 'OTHER HOLY PERSONALITY' | translate}}</label>";
            pageVM.sadaqaCalculator +=
              "<input type='text' class='form-control' maxlength='75' data-ng-model='pageVM.otherPersonalityTextBox' placeholder='" +
              placeholderText +
              "' />";
            pageVM.sadaqaCalculator += "</div>";
            pageVM.sadaqaCalculator += "</div>";
            pageVM.sadaqaCalculator += "</div>";
            pageVM.sadaqaCalculator += "</div>";
          }
          // if (donationProcess.isOtherFieldForRP) {
          //     pageVM.sadaqaCalculator += "<div class='col-md-6 col-xs-12' style='height:auto;'>";
          //     pageVM.sadaqaCalculator += "<div class='form-group'>";
          //     pageVM.sadaqaCalculator += "<div class='checkbox'>";
          //     pageVM.sadaqaCalculator += "<label><input style='margin-top:0px' type='checkbox' id='checkBoxForOtherRP' ng-change='setCalForOtherField()' name='minimumAmount'  ng-model='allowTextBoxForRPField'/>{{ 'OTHER HOLY PERSONALITY' | translate}}</label>";
          //     pageVM.sadaqaCalculator += "</div>";
          //     pageVM.sadaqaCalculator += "</div>";
          //     pageVM.sadaqaCalculator += "</div>";
          // }

          pageVM.sadaqaCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.sadaqaCalculator += "<div class='form-group' >";
          pageVM.sadaqaCalculator +=
            " <label >{{ 'AMOUNT' | translate}}</label>";
          pageVM.sadaqaCalculator += " <div class='input-group'>";
          pageVM.sadaqaCalculator +=
            "<div class='input-icon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 0px;'>";
          pageVM.sadaqaCalculator +=
            "<input type='text' min='1' class='form-control' ng-model='totalAmount' ng-keypress='isNumberKey($event)'/>";
          pageVM.sadaqaCalculator +=
            " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          pageVM.sadaqaCalculator += "</div>";
          pageVM.sadaqaCalculator += "</div>";
          pageVM.sadaqaCalculator += "</div>";
          pageVM.sadaqaCalculator += "</div>";
          // action buttons
          pageVM.sadaqaCalculator +=
            `<div class='col-md-12 col-xs-12 centered'  ng-if='pageVM.browserLanguage !== "ARB"'>`;
          pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
          pageVM.sadaqaCalculator +=
            "        <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.sadaqaCalculator += "    </div>";
          pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
          pageVM.sadaqaCalculator +=
            "        <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.sadaqaCalculator += "    </div>";
          pageVM.sadaqaCalculator += "</div>";

          pageVM.sadaqaCalculator +=
            `<div class='col-md-12 col-xs-12 centered'  ng-if='pageVM.browserLanguage === "ARB"'>`;
          pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
          pageVM.sadaqaCalculator +=
            "        <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.sadaqaCalculator += "    </div>";
          pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
          pageVM.sadaqaCalculator +=
            "        <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.sadaqaCalculator += "    </div>";
          pageVM.sadaqaCalculator += "</div>";
        }
      }
      let calculator = $compile(pageVM.sadaqaCalculator)($scope);
      angular
        .element(document.getElementById("sadaqaCalculator"))
        .html("")
        .append(calculator);
    }

    function setCalculatorForDailySadaqa() {
      let language = pageVM.browserLanguage;
      let donationProcess = $scope.sadaqaDetail.donationProcess[0];
      pageVM.sadaqaCalculator += "<div class='col-md-6 col-xs-12'>";
      pageVM.sadaqaCalculator += "<div class='form-group'>";
      pageVM.sadaqaCalculator +=
        " <label >{{ 'PAYMENT METHOD' | translate}}</label>";
      // pageVM.sadaqaCalculator +=
      //   "<select  class='form-control' ng-model='selectedRecurringType' ng-change='refreshSadaqaField()'>";
      // pageVM.sadaqaCalculator +=
      //   "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      // pageVM.sadaqaCalculator +=
      //   "<option ng-value='false' ng-model='oneTime'>{{'ONETIME' | translate}}</option>";
      // pageVM.sadaqaCalculator +=
      //   "<option ng-value='true' >{{'RECURRING' | translate}}</option>";
      // pageVM.sadaqaCalculator += "</select>";
      pageVM.sadaqaCalculator += "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";

      pageVM.donationDuration = donationProcess.donationDuration;
      pageVM.sadaqaCalculator +=
        "<div class='col-md-6 col-xs-12' ng-if='true'>";
      pageVM.sadaqaCalculator += "<div class='form-group' >";
      pageVM.sadaqaCalculator += " <label >{{ 'DURATION' | translate}}</label>";
      pageVM.sadaqaCalculator +=
        "<select class='form-control'  ng-change = 'dateCalculate();changeSadaqaAmount()' ng-model='pageVM.selectedDonationDuration' ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
      pageVM.sadaqaCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.sadaqaCalculator += "</select>";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";

      pageVM.sadaqaCalculator +=
        "<div class='col-md-6 col-xs-12' ng-if='true'>";
      pageVM.sadaqaCalculator += "<div class='form-group' >";
      pageVM.sadaqaCalculator += " <label >{{ 'AMOUNT' | translate}}</label>";
      pageVM.sadaqaCalculator +=
        "<select class='form-control' ng-model='pageVM.sadaqa.amount' ng-change='changeSadaqaAmount()' >";
      pageVM.sadaqaCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.sadaqaCalculator +=
        "<option ng-value='30'>{{selectedCurrencySymbol}} 30</option>";
      pageVM.sadaqaCalculator +=
        "<option ng-value='60'>{{selectedCurrencySymbol}} 60</option>";
      pageVM.sadaqaCalculator +=
        "<option ng-value='90'>{{selectedCurrencySymbol}} 90</option>";
      pageVM.sadaqaCalculator += "</select>";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";

      // pageVM.sadaqaCalculator +=
      //   "<div class='col-md-12 col-xs-12' ng-if='selectedRecurringType && date'>";
      // pageVM.sadaqaCalculator += "<div class='form-group'>";
      // if (language == "ARB") {
      //   pageVM.sadaqaCalculator +=
      //     " <label><span class='commentTxt'>يرجى ملاحظة أنه سيتم خصم {{selectedCurrencySymbol}}{{pageVM.sadaqa.amount || '0'}} شهريا حتى {{date}}</span></label>";
      // } else if (language == "FRN") {
      //   pageVM.sadaqaCalculator +=
      //     " <label><span class='commentTxt'>Veuillez noter que les {{selectedCurrencySymbol}}{{pageVM.sadaqa.amount || '0'}} seront déduit de votre compte mensuellement jusqu'au {{date | date:'dd-MM-yyyy'}}.</span></label>";
      // } else {
      //   pageVM.sadaqaCalculator +=
      //     " <label><span class='commentTxt'>Please note that {{selectedCurrencySymbol}}{{pageVM.sadaqa.amount || '0'}} will be deducted from your account monthly till {{date | date:'dd-MM-yyyy'}}.</span></label>";
      // }
      // pageVM.sadaqaCalculator += "</div>";
      // pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator +=
        "<div class='col-md-6 col-xs-12'  ng-if='!selectedRecurringType'>";
      pageVM.sadaqaCalculator += "<div class='form-group'>";
      pageVM.sadaqaCalculator += " <label >{{ 'TOTAL AMOUNT' | translate}}</label>";
      pageVM.sadaqaCalculator += " <div class='input-group'>";
      pageVM.sadaqaCalculator += "<div class='input-icon' style=''>";
      pageVM.sadaqaCalculator +=
        "<input type='text' min='1'  ng-keypress='isNumberKey($event)'  class='form-control' disabled='true' data-ng-model='pageVM.sadaqa.totalAmount' />";
      pageVM.sadaqaCalculator +=
        " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";
      pageVM.sadaqaCalculator += "</div>";

      pageVM.sadaqaCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
      pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
      pageVM.sadaqaCalculator +=
        "        <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.sadaqaCalculator += "    </div>";
      pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
      pageVM.sadaqaCalculator +=
        "        <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.sadaqaCalculator += "    </div>";
      pageVM.sadaqaCalculator += "</div>";

      pageVM.sadaqaCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
      pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
      pageVM.sadaqaCalculator +=
        "        <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.sadaqaCalculator += "    </div>";
      pageVM.sadaqaCalculator += "    <div class='col-md-4 col-xs-12'>";
      pageVM.sadaqaCalculator +=
        "        <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.sadaqaCalculator += "    </div>";
      pageVM.sadaqaCalculator += "</div>";
    }
    $scope.dateCalculate = function () {
      let todayDate = new Date();
      if (
        pageVM.selectedDonationDuration &&
        pageVM.selectedDonationDuration.noOfMonths
      ) {
        // if($scope.amount){
        //     $scope.recurrAmount = $scope.amount/vm.selectedDonationDuration.noOfMonths;
        // }
        $scope.date = new Date(
          todayDate.setMonth(
            todayDate.getMonth() +
            pageVM.selectedDonationDuration.noOfMonths -
            1
          )
        )
          .toISOString()
          .slice(0, 10);
      } else {
        $scope.recurrAmount = Math.round($scope.amount).toFixed(2);
      }
    };
    $scope.setCalForOtherField = function () {
      $scope.selectedCategory = undefined;
      pageVM.otherPersonalityTextBox = undefined;
      if (checkBoxForOtherRP.checked) {
        $scope.checkBoxNotChecked = false;
      } else {
        $scope.checkBoxNotChecked = true;
      }
      $scope.amount = "";
    };

    function getSadaqahCountValues() {

      if ($scope.sadaqaDetail) {
        let min = Math.round($scope.sadaqaDetail.donationProcess[0].countMin);
        let max = Math.round($scope.sadaqaDetail.donationProcess[0].countMax);
        var interval = Math.round($scope.sadaqaDetail.donationProcess[0].interval);
        let arry = [{}];
        for (let i = min; i <= max; i += interval) {
          arry[i - 1] = i;
        }

        $scope.sadaqahCountArray = arry;


      }
    }

    //********* SADQA END *********/

    //********* PROJECT START *********/

    $scope.selectedCurrencySymbol = JSON.parse(
      sessionStorage.getItem("currency")
    ).symbol;

    function getActiveProjects() {
      if (pageVM.browserLanguage == "ARB") {
        var project = "مشروع";
      } else if (pageVM.browserLanguage == "FRN") {
        var project = "Projets";
      } else {
        var project = "Projects";
      }

      programTypeService.getProgramType(project).then(function (res) {
        pageVM.programType = res.data[0];
        var programTypeId = pageVM.programType._id;
        projectService.getProjects(programTypeId).then(function (res) {
          pageVM.projects = _.filter(res.data, function (e) {
            return e.isActive == true;
          });
          return res;
        });
      });
    }

    function checkSubCategory() {
      pageVM.isAmount = undefined;
      if (!pageVM.selectedCategory) {
        $scope.amountValue = null;
        $scope.totalAmount = null;
        $scope.selectedCount = null;
      }
      let selectedCategoryOnChange = pageVM.selectedCategory;
      $scope.subCategoryName = pageVM.selectedCategory.programSubCategoryName;
      if (
        selectedCategoryOnChange.programSubCategoryName == "Wheel Chair" ||
        selectedCategoryOnChange.programSubCategoryName == "كرسي متحرك"
      ) {
        jQuery("#amountTextBox").attr("readonly", true);
        jQuery("#amountTextBox").val(pageVM.amount);
        healthCareWithWheelChair = true;
        $scope.amountValue = pageVM.amount;
      } else if (
        selectedCategoryOnChange.programSubCategoryName == "General Fund" ||
        selectedCategoryOnChange.programSubCategoryName == "الصندوق العام"
      ) {
        // document.getElementById("amountLabel").innerHTML = "Amount *";
        // document.getElementById("amountTextBox").removeAttribute("readonly");
        // document.getElementById("amountTextBox").value = 0;
        healthCareWithGeneralFund = true;
        $scope.amountValue = "0";
      } else {
        healthCareWithWheelChair = false;
        healthCareWithGeneralFund = false;
      }

      //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -- Start SubCategory Amount -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
      let projectDetail = $scope.selectedProjectName;
      let donationProcess = projectDetail.donationProcess[0];
      var subCategoryCalculator = "";
      //if Amount is Fixed
      if (pageVM.selectedCategory.isFixedAmount) {
        pageVM.isAmount = pageVM.selectedCategory.isFixedAmount;
        var obj = new Object();
        obj.currency = JSON.parse(sessionStorage.getItem("currency"));
        if (obj.currency.title == "USD") {
          let fixedAmount = Math.round(pageVM.selectedCategory.fixedAmount).toFixed(2);
          $scope.amountValue = Math.round(fixedAmount).toFixed(2);
        } else {
          let amount =
            obj.currency.rateExchange * pageVM.selectedCategory.fixedAmount;
          $scope.amountValue = currencyService.currencyConversionFormula(
            amount
          );
        }

        pageVM.amount = Math.round(donationProcess.amount).toFixed(2);
        pageVM.isAmount = Math.round($scope.amountValue).toFixed(2);
        if (donationProcess.isRecurring) {
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator +=
            " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
          subCategoryCalculator +=
            // "<select  class='form-control'  ng-model='pageVM.selectedRecurring' data-ng-change='checkPaymentMethod(pageVM.selectedRecurring);countChangeProj();'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
            "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";

          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
        }
        const projName = $translate.instant(
          "Higher Education Loans".toUpperCase()
        );
        if (
          donationProcess.isRecurring &&
          projName != projectDetail.programName
        ) {
          subCategoryCalculator = donationProcess.donationDuration;
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group' >";
          subCategoryCalculator +=
            " <label >{{ 'DURATION' | translate }}</label>";
          subCategoryCalculator +=
            "<select class='form-control' data-ng-change='durationForOneTimeAndRecurring()' ng-model='pageVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
          subCategoryCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          subCategoryCalculator += "</select>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          // jQuery("#project-calculator").append(pageVM.orphanCalculator);
        }

        subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
        subCategoryCalculator += "<div class='form-group'>";
        subCategoryCalculator +=
          " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
        subCategoryCalculator += " <label id='fixedAmountValue' ></label>";
        subCategoryCalculator += "<div class='input-group'>";
        subCategoryCalculator += "<div class='input-icon'>";
        subCategoryCalculator +=
          "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off'  id='amountTextBox' ng-keyup='countChangeProj()' data-ng-model='amountValue' class='form-control' ng-disabled='pageVM.isAmount' />";
        subCategoryCalculator +=
          "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";

        pageVM.isCount = donationProcess.isCount;
        if (donationProcess.isCount) {
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator += " <label >{{ 'COUNT' | translate }}</label>";

          subCategoryCalculator +=
            "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeProj()'>";
          subCategoryCalculator +=
            "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
          let min = Math.round(donationProcess.countMin);
          let max = Math.round(donationProcess.countMax);
          var interval = Math.round(donationProcess.interval);
          for (let i = min; i <= max; i += interval) {
            subCategoryCalculator +=
              "<option ng-value='" + i + "'>" + i + "</option>";
          }
          subCategoryCalculator += "</select>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
        }

        subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
        subCategoryCalculator += "<div class='form-group'>";
        subCategoryCalculator +=
          " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
        subCategoryCalculator += " <div class='input-group'>";
        subCategoryCalculator += "<div class='input-icon'>";
        subCategoryCalculator +=
          "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
        subCategoryCalculator +=
          " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";

        // subCategoryCalculatorr += "<div class='form-group'>";
        // subCategoryCalculatorr += "<span style='color: green ; font-size: 16px;' ng-show='pageVM.selectedRecurring && totalAmount > 0'>{{pageVM.selectedDonationDuration.donationDurationName == \"Half Yearly\" ? totalAmount/6 : totalAmount/12}}/per month</span>"
        // subCategoryCalculatorr += "</div>";
        // subCategoryCalculator += "<span ng-show='donationProcess.isRecurring'>{{$scope.amountValue}}</span>";

        subCategoryCalculator +=
          "<div class='col-md-12 col-xs-12' ng-if='showComment'>";
        subCategoryCalculator += "<div class='form-group'  style=''>";
        subCategoryCalculator +=
          " <label><span class='commentTxt'>{{projectComment}}</span></label>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";

        subCategoryCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "</div>";

        subCategoryCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "</div>";
      } else {
        if (donationProcess.isRecurring) {
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator +=
            " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
          // subCategoryCalculator +=
          //   "<select  class='form-control' ng-change='durationForRecurring();countChangeProj();' ng-model='pageVM.selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
        }
        if (donationProcess.isRecurring) {
          subCategoryCalculator = donationProcess.donationDuration;
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator +=
            "<div class='form-group' data-ng-show='pageVM.selectedRecurring==true'>";
          subCategoryCalculator +=
            " <label >{{ 'DURATION' | translate }}</label>";
          subCategoryCalculator +=
            "<select class='form-control' ng-model='pageVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
          subCategoryCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          subCategoryCalculator += "</select>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          // jQuery("#project-calculator").append(pageVM.orphanCalculator);
        }
        pageVM.isCount = donationProcess.isCount;
        if (donationProcess.isCount) {
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator +=
            " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
          subCategoryCalculator += " <label id='fixedAmountValue' ></label>";
          subCategoryCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off' id='amountTextBox' ng-keyup='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='pageVM.isAmount' />";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";

          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator += " <label >{{ 'COUNT' | translate }}</label>";
          subCategoryCalculator +=
            "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";
          subCategoryCalculator +=
            "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
          let min = Math.round(donationProcess.countMin);
          let max = Math.round(donationProcess.countMax);
          var interval = Math.round(donationProcess.interval);
          for (let i = min; i <= max; i += interval) {
            subCategoryCalculator +=
              "      <option ng-value='" + i + "'>" + i + "</option>";
          }
          subCategoryCalculator += "</select>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";

          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator +=
            " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
          subCategoryCalculator += " <div class='input-group'>";
          subCategoryCalculator += "<div class='input-icon'>";
          subCategoryCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'/>";
          subCategoryCalculator +=
            " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
        } else {
          subCategoryCalculator += "<div class='col-md-6 col-xs-12'>";
          subCategoryCalculator += "<div class='form-group'>";
          subCategoryCalculator +=
            " <label >{{ 'AMOUNT' | translate }}</label>";
          subCategoryCalculator += " <div class='input-group'>";
          subCategoryCalculator += "<div class='input-icon'>";
          subCategoryCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
          subCategoryCalculator +=
            "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
          subCategoryCalculator += "</div>";
        }

        subCategoryCalculator +=
          "<div class='col-md-12 col-xs-12' ng-if='showComment'>";
        subCategoryCalculator += "<div class='form-group' style=''>";
        subCategoryCalculator +=
          " <label><span class='commentTxt'>Note: {{projectComment}}</span></label>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += "</div>";

        subCategoryCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "</div>";
        subCategoryCalculator += `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "   <div class='col-md-4 col-xs-12'>";
        subCategoryCalculator +=
          "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
        subCategoryCalculator += "   </div>";
        subCategoryCalculator += "</div>";
      }

      $scope.selectedCount = undefined;

      //pageVM.orphanCalculator += subCategoryCalculator;
      let calculator = $compile(subCategoryCalculator)($scope);
      angular
        .element(document.getElementById("subCatCalculator"))
        .html("")
        .append(calculator);

      //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% -- End SubCategory Amount -- %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    }

    $scope.checkPaymentMethod = function (paymentMethod) {
      // if(paymentMethod !== false && !paymentMethod) {
      //     if(pageVM.selectedDonationDuration) pageVM.selectedDonationDuration = null;
      //     $scope.amountValue = null;
      //     $scope.selectedCount = null;
      //     $scope.totalAmount = null;
      //     $scope.commentTxt = '';
      //     return;
      // }
      if (!paymentMethod) {
        if (pageVM.browserLanguage == "ARB") {
          $scope.paymentMethod = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          $scope.paymentMethod = "Une fois";
        } else {
          $scope.paymentMethod = "One Time";
        }
      } else if (paymentMethod) {
        if (pageVM.browserLanguage == "ARB") {
          $scope.paymentMethod = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          $scope.paymentMethod = "Périodique";
        } else {
          $scope.paymentMethod = "Recurring";
        }
      } else {
        $scope.paymentMethod = null;
      }
    };

    function showComments() {
      var obj = new Object();
      var currencySymbol = JSON.parse(sessionStorage.getItem("currency"))
        .symbol;
      if (pageVM.projectDetail) {
        obj.program = pageVM.projectDetail;
      } else {
        obj.program = pageVM.selectedProject;
      }

      if (
        obj &&
        obj.program &&
        obj.program.programName == $translate.instant("HIGHER EDUCATION LOANS")
      ) {
        if (
          $scope.paymentMethod == "Recurring" ||
          $scope.paymentMethod == "Périodique" ||
          $scope.paymentMethod == "متكرر"
        ) {
          $scope.showComment = true;
          $scope.masterPaymentDate = new Date(new Date().setMonth(new Date().getMonth() + 18))
          $scope.phdPaymentDate = new Date(new Date().setMonth(new Date().getMonth() + 24))
          let language = pageVM.browserLanguage;

          if (
            $scope.subCategoryName == "Masters (2 Years)" ||
            $scope.subCategoryName == "الماجستير (2 سنوات)" ||
            $scope.subCategoryName == "Maîtrise (2 Ans)"
          ) {
            if (language == "ARB") {
              $scope.projectComment =
                " يرجى ملاحظة أنه سيتم خصم " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                "  كل ستة أشهرحتى " +
                $filter("date")($scope.masterPaymentDate, "yyyy-MM-dd");
              // + '-' + ($scope.masterPaymentDate.getMonth())
              // + '-' + $scope.masterPaymentDate.getDate()
            } else if (language == "FRN") {
              $scope.projectComment =
                "Veuillez noter que les " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " seront déduit tous les (06) mois jusqu'au " +
                $filter("date")($scope.masterPaymentDate, "dd-MM-yyyy");
              // + $scope.masterPaymentDate.getDate()
              // + '-0' + ($scope.masterPaymentDate.getMonth())
              // + '-' + $scope.masterPaymentDate.getFullYear()
              // + '.';
            } else {
              $scope.projectComment =
                "Please note that " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                "  will be deducted every (06) months until " +
                $filter("date")($scope.masterPaymentDate, "dd-MM-yyyy");
              // + $scope.masterPaymentDate.getDate()
              //     + '-' + ($scope.masterPaymentDate.getMonth())
              //     + '-' + $scope.masterPaymentDate.getFullYear()
              //     + '.';
            }
          } else if (
            $scope.subCategoryName == "PhD (2.5 Years)" ||
            $scope.subCategoryName == "الدكتوراه (2.5 سنة)" ||
            $scope.subCategoryName == "Doctorat (2.5 Ans)"
          ) {
            if (language == "ARB") {
              $scope.projectComment =
                " يرجى ملاحظة أنه سيتم خصم " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " كل ستة أشهرحتى " +
                $filter("date")($scope.phdPaymentDate, "yyyy-MM-dd");
              // + '-' + ($scope.phdPaymentDate.getMonth())
              // + '-' + $scope.phdPaymentDate.getFullYear()
            } else if (language == "FRN") {
              $scope.projectComment =
                "Veuillez noter que les " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " seront déduit tous les (06) mois jusqu'au " +
                $filter("date")($scope.phdPaymentDate, "dd-MM-yyyy");
              // + $scope.phdPaymentDate.getDate()
              //     + '-' + ($scope.phdPaymentDate.getMonth())
              //     + '-' + $scope.phdPaymentDate.getFullYear()
              //     + '.';
            } else {
              $scope.projectComment =
                "Please note that " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                "  will be deducted every (06) months until " +
                $filter("date")($scope.phdPaymentDate, "dd-MM-yyyy");
              // $scope.phdPaymentDate.getDate()
              // + '-0' + ($scope.phdPaymentDate.getMonth())
              // + '-' + $scope.phdPaymentDate.getFullYear()
              // + '.';
            }
          }
        } else {
          $scope.projectComment = "";
        }
      } else if (
        (obj.program && obj.program.programName == "Hawzah Students") ||
        obj.program.programName == "طلاب الحوزة" ||
        obj.program.programName == "Étudiants hawza"
      ) {
        if (
          $scope.paymentMethod == "Recurring" ||
          $scope.paymentMethod == "Périodique" ||
          $scope.paymentMethod == "متكرر"
        ) {
          $scope.showComment = true;
          $scope.halfYearlyDate = new Date(new Date().setMonth(new Date().getMonth() + 5));
          $scope.yearlyDate = new Date(new Date().setMonth(new Date().getMonth() + 11));
          let language = pageVM.browserLanguage;

          if (
            $scope.DurationName == "Half Yearly" ||
            $scope.DurationName == "نصف سنوي" ||
            $scope.DurationName == "Semestriel"
          ) {
            if (language == "ARB") {
              $scope.projectComment =
                " يرجى ملاحظة أنه سيتم خصم " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                "  شهريًا حتى " +
                $filter("date")($scope.halfYearlyDate, "yyyy-MM-dd");
              // + '-' + ($scope.halfYearlyDate.getMonth())
              // + '-' + $scope.halfYearlyDate.getDate()
            } else if (language == "FRN") {
              $scope.projectComment =
                "Veuillez noter que le paiement de " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " sera déduit mensuellement jusqu'au " +
                $filter("date")($scope.halfYearlyDate, "dd-MM-yyyy");

              // + $scope.halfYearlyDate.getDate()
              // + '-' + ($scope.halfYearlyDate.getMonth())
              // + '-' + $scope.halfYearlyDate.getFullYear()
              // + '.';
            } else {
              $scope.projectComment =
                "Please note that " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " will be deducted monthly until " +
                $filter("date")($scope.halfYearlyDate, "dd-MM-yyyy");

              // + $scope.halfYearlyDate.getDate()
              // + '-' + ($scope.halfYearlyDate.getMonth())
              // + '-' + $scope.halfYearlyDate.getFullYear()
              // + '.';
            }
          } else if (
            $scope.DurationName == "Yearly" ||
            $scope.DurationName == "سنوي" ||
            $scope.DurationName == "Annuel"
          ) {
            if (language == "ARB") {
              $scope.projectComment =
                " يرجى ملاحظة أنه سيتم خصم " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                "  شهريًا حتى " +
                $filter("date")($scope.yearlyDate, "yyyy-MM-dd");
              // + '-' + ($scope.yearlyDate.getMonth())
              // + '-' + $scope.yearlyDate.getDate()
            } else if (language == "FRN") {
              $scope.projectComment =
                "Veuillez noter que le paiement de " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " sera déduit mensuellement jusqu'au " +
                $filter("date")($scope.yearlyDate, "dd-MM-yyyy");
              // + $scope.yearlyDate.getDate()
              // + '-' + ($scope.yearlyDate.getMonth())
              // + '-' + $scope.yearlyDate.getFullYear()
              // + '.';
            } else {
              $scope.projectComment =
                "Please note that " +
                currencySymbol +
                $scope.totalAmountPerMonth +
                " will be deducted monthly until " +
                $filter("date")($scope.yearlyDate, "dd-MM-yyyy");
              // + $scope.yearlyDate.getDate()
              // + '-0' + ($scope.yearlyDate.getMonth())
              // + '-' + $scope.yearlyDate.getFullYear()
              // + '.';
            }
          }
        } else {
          $scope.projectComment = "";
        }
      }

      if (
        $scope.projectComment == "" ||
        $scope.projectComment == null ||
        $scope.projectComment == undefined
      ) {
        $scope.showComment = false;
      } else {
        $scope.showComment = true;
      }
    }

    $scope.durationForOneTimeAndRecurring = function () {
      var obj = new Object();
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      if (pageVM.selectedDonationDuration.donationDurationName == "Yearly") {
        $scope.DurationName = "Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount;
        } else {
          $scope.amountValue = currencyService.currencyConversionFormula(
            obj.currency.rateExchange * pageVM.amount
          );
        }
        //$scope.amountValue = pageVM.amount;
      }
      if (
        pageVM.selectedDonationDuration.donationDurationName == "Half Yearly"
      ) {
        $scope.DurationName = "Half Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount / 2;
        } else {
          $scope.amountValue =
            currencyService.currencyConversionFormula(
              obj.currency.rateExchange * pageVM.amount
            ) / 2;
        }
      }

      if (pageVM.selectedRecurring == null) {
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount;
        } else {
          $scope.amountValue = currencyService.currencyConversionFormula(
            obj.currency.rateExchange * pageVM.amount
          );
        }
        $scope.amountValue = pageVM.amount;
      }
      $scope.countChange();
      $scope.countChangeProj();
    };
    $scope.countChangeProj = function () {
      $scope.amountValue = $scope.amountValue || 0;
      if (
        $scope.selectedProjectName.programName ==
        $translate.instant("Higher Education Loans".toUpperCase())
      ) {
        if (
          $scope.subCategoryName == "Masters (2 Years)" ||
          $scope.subCategoryName == "الماجستير (2 سنوات)" ||
          $scope.subCategoryName == "Maîtrise (2 Ans)"
        ) {
          if (
            $scope.paymentMethod == "Recurring" ||
            $scope.paymentMethod == "Périodique" ||
            $scope.paymentMethod == "متكرر"
          ) {
            $scope.totalAmountPerMonth = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              4
            ).toFixed(2);
            $scope.totalAmount = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              4
            ).toFixed(2);
          }
          if (
            $scope.paymentMethod == "One Time" ||
            $scope.paymentMethod == "Une fois" ||
            $scope.paymentMethod == "مرة واحدة"
          ) {
            $scope.totalAmountPerMonth =
              ($scope.selectedCount || 0) * $scope.amountValue;
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
          }
        }
        if (
          $scope.subCategoryName == "PhD (2.5 Years)" ||
          $scope.subCategoryName == "الدكتوراه (2.5 سنة)" ||
          $scope.subCategoryName == "Doctorat (2.5 Ans)"
        ) {
          if (
            $scope.paymentMethod == "Recurring" ||
            $scope.paymentMethod == "Périodique" ||
            $scope.paymentMethod == "متكرر"
          ) {
            $scope.totalAmountPerMonth = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              5
            ).toFixed(2);
            $scope.totalAmount = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              5
            ).toFixed(2);
          }
          if (
            $scope.paymentMethod == "One Time" ||
            $scope.paymentMethod == "Une fois" ||
            $scope.paymentMethod == "مرة واحدة"
          ) {
            $scope.totalAmountPerMonth =
              ($scope.selectedCount || 0) * $scope.amountValue;
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
          }
        }
      } else if (
        $scope.selectedProjectName.programName == "Hawzah Students" ||
        $scope.selectedProjectName.programName == "طلاب الحوزة" ||
        $scope.selectedProjectName.programName == "Étudiants hawza"
      ) {
        if (
          ($scope.paymentMethod == "Recurring" ||
            $scope.paymentMethod == "Périodique" ||
            $scope.paymentMethod == "متكرر") &&
          ($scope.DurationName == "Half Yearly" ||
            $scope.DurationName == "نصف سنوي" ||
            $scope.DurationName == "Semestriel")
        ) {
          $scope.totalAmountPerMonth = Math.round(
            (($scope.selectedCount || 0) * $scope.amountValue) /
            6
          ).toFixed(2);
          $scope.totalAmount = Math.round(
            (($scope.selectedCount || 0) * $scope.amountValue) /
            6
          ).toFixed(2);
        }
        if (
          ($scope.paymentMethod == "One Time" ||
            $scope.paymentMethod == "Une fois" ||
            $scope.paymentMethod == "مرة واحدة") &&
          ($scope.DurationName == "Half Yearly" ||
            $scope.DurationName == "نصف سنوي" ||
            $scope.DurationName == "Semestriel")
        ) {
          $scope.totalAmountPerMonth = (
            Math.round(($scope.selectedCount || 0) * $scope.amountValue) /
            2
          ).toFixed(2);
          $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
        }
        if (
          ($scope.paymentMethod == "One Time" ||
            $scope.paymentMethod == "Une fois" ||
            $scope.paymentMethod == "مرة واحدة") &&
          ($scope.DurationName == "Yearly" ||
            $scope.DurationName == "سنوي" ||
            $scope.DurationName == "Annuel")
        ) {
          $scope.totalAmountPerMonth =
            Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
          $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
        }
        if (
          ($scope.paymentMethod == "Recurring" ||
            $scope.paymentMethod == "Périodique" ||
            $scope.paymentMethod == "متكرر") &&
          ($scope.DurationName == "Yearly" ||
            $scope.DurationName == "سنوي" ||
            $scope.DurationName == "Annuel")
        ) {
          $scope.totalAmountPerMonth = Math.round(
            (($scope.selectedCount || 0) * $scope.amountValue) /
            12
          ).toFixed(2);
          $scope.totalAmount = Math.round(
            (($scope.selectedCount || 0) * $scope.amountValue) /
            12
          ).toFixed(2);
        }
      } else {
        $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
      }
      $scope.totalAmount = isNaN($scope.totalAmount)
        ? "0.00"
        : $scope.totalAmount;
      $scope.totalAmountPerMonth = isNaN($scope.totalAmountPerMonth)
        ? "0.00"
        : $scope.totalAmountPerMonth;
      pageVM.showComments();
    };
    $scope.changeSadaqaAmount = function () {
      let numberOfDays = 30;
      pageVM.sadaqa.totalAmount = numberOfDays * pageVM.sadaqa.amount;
      if (pageVM.sadaqa.totalAmount > 0) {
        let messageCOmmand = $scope.sadaqaDetail.donationProcess[0].subscriptionDetail.paymentChargeMessage.value[pageVM.language];

        $scope.paymentChargeMessage = messageCOmmand.replace("[currency]", $scope.selectedCurrencySymbol).replace("[amount]", pageVM.sadaqa.totalAmount);

        $scope.cancellationMessage = $scope.sadaqaDetail.donationProcess[0].subscriptionDetail.cancellationMessage.value[pageVM.language];

      }
      else {
        $scope.paymentChargeMessage = undefined;
        pageVM.sadaqa.totalAmount = undefined;
        $scope.cancellationMessage = undefined;
      }
    };
    $scope.durationForRecurring = function () {
      if (pageVM.selectedRecurring) {
        $scope.amountValue = 6 * $scope.amountValue;
      } else {
        $scope.amountValue = pageVM.amount;
      }
    };
    $scope.countChangeForNonFixed = function () {
      $scope.totalAmount = (($scope.selectedCount || 0) * ($scope.amountValueForNonFixed || 0)).toFixed(2);
    };

    function selectProjectCalculator() {
      $scope.clearValuesFastDonations();
      $scope.showComment = false;
      $scope.projectComment = "";
      $scope.totalAmount = undefined;
      $scope.amountValue = null;
      let selectedProject = pageVM.selectedProject;
      $scope.selectedProjectName = selectedProject;
      getProjectCalculator(selectedProject);
    }

    function getProjectCalculator(projectDetail) {
      pageVM.orphanCalculator = "";
      if (!!projectDetail) {
        pageVM.subCategories = projectDetail.programSubCategory;

        if (
          pageVM.subCategories != undefined
            ? pageVM.subCategories.length > 0
            : false
        ) {
          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label >{{ 'SUB CATEGORY' | translate}}</label>";
          pageVM.orphanCalculator +=
            "<select  class='form-control' ng-model='pageVM.selectedCategory' ng-change='pageVM.checkSubCategory();countChangeProj();' ng-options='x.programSubCategoryName for x in pageVM.subCategories'>";
          pageVM.orphanCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          pageVM.orphanCalculator += "</select>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";

          pageVM.orphanCalculator += "<div id='subCatCalculator'>";
          pageVM.orphanCalculator += "</div>";

          let calculator = $compile(pageVM.orphanCalculator)($scope);
          angular
            .element(document.getElementById("projectCalculator"))
            .html("")
            .append(calculator);
          return;
        }
        let donationProcess = projectDetail.donationProcess[0];
        //if Amount is Fixed
        if (donationProcess.isAmount) {
          var obj = new Object();
          obj.currency = JSON.parse(sessionStorage.getItem("currency"));
          if (obj.currency.title == "USD") {
            let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
            $scope.amountValue =
              donationProcess.donationDuration.length < 1 ? fixedAmount : 0;
          } else {
            let fixedAmount =
              obj.currency.rateExchange * donationProcess.amount;
            $scope.amountValue =
              donationProcess.donationDuration.length < 1
                ? currencyService.currencyConversionFormula(fixedAmount)
                : 0;
          }

          // pageVM.orphanCalculator += "</select>";
          // pageVM.orphanCalculator += "</div>";
          pageVM.amount = Math.round(donationProcess.amount).toFixed(2);

          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
            pageVM.orphanCalculator +=
              // "<select  class='form-control'  ng-model='pageVM.selectedRecurring' data-ng-change='checkPaymentMethod(pageVM.selectedRecurring);countChangeProj()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
              "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }
          if (
            donationProcess.isRecurring &&
            $translate.instant(projectDetail.programName) !=
            "Higher Education Loans".toUpperCase()
          ) {
            pageVM.donationDuration = donationProcess.donationDuration;
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group' >";
            pageVM.orphanCalculator +=
              " <label >{{ 'DURATION' | translate}}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control'  ng-model='pageVM.selectedDonationDuration'  data-ng-change ='durationForOneTimeAndRecurringProj()' ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
            pageVM.orphanCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            // jQuery("#project-calculator").append(pageVM.orphanCalculator);
          }

          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
          pageVM.orphanCalculator += " <label id='fixedAmountValue' ></label>";
          pageVM.orphanCalculator += "<div class='input-group'>";
          pageVM.orphanCalculator += "<div class='input-icon'>";
          pageVM.orphanCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' id='amountTextBox' ng-keyup='countChangeProj()' data-ng-model='amountValue' class='form-control' readonly ng-disabled='pageVM.isAmount' />";
          pageVM.orphanCalculator +=
            "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";

          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'COUNT' | translate }}</label>";

            pageVM.orphanCalculator +=
              "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeProj()'>";
            pageVM.orphanCalculator +=
              "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.orphanCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }

          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
          pageVM.orphanCalculator += " <div class='input-group'>";
          pageVM.orphanCalculator += "<div class='input-icon'>";
          pageVM.orphanCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'  />";
          pageVM.orphanCalculator +=
            " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator +=
            "<div class='col-md-12 col-xs-12' ng-if='showComment'>";
          pageVM.orphanCalculator += "<div class='form-group' style=''>";
          pageVM.orphanCalculator +=
            " <label><span class='commentTxt'>{{projectComment}}</span></label>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator +=
            `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator +=
            `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "</div>";
        } else {
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
            pageVM.orphanCalculator +=
              "<select  class='form-control' ng-change='durationForRecurring()' ng-model='pageVM.selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }
          if (donationProcess.isRecurring) {
            pageVM.donationDuration = donationProcess.donationDuration;
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator +=
              "<div class='form-group' data-ng-show='pageVM.selectedRecurring==true'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'DURATION' | translate }}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control' ng-model='pageVM.selectedDonationDuration'  ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
            pageVM.orphanCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            // jQuery("#project-calculator").append(pageVM.orphanCalculator);
          }
          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
            pageVM.orphanCalculator +=
              " <label id='fixedAmountValue' ></label>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off'  id='amountTextBox' ng-keyup='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  class='form-control'  />";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'COUNT' | translate }}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";
            pageVM.orphanCalculator +=
              "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.orphanCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'/>";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'AMOUNT' | translate }}</label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)'  data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'/>";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }

          pageVM.orphanCalculator +=
            "<div class='col-md-12 col-xs-12' ng-if='showComment'>";
          pageVM.orphanCalculator += "<div class='form-group' style=''>";
          pageVM.orphanCalculator +=
            " <label><span class='commentTxt'>{{projectComment}}</span></label>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          if (pageVM.browserLanguage === "ARB") {
            pageVM.orphanCalculator +=
              "<div class='col-md-12 col-xs-12 centered'>";

            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator +=
              "<div class='col-md-12 col-xs-12 centered'>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "       <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "       <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
          }
        }
      }
      let calculator = $compile(pageVM.orphanCalculator)($scope);
      angular
        .element(document.getElementById("projectCalculator"))
        .html("")
        .append(calculator);
    }

    //********* PROJECT END *********/

    //********* RELIGIOUS PAYMENT START *********/

    $scope.selectedCurrencySymbol = JSON.parse(
      sessionStorage.getItem("currency")
    ).symbol;

    function getActiveReligiousPayments() {
      if (pageVM.browserLanguage == "ARB") {
        religiousPayment = "المدفوعات الدينية";
      } else if (pageVM.browserLanguage == "FRN") {
        religiousPayment = "Paiements religieux";
      } else {
        religiousPayment = "Religious Payments";
      }
      programTypeService.getProgramType(religiousPayment).then(function (res) {
        pageVM.programType = res.data[0];
        var programTypeId = pageVM.programType._id;
        religiousPaymentService
          .getReligiousPayments(programTypeId)
          .then(function (res) {
            pageVM.religiousPayments = _.filter(res.data, function (e) {
              return e.isActive == true;
            });
            return res;
          });
      });
    }



    $scope.setAmountBasedOnCountry = function () {
     let countryArray = $scope.selectedCategory.amountBasedOnCountry && $scope.selectedCategory.countryWiseAmount ? $scope.selectedCategory.countryWiseAmount : null;
     let amountToUse = null;
     if (countryArray) {
         let item = countryArray.find(item => item.key == $scope.qurbaniPerformPlace);
         if (item) {
             amountToUse = item.price;
         }
     }
     else {
         amountToUse = $scope.selectedCategory.fixedAmount
     }

      if (amountToUse) {
        var obj = new Object();
        obj.currency = JSON.parse(sessionStorage.getItem('currency'));
        if (obj.currency.title == "USD") {
          let fixedAmount = Math.round(amountToUse).toFixed(2);
          $scope.amountValue = pageVM.amount = fixedAmount;
        } else {
          let amount = Math.round(obj.currency.rateExchange * amountToUse).toFixed(2);
          $scope.amountValue = pageVM.amount = Math.round(currencyService.currencyConversionFormula(amount)).toFixed(2);
        }
        $scope.countChange();
      }
      else {
        $scope.totalAmount = $scope.amountValue = pageVM.amount = null
      }
    }
    // $scope.countChange = function () {
    //     $scope.totalAmount = $scope.selectedCount * $scope.amountValue;
    // }
    $scope.countChange = function () {
      $scope.amountValue = pageVM.amount;
      const selectedOcassion = $scope.selectedOccasion || pageVM.selectedOccasion;
      const selectedDua = $scope.selectedDua || pageVM.selectedDua;
      if (selectedOcassion) {
        $scope.totalAmount = ((parseFloat($scope.amountValue)
          + (selectedOcassion == undefined ? 0 : selectedOcassion.fixedAmount)
          + (selectedDua == undefined ? 0 : selectedDua.fixedAmount))
          * ($scope.selectedCount || 0)).toFixed(2);
        $scope.amountValue = $scope.selectedCategory.fixedAmount
          + (selectedOcassion == undefined ? 0 : selectedOcassion.fixedAmount)
          + (selectedDua == undefined ? 0 : selectedDua.fixedAmount);
        pageVM.hajjAmount = $scope.amountValue;
      }

      $scope.totalAmount =
        (parseFloat($scope.amountValue) * ($scope.selectedCount || 0)).toFixed(2);
    };

    $scope.countChangeDz = function () {
      let paymentDate = new Date();
      if (
        $scope.selectedDz &&
        $scope.selectedDz.donationProcess &&
        $scope.selectedDz.donationProcess.length &&
        $scope.selectedDz.donationProcess[0].isAmount
      ) {
        if ($scope.selectedRecurring) {
          if (
            $scope.selectedDonationDuration &&
            ($scope.selectedDonationDuration.donationDurationName ==
              "Half Yearly" ||
              $scope.selectedDonationDuration.donationDurationName ==
              "نصف سنوي" ||
              $scope.selectedDonationDuration.donationDurationName ==
              "Semestriel")
          ) {
            $scope.totalAmountPerMonth = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              6
            ).toFixed(2);
            $scope.totalAmount = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              6
            ).toFixed(2);
            paymentDate = new Date(
              paymentDate.setMonth(paymentDate.getMonth() + 6)
            );

            let monthNumber = paymentDate.getMonth();

            if (!monthNumber) monthNumber = paymentDate.getMonth() + 1;
            let formatted_date = new Date(
              monthNumber +
              "-" +
              paymentDate.getDate() +
              "-" +
              paymentDate.getFullYear()
            );
            let language = pageVM.browserLanguage;
            if (language == "ARB") {
              $scope.commentTxt =
                "يرجى ملاحظة أنه سيتم خصم " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " شهريًا حتى " +
                $filter("date")(formatted_date, "yyyy-MM-dd");
            } else if (language == "FRN") {
              $scope.commentTxt =
                "Veuillez noter que les " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " seront déduit mensuellement pour une période de (06) mois jusqu'au " +
                $filter("date")(formatted_date, "dd-MM-yyyy");
            } else {
              $scope.commentTxt =
                "Please note that the " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " will be deducted monthly for a period of (06) months until " +
                $filter("date")(formatted_date, "dd-MM-yyyy");
            }
          } else {
            $scope.totalAmountPerMonth = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              12
            ).toFixed(2);
            $scope.totalAmount = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              12
            ).toFixed(2);
            paymentDate = new Date(
              paymentDate.setFullYear(paymentDate.getFullYear() + 1)
            );
            let monthNumber = paymentDate.getMonth();

            if (!monthNumber) monthNumber = paymentDate.getMonth() + 1;
            let formatted_date = new Date(
              monthNumber +
              "-" +
              paymentDate.getDate() +
              "-" +
              paymentDate.getFullYear()
            );
            let language = pageVM.browserLanguage;
            if (language == "ARB") {
              $scope.commentTxt =
                "يرجى ملاحظة أنه سيتم خصم " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " شهريًا حتى " +
                $filter("date")(formatted_date, "yyyy-MM-dd");
            } else if (language == "FRN") {
              $scope.commentTxt =
                "Veuillez noter que les " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " seront déduit mensuellement jusqu'au " +
                $filter("date")(formatted_date, "dd-MM-yyyy");
            } else {
              $scope.commentTxt =
                "Please note that the " +
                $scope.selectedCurrencySymbol +
                $scope.totalAmount +
                " will be deducted monthly until " +
                $filter("date")(formatted_date, "dd-MM-yyyy");
            }
          }
        } else {
          if (
            $scope.selectedDonationDuration == "Yearly" ||
            $scope.selectedDonationDuration == "سنوي" ||
            $scope.selectedDonationDuration == "Annuel"
          ) {
            $scope.totalAmountPerMonth =
              ($scope.selectedCount || 0) * $scope.amountValue;
            $scope.totalAmount =
              ($scope.selectedCount || 0) * $scope.amountValue.toFixed(2);
          } else {
            $scope.totalAmountPerMonth = Math.round(
              (($scope.selectedCount || 0) * $scope.amountValue) /
              2
            ).toFixed(2);
            $scope.totalAmount = Math.round(
              ($scope.selectedCount || 0) * $scope.amountValue
            ).toFixed(2);
          }
        }
      } else {
        $scope.totalAmount =
          ($scope.selectedCount || 0) * $scope.amountValueForNonFixed;
      }
      // if ($scope.selectedDz.donationProcess[0].isAmount) {
      //     $scope.totalAmount = $scope.selectedCount * $scope.amountValue;
      // } else {
      //     $scope.totalAmount = $scope.selectedCount * $scope.amountValueForNonFixed;
      // }
    };
    $scope.countChangeGc = function () {


      let paymentDate = new Date();
      if ($scope.selectedRecurring === false) $scope.commentTxt = undefined;
      if (
        $scope.selectedGc && $scope.selectedGc.donationProcess[0].isRecurring &&
        ($scope.selectedRecurring || $scope.isRecurringPaymentPlan)
      ) {
        $scope.selectedCount = !$scope.selectedCount ? 0 : $scope.selectedCount;
        let numOfMonths = $scope.selectedGc.donationProcess[0].subscriptionDetail.duration.numOfMonths;

        let amountPerOrphan = Math.ceil(($scope.amountValue) / numOfMonths).toFixed(2);
        $scope.totalAmount = ($scope.selectedCount || 0) * amountPerOrphan;

        $scope.totalSubscriptionAmount = Math.round((($scope.selectedCount || 0) * $scope.amountValue)).toFixed(2);

        paymentDate = new Date(paymentDate.setMonth(paymentDate.getMonth() + numOfMonths));
        let monthNumber = paymentDate.getMonth();

        let pd = paymentDate.getDate();
        let year = paymentDate.getFullYear();

        let formatted_date = new Date(monthNumber + "-" + pd + "-" + year);
        let language = localStorage.getItem('lang');




        let messageCOmmand = $scope.selectedGc.donationProcess[0].subscriptionDetail.paymentChargeMessage.value[language];

        $scope.paymentChargeMessage = messageCOmmand.replace("[currency]", $scope.selectedCurrencySymbol).replace("[amount]", $scope.totalAmount).replace("[date]", $filter('date')(formatted_date, "dd-MM-yyyy"));



      } else {
        if ($scope.amountValue != undefined && $scope.amountValue != null && $scope.amountValue != 0) {
          if ($scope.selectedCount != undefined && $scope.selectedCount != null && $scope.selectedCount != 0) {
            $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValue).toFixed(2);
          }
          else {
            $scope.totalAmount = $scope.amountValue;
          }
        }
        else {
          // $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
          $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.amountValueForNonFixed).toFixed(2);
        }

        $scope.totalSubscriptionAmount = $scope.totalAmount;
      }
    };



    $scope.countChangeForFitrah = function () {
      $scope.totalAmount = Math.round(($scope.selectedCount || 0) * $scope.fitrahFixedAmount).toFixed(2);
    };
    $scope.setPosFromDate = function () {
      var position = jQuery("#txtFromDate").offset().top;
      position = position - 280;
      angular
        .element(jQuery(".datepicker-dropdown")[0])
        .css({ top: "" + position + "px" });
      jQuery(".datepicker-dropdown").addClass("homecal");
    };
    $scope.setPosToDate = function () {
      var position = jQuery("#txtToDate").offset().top;
      position = position - 280;
      angular
        .element(jQuery(".datepicker-dropdown")[0])
        .css({ top: "" + position + "px" });
    };
    //For Add/Update Relgiious Payment Form
    $scope.startDateChange = function () {
      jQuery("#txtToDate").datepicker("remove");
      jQuery("#txtToDate").val("");
      jQuery("#txtToDate").datepicker({
        autoclose: true,
        startDate: new Date(pageVM.StartDate)
      });
    };
    $scope.showSpecialCalculatorForFitrahAndZakat = function () {
      pageVM.religiousPaymentCalculator = "";
      setSubcategory();
      selectedFitrah = $scope.selectedFitrahSubType;

      var obj = new Object();
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      if (obj.currency.title == "USD") {
        $scope.fitrahFixedAmount = Math.round(selectedFitrah.fitrahSubTypeAmount).toFixed(2);
      } else {
        let amount =
          obj.currency.rateExchange * selectedFitrah.fitrahSubTypeAmount;
        $scope.fitrahFixedAmount = currencyService.currencyConversionFormula(
          amount
        )
      }
      $scope.isAmount = Math.round($scope.fitrahFixedAmount).toFixed(2);
      let donationProcess =
        religiousPaymentDetailAfterSelection.donationProcess[0];

      $scope.fitrahSubTypes = [];
      fitrahSubTypes = $scope.selectedCategory.fitrahSubTypes;

      $scope.selectedCountryOfResidence = null;
      $scope.selectedCount = undefined;

      pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group'>";
      pageVM.religiousPaymentCalculator +=
        " <label>{{ 'FITRAH SUBTYPE' | translate }}</label>";
      pageVM.religiousPaymentCalculator +=
        "<select class='form-control' ng-model='selectedFitrahSubType' ng-change='showSpecialCalculatorForFitrahAndZakat()' ng-options='x.name for x in selectedCategory.fitrahSubTypes'>";
      pageVM.religiousPaymentCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.religiousPaymentCalculator += "</select>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";

      pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group'>";
      pageVM.religiousPaymentCalculator +=
        " <label>{{ 'COUNTRY OF RESIDENCE' | translate }}</label>";
      pageVM.religiousPaymentCalculator +=
        "<select class='form-control' ng-model='selectedCountryOfResidence'  ng-options='x.name for x in countriesForResidence'>";
      pageVM.religiousPaymentCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.religiousPaymentCalculator += "</select>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";

      if (religiousPaymentDetailAfterSelection.isSyed) {
        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{ 'DESCEND' | translate }}</label>";
        pageVM.religiousPaymentCalculator +=
          "<select class='form-control' ng-model='selectedDescend'>";
        pageVM.religiousPaymentCalculator +=
          " <option  value=''>---{{'PLEASE SELECT' | translate}}---</option>";
        pageVM.religiousPaymentCalculator +=
          " <option ng-value='false' >{{'NONSYED' | translate}}</option>";
        pageVM.religiousPaymentCalculator +=
          " <option ng-value='true'>{{'SYED' | translate}}</option>";
        pageVM.religiousPaymentCalculator += "</select>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
      }

      pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group'>";
      pageVM.religiousPaymentCalculator +=
        " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
      pageVM.religiousPaymentCalculator +=
        " <label id='fixedAmountValue' ></label>";
      pageVM.religiousPaymentCalculator += "<div class='input-group'>";
      pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
      pageVM.religiousPaymentCalculator +=
        "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off'  id='amountTextBox' ng-keyup='countChangeForFitrah()' data-ng-model='fitrahFixedAmount' readonly class='form-control' ng-disabled='pageVM.isAmount' />";
      pageVM.religiousPaymentCalculator +=
        "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";

      pageVM.isCount = donationProcess.isCount;
      if (donationProcess.isCount) {
        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{ 'COUNT' | translate }}</label>";

        pageVM.religiousPaymentCalculator +=
          "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForFitrah()'>";
        pageVM.religiousPaymentCalculator += `<option ng-value="">---{{'PLEASE SELECT' | translate}}---</option>`;
        let min = Math.round(donationProcess.countMin);
        let max = Math.round(donationProcess.countMax);
        var interval = Math.round(donationProcess.interval);
        for (let i = min; i <= max; i += interval) {
          pageVM.religiousPaymentCalculator +=
            "      <option ng-value='" + i + "'>" + i + "</option>";
        }
        pageVM.religiousPaymentCalculator += "</select>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
      }

      pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group'>";
      pageVM.religiousPaymentCalculator +=
        "<label >{{ 'TOTAL AMOUNT' | translate }}</label>";
      pageVM.religiousPaymentCalculator += " <div class='input-group'>";
      pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
      pageVM.religiousPaymentCalculator +=
        "<input type='text' min='1' ng-keypress='isNumberKey($event)'  class='form-control' data-ng-model='totalAmount' ng-disabled='isAmount' />";
      pageVM.religiousPaymentCalculator +=
        " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";

      pageVM.religiousPaymentCalculator += "<div ng-show='customerNote != null' class='col-md-12 col-xs-12' > ";
      pageVM.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
      pageVM.religiousPaymentCalculator += "</div>";

      pageVM.religiousPaymentCalculator +=
        `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12 no-padding'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12 no-padding' style=' margin-top: 20px;'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator +=
        `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12 no-padding' style='margin-top: 20px;'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-addcart  grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12 no-padding'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-donate  grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator += "</div>";


      let calculator = $compile(pageVM.religiousPaymentCalculator)($scope);
      angular
        .element(document.getElementById("religiousPaymentCalculator"))
        .html("")
        .append(calculator);
    };
    $scope.getOcassionBySubCat = function (subCatId) {
      occasionService.getOcassionBySubCat(subCatId).then(function (res) {
        $scope.ocassionList = res.data;
      });
    };

    $scope.getDuasByOcassion = function (ocassionId) {
      duaService.getDuasByOcassion(ocassionId).then(function (res) {
        $scope.duaList = res.data;
      });
    };

    function getCalculatorAfterSubcategory() {
      let donationProcess =
        religiousPaymentDetailAfterSelection.donationProcess[0] || {};
      if ($scope.selectedCategory.slug == "rad-el-mazaalim") {
        donationProcess.isCount = false;
      }
      $scope.getOcassionBySubCat($scope.selectedCategory._id);
      pageVM.religiousPaymentCalculator +=
        "<div class='col-md-6 col-xs-12' ng-if='ocassionList.length'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group' >";
      pageVM.religiousPaymentCalculator +=
        " <label >{{ 'OCCASION' | translate }}</label>";
      pageVM.religiousPaymentCalculator +=
        "<select ng-change='getDuasByOcassion(pageVM.selectedOccasion._id);countChange();' class='form-control' ng-model='pageVM.selectedOccasion' ng-options='o.occasionName for o in ocassionList'>";
      pageVM.religiousPaymentCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.religiousPaymentCalculator += "</select>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator +=
        "<div class='col-md-6 col-xs-12' ng-if='duaList.length'>";
      pageVM.religiousPaymentCalculator += "<div class='form-group'>";
      pageVM.religiousPaymentCalculator +=
        " <label >{{ 'ZIYARAH' | translate }}</label>";
      pageVM.religiousPaymentCalculator +=
        "<select class='form-control' ng-change='countChange()' ng-model='pageVM.selectedDua' ng-options='d.duaName for d in duaList'>";
      pageVM.religiousPaymentCalculator +=
        "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
      pageVM.religiousPaymentCalculator += "</select>";
      pageVM.religiousPaymentCalculator += "</div>";
      pageVM.religiousPaymentCalculator += "</div>";

      //check if amount is fixed.
      if (donationProcess.isAmount) {
        if (donationProcess.isMarhomeenName) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          if (
            religiousPaymentDetailAfterSelection.programName == "Hajj & Ziyarah"
          ) {
            pageVM.religiousPaymentCalculator +=
              " <label >{{ 'MARHUMNAME' | translate }}</label>";
          } else {
            pageVM.religiousPaymentCalculator +=
              " <label >{{ 'BENEFICIARYMARHUMNAME' | translate }}</label>";
          }
          pageVM.religiousPaymentCalculator +=
            "<input type='text' maxlength='85' class='form-control' data-ng-model='marhomeenName'  />";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }

        var obj = new Object();
        obj.currency = JSON.parse(sessionStorage.getItem("currency"));
        if (obj.currency.title == "USD") {
          let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
          $scope.amountValue = fixedAmount;
        } else {
          let amount = obj.currency.rateExchange * donationProcess.amount
            (2);
          $scope.amountValue = currencyService.currencyConversionFormula(
            amount
          )
        }

        pageVM.amount = Math.round($scope.amountValue).toFixed(2);
        $scope.totalAmount = Math.round($scope.amountValue * $scope.selectedCount || 0).toFixed(2);

        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";
        pageVM.religiousPaymentCalculator +=
          " <label id='fixedAmountValue' ></label>";
        pageVM.religiousPaymentCalculator += "<div class='input-group'>";
        pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
        pageVM.religiousPaymentCalculator +=
          "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='pageVM.isAmount' />";
        pageVM.religiousPaymentCalculator +=
          "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";

        pageVM.isCount = donationProcess.isCount;
        if (donationProcess.isCount) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label >{{ 'COUNT' | translate }}</label>";

          pageVM.religiousPaymentCalculator +=
            "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
          pageVM.religiousPaymentCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          let min = Math.round(donationProcess.countMin);
          let max = Math.round(donationProcess.countMax);
          var interval = Math.round(donationProcess.interval);
          for (let i = min; i <= max; i += interval) {
            pageVM.religiousPaymentCalculator +=
              "      <option ng-value='" + i + "'>" + i + "</option>";
          }
          pageVM.religiousPaymentCalculator += "</select>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        if (donationProcess.isCalendar) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            "<label for=''>{{ 'CALENDAR' | translate }}</label>";
          pageVM.religiousPaymentCalculator += "<div class='input-group date'>";
          if (pageVM.language == "ARB") {
            pageVM.religiousPaymentCalculator +=
              "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='calendarForSacrifice'  data-date-format='dd/mm/yyyy' />";
            pageVM.religiousPaymentCalculator +=
              "<div class='input-group-addon'>";
            pageVM.religiousPaymentCalculator +=
              "<i class='fa fa-calendar'></i>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else {
            pageVM.religiousPaymentCalculator +=
              "<div class='input-group-addon'>";
            pageVM.religiousPaymentCalculator +=
              "<i class='fa fa-calendar'></i>";
            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator +=
              "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='calendarForSacrifice'>";
          }

          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";

          pageVM.religiousPaymentCalculator += "<script>";
          pageVM.religiousPaymentCalculator +=
            "jQuery('#txtFromDate').datepicker({";
          pageVM.religiousPaymentCalculator +=
            " autoclose: true, startDate: new Date(new Date().setDate(new Date().getDate() + 2))";
          pageVM.religiousPaymentCalculator += "});";
          pageVM.religiousPaymentCalculator +=
            "jQuery('.fa-calendar').click(function(){";
          pageVM.religiousPaymentCalculator +=
            "    jQuery(document).ready(function(){";
          pageVM.religiousPaymentCalculator +=
            "        jQuery('#txtFromDate').datepicker().focus();";
          pageVM.religiousPaymentCalculator +=
            "var position = jQuery('#txtFromDate').offset().top;";
          pageVM.religiousPaymentCalculator += "position = position - 300;";
          pageVM.religiousPaymentCalculator +=
            "angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: '' + (position) + 'px' });";
          pageVM.religiousPaymentCalculator += "    });";
          pageVM.religiousPaymentCalculator += "});";
          pageVM.religiousPaymentCalculator += "</script>";
        }

        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
        pageVM.religiousPaymentCalculator += " <div class='input-group'>";
        pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
        pageVM.religiousPaymentCalculator +=
          "<input type='text' min='1' ng-keypress='isNumberKey($event)'  data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'/>";
        pageVM.religiousPaymentCalculator +=
          " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";

        pageVM.religiousPaymentCalculator += "<div ng-show='customerNote != null' class='col-md-12 col-xs-12' > ";
        pageVM.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
        pageVM.religiousPaymentCalculator += "</div>";

      } else {
        if (donationProcess.isMarhomeenName) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          if (
            religiousPaymentDetailAfterSelection.programName == "Hajj & Ziyarah"
          ) {
            pageVM.religiousPaymentCalculator +=
              " <label >{{ 'MARHUMNAME' | translate }}</label>";
          } else {
            pageVM.religiousPaymentCalculator +=
              " <label >{{ 'BENEFICIARYMARHUMNAME' | translate }}</label>";
          }
          pageVM.religiousPaymentCalculator +=
            "<input type='text' maxlength='85' class='form-control' data-ng-model='marhomeenName'  />";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        if (donationProcess.isRecurring) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
          pageVM.religiousPaymentCalculator +=
            "<select  class='form-control' ng-model='pageVM.selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        if (donationProcess.isRecurring) {
          pageVM.donationDuration = donationProcess.donationDuration;
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator +=
            "<div class='form-group' data-ng-show='pageVM.selectedRecurring==true'>";
          pageVM.religiousPaymentCalculator +=
            " <label >{{ 'DURATION' | translate }}</label>";
          pageVM.religiousPaymentCalculator +=
            "<select class='form-control' ng-model='pageVM.selectedDonationDuration' ng-options='x.donationDurationName for x in pageVM.donationDuration'>";
          pageVM.religiousPaymentCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          pageVM.religiousPaymentCalculator += "</select>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        if (religiousPaymentDetailAfterSelection.isSyed) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label >{{ 'DESCEND' | translate }}</label>";
          pageVM.religiousPaymentCalculator +=
            "<select class='form-control' ng-model='selectedDescend'>";
          pageVM.religiousPaymentCalculator +=
            " <option  value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          pageVM.religiousPaymentCalculator +=
            " <option ng-value='false' >{{'NONSYED' | translate}}</option>";
          pageVM.religiousPaymentCalculator +=
            " <option ng-value='true'>{{'SYED' | translate}}</option>";
          pageVM.religiousPaymentCalculator += "</select>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        pageVM.isCount = donationProcess.isCount;
        if (religiousPaymentDetailAfterSelection.programName != $translate.instant("Zakah")) {

          if ($scope.selectedCategory.amountBasedOnCountry) {

            let countryList = $scope.selectedCategory.countryWiseAmount;

            let wherePerform = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "WHERE_TO_PERFORM" : "COUNTRY";

            pageVM.religiousPaymentCalculator +=
              "<div class='col-md-6 col-xs-12'>";
            pageVM.religiousPaymentCalculator += "<div class='form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label >{{  '" + wherePerform + "'  | translate }}</label>";
            pageVM.religiousPaymentCalculator +=
              "   <select class='form-control' data-ng-model='qurbaniPerformPlace' ng-change='setAmountBasedOnCountry();' >";
            pageVM.religiousPaymentCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";

            for (let i = 0; i < countryList.length; i++) {
              pageVM.religiousPaymentCalculator +=
                "      <option value='" + countryList[i].key + "'>" + countryList[i][pageVM.language] + "</option>";
            }
            pageVM.religiousPaymentCalculator += "</select>";
            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "</div>";
          }

          if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {

            pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.religiousPaymentCalculator += "<div class='form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label >{{ 'CHILD_NAME' | translate }}</label>";
            pageVM.religiousPaymentCalculator +=
              "<input type='text'  class='form-control'  data-ng-model='childName' />";

            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "</div>";

          }

          if ((donationProcess.isCalendar && pageVM.selectedReligiousPayment.slug != '-niyaz') || (donationProcess.isCalendar && pageVM.selectedReligiousPayment.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {

            let whenPerform = religiousPaymentDetailAfterSelection.slug == "-niyaz" || "qurbani-(sacrifice)" ? "WHEN_TO_PERFORM" : "CALENDAR";



            pageVM.religiousPaymentCalculator +=
              "<div class='col-md-6 col-xs-12'>";
            pageVM.religiousPaymentCalculator += "<div class='form-group'>";
            pageVM.religiousPaymentCalculator +=
              "<label for=''>{{ '" + whenPerform + "' | translate }}</label>";
            pageVM.religiousPaymentCalculator += "<div class='input-group date'>";

            if (pageVM.language == "ARB") {
              pageVM.religiousPaymentCalculator +=
                "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty sss' ng-model='calendarForSacrifice'  data-date-format='dd/mm/yyyy'>";
              pageVM.religiousPaymentCalculator +=
                "<div class='input-group-addon'>";
              pageVM.religiousPaymentCalculator +=
                "<i class='fa fa-calendar'></i>";
              pageVM.religiousPaymentCalculator += "</div>";
            } else {
              pageVM.religiousPaymentCalculator +=
                "<div class='input-group-addon'>";
              pageVM.religiousPaymentCalculator +=
                "<i class='fa fa-calendar'></i>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator +=
                "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty sss' ng-model='calendarForSacrifice'  data-date-format='dd/mm/yyyy'>";
            }

            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "<script>";
            pageVM.religiousPaymentCalculator +=
              "jQuery('#txtFromDate').datepicker({";
            pageVM.religiousPaymentCalculator +=
              " autoclose: true, startDate: new Date(new Date().setDate(new Date().getDate() + 2))";
            pageVM.religiousPaymentCalculator += "});";
            pageVM.religiousPaymentCalculator +=
              "jQuery('.fa-calendar').click(function(){";
            pageVM.religiousPaymentCalculator +=
              "    jQuery(document).ready(function(){";
            pageVM.religiousPaymentCalculator +=
              "        jQuery('#txtFromDate').datepicker().focus();";
            pageVM.religiousPaymentCalculator +=
              "var position = jQuery('#txtFromDate').offset().top;";
            pageVM.religiousPaymentCalculator += "position = position - 300;";
            pageVM.religiousPaymentCalculator +=
              "angular.element(jQuery('.datepicker-dropdown')[0]).css({ top: '' + (position) + 'px' });";
            pageVM.religiousPaymentCalculator += "    });";
            pageVM.religiousPaymentCalculator += "});";
            pageVM.religiousPaymentCalculator += "</script>";
          }

          if (donationProcess.isCount) {

            if ($scope.selectedCategory.isFixedAmount) {
              var obj = new Object();
              obj.currency = JSON.parse(sessionStorage.getItem("currency"));
              if (obj.currency.title == "USD") {
                let fixedAmount = Math.round($scope.selectedCategory.fixedAmount).toFixed(2);
                $scope.amountValue = fixedAmount;
              } else {
                let amount =
                  obj.currency.rateExchange * $scope.selectedCategory.fixedAmount;
                $scope.amountValue = currencyService.currencyConversionFormula(
                  amount
                )
              }

              pageVM.amount = Math.round($scope.amountValue).toFixed(2);

              if ($scope.selectedCategory.amountBasedOnCountry) {
                pageVM.amount = $scope.amountValue = null;
              }
              else {
                pageVM.amount = Math.round($scope.amountValue || $scope.selectedCategory.fixedAmount).toFixed(2);
              }

              $scope.totalAmount = Math.round($scope.amountValue * ($scope.selectedCount || 0)).toFixed(2);

              let AmountText = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "AMOUNT_ANIMAL" :
                religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "AMOUT_PER_REQUEST" : "AMOUNT";

              pageVM.religiousPaymentCalculator +=
                "<div class='col-md-6 col-xs-12'>";
              pageVM.religiousPaymentCalculator += "<div class='form-group'>";
              pageVM.religiousPaymentCalculator +=
                " <label id='amountLabel'>{{'" + AmountText + "' | translate}}</label>";
              pageVM.religiousPaymentCalculator +=
                " <label id='fixedAmountValue' ></label>";
              pageVM.religiousPaymentCalculator += "<div class='input-group'>";
              pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
              pageVM.religiousPaymentCalculator +=
                "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='pageVM.isAmount' />";
              pageVM.religiousPaymentCalculator +=
                "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
            } else {
              $scope.amountValue = 0;
              pageVM.amount = 0;
              pageVM.religiousPaymentCalculator +=
                "<div class='col-md-6 col-xs-12'>";
              pageVM.religiousPaymentCalculator += "<div class='form-group'>";
              pageVM.religiousPaymentCalculator +=
                " <label >{{ 'AMOUNT' | translate }}</label>";
              pageVM.religiousPaymentCalculator += " <div class='input-group'>";
              pageVM.religiousPaymentCalculator +=
                "<div class='input-icon' style='background: #464546; color: #CCCBCB;padding: 0px 0px 0px 12px;'>";
              pageVM.religiousPaymentCalculator +=
                "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
              pageVM.religiousPaymentCalculator +=
                " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
              pageVM.religiousPaymentCalculator += "</div>";
            }

            let countText = religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "NO_OF_ANIMAL" :
              religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "NO_OF_REQUESTS" : "COUNT";

            pageVM.religiousPaymentCalculator +=
              "<div class='col-md-6 col-xs-12'>";
            pageVM.religiousPaymentCalculator += "<div class='form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label >{{ '" + countText + "' | translate }}</label>";
            pageVM.religiousPaymentCalculator +=
              "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange();'>";
            pageVM.religiousPaymentCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.religiousPaymentCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.religiousPaymentCalculator += "</select>";
            pageVM.religiousPaymentCalculator += "</div>";
            pageVM.religiousPaymentCalculator += "</div>";




          }
        }



        if (
          donationProcess.isOtherFieldForNiyaz ||
          $scope.selectedCategory.programSubCategoryName == $translate.instant("OTHER") ||
          $scope.selectedCategory.programSubCategoryName == $translate.instant('OTHERS')
        ) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label >{{ 'OTHER' | translate }}</label>";
          pageVM.religiousPaymentCalculator +=
            "<input type='text'  maxlength='85' class='form-control' data-ng-model='pageVM.otherFieldForNiyaz'  />";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }

        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
        pageVM.religiousPaymentCalculator += " <div class='input-group'>";
        pageVM.religiousPaymentCalculator += "<div class='input-icon'>";
        pageVM.religiousPaymentCalculator +=
          "<input type='text' min='1' ng-keypress='isNumberKey($event)' class='form-control' data-ng-disabled='pageVM.amount' data-ng-model='totalAmount' />";
        pageVM.religiousPaymentCalculator +=
          " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";


        pageVM.religiousPaymentCalculator += "<div ng-show='customerNote != null' class='col-md-12 col-xs-12' > ";
        pageVM.religiousPaymentCalculator += "<label><span class='commentTxt-grey-Box' ng-bind-html='customerNote'></span></label> ";
        pageVM.religiousPaymentCalculator += "</div>";
        if (
          religiousPaymentDetailAfterSelection.programName == "Niyaz" ||
          religiousPaymentDetailAfterSelection.programName == "الإطعام"
        ) {
          let language = pageVM.browserLanguage;
          if (language == "ARB") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt' dir='rtl'>نود لفت إنتباهكم أن طلبات توزيع البركة في مناسبات محددة يجب أن تتم قبل 48 ساعة من موعد المناسبة، و إلا سيتم إدراج المساهمة في صندوق البركة العام.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else if (language == "FRN") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Veuillez noter que les demandes concernant les Niyaz lors d'occasions assignés doivent être adressées (48) heures à l'avance, faute de quoi la contribution servira de fonds pour le général Niyaz.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Please note, requests for Niyaz on auspicious occasions must be made (48) hours in advance or else the contribution will be used as general Niyaz fund.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          }
        } else if (
          religiousPaymentDetailAfterSelection.programName == "Khums" ||
          religiousPaymentDetailAfterSelection.programName == "الخمس"
        ) {
          let language = pageVM.browserLanguage;

          if (language == "ARB") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt' dir='rtl'>إخلاء طرف: نحن مجرد وسيط. سنقوم بتسليم الأموال إلى مكتب المرجع .و سيتم تقديم إيصال من مكتب المرجع خلال 15 يوم عمل.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else if (language == "FRN") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>A titre indicatif : Nous ne sommes qu'un intermédiaire. Nous allons livrer les fonds fournis par vos soins au bureau du Marja respectif. Notez qu'un reçu original sera édité par le bureau du Marja dans les 15 jours ouvrables.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Disclaimer: We are just an intermediary. We will be delivering the funds to the office of the respective Marja. Note that an original receipt will be provided from the office of the Marja within 15 working days.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          }
        }
      }

      console.log(religiousPaymentDetailAfterSelection);

      // if (
      //   (religiousPaymentDetailAfterSelection.programName ==
      //     "أداء العبادات نيابة عن الأموات المرحومين" ||
      //     religiousPaymentDetailAfterSelection.programName ==
      //     "Ibadaat for Marhumeen" ||
      //     religiousPaymentDetailAfterSelection.programName ==
      //     "Ibadates pour marhumeen") &&
      //   ($scope.selectedCategory != undefined ||
      //     $scope.selectedCategory != null)
      // )
      // "أداء العبادات نيابة عن الأموات المرحومين" ||
      //     religiousPaymentDetailAfterSelection.programName ==
      //     "Ibadaat for Marhumeen" ||
      //     religiousPaymentDetailAfterSelection.programName ==
      //     "Ibadates pour marhumeen"

      if (
        (religiousPaymentDetailAfterSelection.slug == "ibadaat-for-marhumeen") &&
        ($scope.selectedCategory != undefined ||
          $scope.selectedCategory != null)
      ) {
        if (
          $scope.selectedCategory.slug == "qadha-salaah"
          //"Qadha Salah" ||
          // $scope.selectedCategory.programSubCategoryName == "Qadha Salaah" ||
          // $scope.selectedCategory.programSubCategoryName == "قضاء الصلاة" ||
          // $scope.selectedCategory.programSubCategoryName == "Qadha Salaah"
        ) {
          let language = pageVM.browserLanguage;
          if (language == "ARB") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt' dir='rtl'>يرجى ملاحظة أن قضاء الصلاة السنوية عن الميت تتضمن قضاء أربعة من صلاة الآيات.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else if (language == "FRN") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Veuillez noter que les Qadha Salaah pour le marhum comprend (04) Salaat Al Ayaat.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Please note that Qadha Salaah for the marhum includes (04) Salaat Al Ayaat.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          }
        } else if (
          $scope.selectedCategory.programSubCategoryName == "Salaat Al Ayat" ||
          $scope.selectedCategory.programSubCategoryName == "Salaat Al Ayaat" ||
          $scope.selectedCategory.programSubCategoryName == "صلاة الآيات"
        ) {
          let language = pageVM.browserLanguage;
          if (language == "ARB") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt' dir='rtl'>يرجى ملاحظة أن قضاء الصلاة السنوية عن الميت تتضمن قضاء أربعة من صلاة الآيات.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";

          } else if (language == "FRN") {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Veuillez noter que (04) Salaat Al Ayaat sont inclus dans le pack annuel Qadha Salaah.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          } else {
            pageVM.religiousPaymentCalculator +=
              "<div class='row col-md-12 form-group'>";
            pageVM.religiousPaymentCalculator +=
              " <label><span class='commentTxt'>Please note that Qadha Salaah for the marhum includes (04) Salaat Al Ayaat.</span></label>";
            pageVM.religiousPaymentCalculator += "</div>";
          }
        } else {
          // pageVM.religiousPaymentCalculator += "<div class='row col-md-12 form-group'>";
          // pageVM.religiousPaymentCalculator += " <label ><span class='commentTxt'>{{ 'NOTE' | translate }}: {{ 'IBADAATOFMARHUMEEN' | translate }}</span></label>";
          // pageVM.religiousPaymentCalculator += "</div>";
        }

        pageVM.religiousPaymentCalculator += "<div class='col-md-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{'COMMENT' | translate}}</label>";
        pageVM.religiousPaymentCalculator +=
          "<textarea class='form-control' data-ng-model='marhumeenComment' rows='3' style=''></textarea>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";

      }

      pageVM.religiousPaymentCalculator +=
        `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator += "</div>";

      pageVM.religiousPaymentCalculator +=
        `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator +=
        "   <div class='col-md-4 col-xs-12'>";
      pageVM.religiousPaymentCalculator +=
        "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
      pageVM.religiousPaymentCalculator += "   </div>";
      pageVM.religiousPaymentCalculator += "</div>";
    }

    $scope.showSpecialFieldsOnSubCategory = function () {
      $scope.marhomeenName = null;
      $scope.marhumeenComment = null;
      // if (!$scope.selectedCategory) {
      $scope.amountValue = null;
      $scope.totalAmount = null;
      $scope.selectedCount = null;
      pageVM.selectedOccasion = null;
      pageVM.selectedDua = null;
      $scope.calendarForSacrifice = null;
      $scope.qurbaniPerformPlace = null;
      $scope.childName = null;



      // }

      if ($scope.selectedCategory.slug) {
        getNoteBasedOnSlug($scope.selectedCategory.slug);
      }

      if ($scope.selectedCategory == null) return;




      else if ($scope.selectedCategory.isSDOZ) {
        pageVM.religiousPaymentCalculator = "";
        setSubcategory();

        if ($scope.selectedCategory.isCountryFoZiyarat) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label>{{ 'COUNTRY OF ZIYARAT' | translate }}</label>";
          if ($scope.selectedCategory.countryOfZiyarat != null) {
            $scope.countryName = $scope.selectedCategory.countryOfZiyarat.name;
            pageVM.religiousPaymentCalculator +=
              "<input type='text' id='countrtNameTextBox' data-ng-model='countryName' readonly class='form-control' />";
          }
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }



        $scope.sdoz = [];
        sdoz = $scope.selectedCategory.sdoz;
        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label>{{ 'SPECIAL DAYS ZIYARAT' | translate }}</label>";
        pageVM.religiousPaymentCalculator +=
          "<select class='form-control' ng-model='selectedSDOZ' ng-options='x.name for x in selectedCategory.sdoz'>";
        pageVM.religiousPaymentCalculator +=
          "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
        pageVM.religiousPaymentCalculator += "</select>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        //Get Calculator for Other Fields
        getCalculatorAfterSubcategory();
      } else if ($scope.selectedCategory.isFirtahSubType) {
        pageVM.religiousPaymentCalculator = "";
        setSubcategory();

        $scope.fitrahSubTypes = [];
        fitrahSubTypes = $scope.selectedCategory.fitrahSubTypes;
        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label>{{ 'FITRAH SUB TYPE' | translate }}</label>";
        pageVM.religiousPaymentCalculator +=
          "<select class='form-control' ng-model='selectedFitrahSubType' ng-change='showSpecialCalculatorForFitrahAndZakat()' ng-options='x.name for x in selectedCategory.fitrahSubTypes'>";
        pageVM.religiousPaymentCalculator +=
          "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
        pageVM.religiousPaymentCalculator += "</select>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
        //pageVM.religiousPaymentCalculator = "";
        //getCalculator(pageVM.selectedReligiousPayment);
      } else {
        pageVM.religiousPaymentCalculator = "";
        setSubcategory();
        if ($scope.selectedCategory.isSahm) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label>{{ 'SELECT SAHM' | translate }}</label>";
          pageVM.religiousPaymentCalculator +=
            "<select class='form-control' ng-model='selectedSahm'  ng-options='x.name | translate for x in selectedCategory.sahms'>";
          pageVM.religiousPaymentCalculator +=
            "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
          pageVM.religiousPaymentCalculator += "</select>";
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        if ($scope.selectedCategory.isCountryFoZiyarat) {
          pageVM.religiousPaymentCalculator +=
            "<div class='col-md-6 col-xs-12'>";
          pageVM.religiousPaymentCalculator += "<div class='form-group'>";
          pageVM.religiousPaymentCalculator +=
            " <label>{{ 'COUNTRY OF ZIYARAT' | translate }}</label>";
          if ($scope.selectedCategory.countryOfZiyarat != null) {
            $scope.countryName = $scope.selectedCategory.countryOfZiyarat.name;
            pageVM.religiousPaymentCalculator +=
              "<input type='text' id='countrtNameTextBox' data-ng-model='countryName' readonly class='form-control' />";
          }
          pageVM.religiousPaymentCalculator += "</div>";
          pageVM.religiousPaymentCalculator += "</div>";
        }
        getCalculatorAfterSubcategory();
        //get Simple Calculator
      }

      let calculator = $compile(pageVM.religiousPaymentCalculator)($scope);
      angular
        .element(document.getElementById("religiousPaymentCalculator"))
        .html("")
        .append(calculator);
    };
    $scope.setCalendarForDate = function () {
      jQuery(this).on("click", function () {
        jQuery(this).datepicker({
          autoclose: true
        });
      });
    };

    // Function to get country list for Country of Residence in Fitrah Payment
    function getCountryList() {
      religiousPaymentService.getCountryList().then(function (res) {
        $scope.countriesForResidence = res.data;
        $scope.countriesForResidence = $scope.countriesForResidence.map(c => {
          if (localStorage.getItem('lang') === 'FRN') {
            c.name = c.nameFRN;
          } else if (localStorage.getItem('lang') === 'ARB') {
            c.name = c.nameARB;
          }
          return c;
        })
      });
    }

    function setSubcategory() {
      if (
        religiousPaymentDetailAfterSelection.programSubCategory != undefined
          ? religiousPaymentDetailAfterSelection.programSubCategory.length > 0
          : false
      ) {
        let labelKey = religiousPaymentDetailAfterSelection.slug == "-niyaz" ? "NIYAZ_OCCASION" : religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" ? "QURBANI_PROGRAM" : religiousPaymentDetailAfterSelection.slug == "hajj-and-ziyarah" ? "REQUEST_TYPE" : "SUB CATEGORY";

        subCategories = religiousPaymentDetailAfterSelection.programSubCategory;
        pageVM.religiousPaymentCalculator += "<div class='col-md-6 col-xs-12'>";
        pageVM.religiousPaymentCalculator += "<div class='form-group'>";
        pageVM.religiousPaymentCalculator +=
          " <label >{{ '" + labelKey + "' | translate}}</label>";
        pageVM.religiousPaymentCalculator +=
          "<select ng-disabled='pageVM.isDetail==undefined?false:!pageVM.isDetail' ng-change='showSpecialFieldsOnSubCategory()' class='form-control' ng-model='selectedCategory' ng-options='x.programSubCategoryName for x in pageVM.subCategories' >";
        pageVM.religiousPaymentCalculator +=
          "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
        pageVM.religiousPaymentCalculator += "</select>";
        pageVM.religiousPaymentCalculator += "</div>";
        pageVM.religiousPaymentCalculator += "</div>";
      } else {
        getCalculatorAfterSubcategory();
      }
    }

    function selectRpCalculator() {
      $scope.clearValuesFastDonations();
      let selectedReligiousPayment = pageVM.selectedReligiousPayment;
      $scope.totalAmount = undefined;
      $scope.selectedCategory = null;
      $scope.marhomeenName = null;
      $scope.duaList = [];
      getRpCalculator(selectedReligiousPayment);
    }

    function getRpCalculator(religiousPaymentDetail) {
      pageVM.religiousPaymentCalculator = "";

      if (religiousPaymentDetail != undefined) {
        pageVM.subCategories = religiousPaymentDetail.programSubCategory && religiousPaymentDetail.programSubCategory.length && religiousPaymentDetail.programSubCategory.filter(o => o.isActive);
        religiousPaymentDetailAfterSelection = religiousPaymentDetail;
        setSubcategory();
        // let calculator = $compile(pageVM.religiousPaymentCalculator)($scope);
        // angular.element(document.getElementById("religiousPaymentCalculator")).html("").append(calculator);
      }
      let calculator = $compile(pageVM.religiousPaymentCalculator)($scope);
      angular
        .element(document.getElementById("religiousPaymentCalculator"))
        .html("")
        .append(calculator);
    }

    //********* RELIGIOUS PAYMENT END *********/

    //************* ORPHANS START *************/

    $scope.selectedCurrencySymbol = JSON.parse(
      sessionStorage.getItem("currency")
    ).symbol;

    // get  Generalcare objects
    function getActiveGeneralCares() {
      if (pageVM.browserLanguage == "ARB") {
        generalCare = "الرعاية العامة";
      } else if (pageVM.browserLanguage == "FRN") {
        generalCare = "Premières nécessités";
      } else {
        generalCare = "General Care";
      }
      programTypeService.getProgramType(generalCare).then(function (res) {
        pageVM.programType = res.data[0];
        var programTypeId = pageVM.programType._id;
        generalCareService.getGeneralCare(programTypeId).then(function (res) {
          pageVM.generalCares = _.filter(res.data, function (e) {
            return e.isActive == true;
          });
          $scope.generalCareList = pageVM.generalCares;
          return res;
        });
      });
    }

    function getAllActiveDarAlZahra() {
      if (pageVM.browserLanguage == "ARB") {
        project = "(دار الزهراء (ع";
      } else if (pageVM.browserLanguage == "FRN") {
        project = "Dar-Al-Zahra";
      } else {
        project = "Dar Al Zahra";
      }
      programTypeService.getProgramType(project).then(function (res) {
        pageVM.programType = res.data[0];
        var programTypeId = pageVM.programType._id;
        darAlZahraService.getDarAlZahra(programTypeId).then(function (res) {
          pageVM.allDarAlZahra = _.filter(res.data, function (e) {
            return e.isActive == true;
          });
          $scope.daralzahraCat = pageVM.allDarAlZahra;
          return res;
        });
      });
    }




    function clearOrphanCalculator() {
      $scope.clearValuesFastDonations();
      $scope.selectedGc = undefined;
      $scope.selectedDz = undefined;
      $scope.user.roles = [];

      $scope.sponsorshipPlanText = undefined;

      if ($scope.orphanType == "") {
        $scope.orphanType = null;
      }


      $scope.selectedPaymentPlan = undefined;
      $scope.selectedDescend = undefined;
      $scope.selectedGender = undefined;
      $scope.amountValue = undefined;
      $scope.totalAmount = undefined;
      $scope.isAutoRenew = false;
      $scope.autoRenewMessage = undefined;
      $scope.paymentChargeMessage = undefined;
      $scope.totalSubscriptionAmount = undefined;
      $scope.paymentPlans = [];



      pageVM.orphanCalculator = "";
      jQuery("#orphanListModal").modal("hide");
      jQuery("#studentListModal").modal("hide");
      let calculator = $compile(pageVM.orphanCalculator)($scope);
      angular
        .element(document.getElementById("orphanCalculator"))
        .html("")
        .append(calculator);
    }

    $scope.getOrphansByCount = function (orphanCount) {

      $scope.selectedDescend = 'Any';
      $scope.selectedGender = 'Any';
      //$scope.user.roles = [];
      pageVM.orphans = [];
      orphanService
        .getOrphansByCount(
          orphanCount,
          $scope.selectedDescend,
          $scope.selectedGender
        )
        .then(function (res) {
          cartService.getCartDetail().then(cres => {
            if (cres && cres.data && cres.data.items && cres.data.items.length) {
              pageVM.orphans = pageVM.orphanCompleteList = res.data.map(item1 => {
                if (cres.data.items.some(item2 => (item2.orphans && item2.orphans.find(i => i === item1._id) === item1._id))) {
                  item1.alreadyInCart = true;
                  return item1;
                } else return item1;
              });
            } else { pageVM.orphans = pageVM.orphanCompleteList = res.data };
          })
        });
    };

    $scope.getStudentsByCount = function (studentsCount) {
      $scope.user.roles = [];
      if (!$scope.selectedDonationDuration) return showError();
      pageVM.students = [];
      studentProfileService
        .getStudentsByCount(studentsCount, $scope.selectedDescend)
        .then(function (res) {
          cartService.getCartDetail().then(cres => {
            if (cres && cres.data && cres.data.items && cres.data.items.length) {
              pageVM.students = res.data.map(item1 => {
                if (cres.data.items.some(item2 => (item2.students && item2.students.find(i => i === item1._id) === item1._id))) {
                  item1.alreadyInCart = true;
                  return item1;
                } else return item1;
              });
            } else { pageVM.students = res.data; }
          })
        });
    };

    $scope.selectGcCalculator = function () {
      $scope.totalAmount = undefined;
      jQuery("#orphanListModal").modal("hide");
      jQuery("#studentListModal").modal("hide");
      getGcCalculator($scope.selectedGc);
    };

    $scope.selectDzCalculator = function () {
      $scope.totalAmount = 0;
      jQuery("#orphanListModal").modal("hide");
      jQuery("#studentListModal").modal("hide");
      getDzCalculator($scope.selectedDz);
    };

    $scope.clearOrphans = function () {

      // $scope.selectedDescend = 'Any';
      // $scope.selectedGender =  'Any';
      //$scope.user.roles = [];

      pageVM.orphans = orphanService.filterOrphanPopupItems($scope.selectedGender, $scope.selectedDescend, pageVM.orphanCompleteList);

      if ($scope.selectedDescend !== false && !$scope.selectedDescend) {
        $scope.hideBtn = true;
      } else $scope.hideBtn = false;



    };

    pageVM.isPaymentEnabled = function () {
      if ($scope.user && $scope.user.roles && $scope.selectedCount && $scope.selectedGc.donationProcess[0].isRecurring && $scope.selectedGc.donationProcess[0].isAmount) {
        return (($scope.user.roles.length > 0 && $scope.selectedCount == $scope.user.roles.length) ? true : false)
      }
      else {
        if ($scope.totalAmount > 0) {
          return true;

        }

      }

      return false;
    }

    // $scope.orphanType = "gc"
    $scope.amountIsAmount = true;
    $scope.isRecurringPaymentPlan = false;
    $scope.countArray = [];



    pageVM.language = localStorage.getItem('lang');


    $scope.totalSubscriptionAmount = undefined;


    $scope.getCountValues = function () {

      if ($scope.selectedGc) {
        let min = Math.round($scope.selectedGc.donationProcess[0].countMin);
        let max = Math.round($scope.selectedGc.donationProcess[0].countMax);
        var interval = Math.round($scope.selectedGc.donationProcess[0].interval);
        let arry = [{}];
        for (let i = min; i <= max; i += interval) {
          arry[i - 1] = i;
        }

        $scope.countArray = arry;


      }
    }

    $scope.checkPaymentPlan = function () {

      if ($scope.selectedPaymentPlan) {

        if ($scope.selectedPaymentPlan.Name != "GIVE_ONCE") {

          $scope.isRecurringPaymentPlan = true;
        }
        else {
          $scope.isRecurringPaymentPlan = false;
        }
      }
      if ($scope.selectedCount > 0) {
        $scope.countChangeGc();
      }
    }


    function getGcCalculator(projectDetail) {



      $scope.totalSubscriptionAmount = undefined;
      $scope.sponsorshipPlanText = undefined;
      $scope.amountIsAmount = true;
      $scope.amountValue = null;
      $scope.paymentPlans = [];
      $scope.autoRenewMessage = undefined;
      $scope.paymentChargeMessage = undefined;

      pageVM.orphanCalculator = "";
      $scope.commentTxt = "";
      $scope.user.roles = [];
      if (projectDetail != undefined) {
        pageVM.subCategories = projectDetail.programSubCategory;
        if (
          pageVM.subCategories != undefined
            ? pageVM.subCategories.length > 0
            : false
        ) {
          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label >{{ 'SUB CATEGORY' | translate}}</label>";
          pageVM.orphanCalculator +=
            "<select  class='form-control' ng-model='pageVM.selectedCategory' ng-change='pageVM.checkSubCategory()' ng-options='x.programSubCategoryName for x in pageVM.subCategories'>";
          pageVM.orphanCalculator += "</select>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
        }
        let donationProcess = projectDetail.donationProcess[0];
        //if Amount is Fixed
        if (donationProcess.isAmount) {
          var obj = new Object();
          obj.currency = JSON.parse(sessionStorage.getItem("currency"));
          if (obj.currency.title == "USD") {
            let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
            $scope.amountValue = fixedAmount;
          } else {
            let amount = obj.currency.rateExchange * donationProcess.amount;
            $scope.amountValue = currencyService.currencyConversionFormula(
              amount
            ).toFixed(2)
          }

          // pageVM.orphanCalculator += "</select>";
          // pageVM.orphanCalculator += "</div>";
          pageVM.amount = Math.round(donationProcess.amount).toFixed(2);

          let lang = localStorage.getItem('lang');
          if (donationProcess.subscriptionDetail) {
            $scope.paymentPlans = donationProcess.subscriptionDetail.paymentPlan;
            $scope.sponsorshipPlanText = utilService.getSponsorshipPlanString(donationProcess.subscriptionDetail.duration.numOfMonths, $scope.amountValue);
            $scope.autoRenewMessage = donationProcess.subscriptionDetail.autoRenewMessage.value[lang];




            if (donationProcess.processType && donationProcess.processType === "Subscription") {


            }

          }
          else {
            $scope.paymentPlans = [{
              "Name": "GIVE_ONCE",
              "value": {
                "FRN": "Donner une fois",
                "ARB": "أعط مرة واحدة",
                "ENG": "Give Once"
              }
            }];
          }
          $scope.selectedPaymentPlan = undefined;

          if (donationProcess.isRecurring) {
            // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator +=
            //   " <label >{{ 'PAYMENT METHOD' | translate}}</label>";
            // pageVM.orphanCalculator +=
            //   // "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChangeGc()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
            //   "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator +=
            //   " <label >{{ 'DESCEND' | translate}}</label>";
            // pageVM.orphanCalculator +=
            //   "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
            // pageVM.orphanCalculator += "</select>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator +=
            //   " <label >{{ 'GENDER' | translate}}</label>";
            // pageVM.orphanCalculator +=
            //   "<select class='form-control' ng-model='selectedGender' ng-change='clearOrphans()'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option value='Male'>{{'MALE' | translate}}</option><option value='Female'>{{'FEMALE' | translate}}</option>";
            // pageVM.orphanCalculator += "</select>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<div class='col-md-6'>";
            // pageVM.orphanCalculator += "<div class='form-group ng-hide' ng-show='selectedRecurring'>";
            // pageVM.orphanCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate}}</label>";
            // pageVM.orphanCalculator += "<div class='input-group date'>";
            // pageVM.orphanCalculator += "<div class='input-group-addon'>";
            // pageVM.orphanCalculator += "<i class='fa fa-calendar'></i>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<script>";
            // pageVM.orphanCalculator += "jQuery('#txtFromDate').datepicker({";
            // pageVM.orphanCalculator += " autoclose: true";
            // pageVM.orphanCalculator += "});";
            // pageVM.orphanCalculator += "</script>";

            // jQuery("#project-calculator").append(pageVM.orphanCalculator);
          }

          // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          // pageVM.orphanCalculator += "<div class='form-group'>";
          // pageVM.orphanCalculator +=
          //   " <label id='amountLabel'>{{ 'AMOUNT' | translate}}</label>";
          // pageVM.orphanCalculator += " <label id='fixedAmountValue' ></label>";
          // pageVM.orphanCalculator += "<div class='input-group'>";
          // pageVM.orphanCalculator += "<div class='input-icon'>";
          // pageVM.orphanCalculator +=
          //   "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='pageVM.isAmount' />";
          // pageVM.orphanCalculator +=
          //   "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";

          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator +=
            //   " <label >{{ 'COUNT' | translate}}</label>";
            // pageVM.orphanCalculator +=
            //   "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeGc()'>";
            // pageVM.orphanCalculator +=
            //   "<option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            // let min = Math.round(donationProcess.countMin);
            // let max = Math.round(donationProcess.countMax);
            // var interval = Math.round(donationProcess.interval);
            // for (let i = min; i <= max; i += interval) {
            //   pageVM.orphanCalculator +=
            //     "      <option ng-value='" + i + "'>" + i + "</option>";
            // }
            // pageVM.orphanCalculator += "</select>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
          }

          // pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          // pageVM.orphanCalculator += "<div class='form-group'>";
          // pageVM.orphanCalculator +=
          //   " <label >{{ 'TOTAL AMOUNT' | translate}}</label>";
          // pageVM.orphanCalculator += " <div class='input-group'>";
          // pageVM.orphanCalculator += "<div class='input-icon'>";
          // pageVM.orphanCalculator +=
          //   "<input type='text' min='1' ng-keypress='isNumberKey($event)'  data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
          // pageVM.orphanCalculator +=
          //   " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator += "</div>";
          // pageVM.orphanCalculator +=
          //   "<div class='row col-md-12 col-xs-12' ng-if='commentTxt'>";
          // pageVM.orphanCalculator +=
          //   " <label><span class='commentTxt'>{{commentTxt}}</span></label>";
          // pageVM.orphanCalculator += "</div>";

          if (donationProcess.isRecurring) {
            // pageVM.orphanCalculator +=
            //   "  <div class='col-md-12 centered' style='width:100%'>";
            // pageVM.orphanCalculator += "  <div class='form-group col-md-6'>";
            // pageVM.orphanCalculator +=
            //   "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
            // pageVM.orphanCalculator +=
            //   " data-target='#orphanListModal' ng-click='getOrphansByCount(selectedCount)' ng-show='selectedDescend == undefinder ? false : true && selectedGender == undefined ? false : true && selectedCount > 0 ? true : false'>{{'SELECT ORPHANS' | translate}}</button>";
            // pageVM.orphanCalculator += "  </div>";
            // pageVM.orphanCalculator += "  </div>";

            // pageVM.orphanCalculator +=
            //   "<div ng-show='(user.roles.length > 0 && selectedCount == user.roles.length) ? true : false'>";
            // pageVM.orphanCalculator +=
            //   `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator +=
            //   "<div ng-show='(user.roles.length > 0 && selectedCount == user.roles.length) ? true : false'>";

            // pageVM.orphanCalculator +=
            //   `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage === "ARB"'>`;
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
          } else {
            // if (projectDetail.slug == "eidiya") {
            //   pageVM.orphanCalculator +=
            //     "<div class='col-md-12 col-xs-12' style=''>";
            //   pageVM.orphanCalculator += "<div class='form-group' style=''>";
            //   pageVM.orphanCalculator +=
            //     " <label><span class='commentTxt'>{{'EidhyaSponsorship' | translate}}</span></label>";
            //   pageVM.orphanCalculator += "</div>";
            //   pageVM.orphanCalculator += "</div>";
            // }
            // pageVM.orphanCalculator +=
            //   `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator +=
            //   `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage === "ARB"'>`;
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            // pageVM.orphanCalculator +=
            //   "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            // pageVM.orphanCalculator += "   </div>";
            // pageVM.orphanCalculator += "</div>";
          }
        } else {

          $scope.amountIsAmount = false;
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'PAYMENT METHOD' | translate }}</label>";
            pageVM.orphanCalculator +=
              "<select  class='form-control' ng-change='durationForRecurring()' ng-model='selectedRecurring'><option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }
          if (donationProcess.isRecurring) {
            $scope.donationDuration = donationProcess.donationDuration;
            pageVM.orphanCalculator +=
              "<div class='col-md-6 col-xs-12' data-ng-show='selectedRecurring==true'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'DURATION' | translate }}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control' ng-model='selectedDonationDuration'  ng-options='x.donationDurationName for x in donationDuration'>";
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            // jQuery("#project-calculator").append(pageVM.orphanCalculator);
          }
          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator += " <label id='amountLabel'>Amount<span class='danger'>*</span></label>";
            // pageVM.orphanCalculator += " <label id='fixedAmountValue' ></label>";
            // pageVM.orphanCalculator += "<input type='text'  id='amountTextBox' min='0' ng-keyup='countChangeForNonFixed()' ng-change='countChangeForNonFixed()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='pageVM.isAmount' />"
            // pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label id='amountLabel'>{{ 'AMOUNT' | translate }}</label>";

            pageVM.orphanCalculator +=
              "<select  class='form-control' ng-change='countChangeForNonFixed()' ng-model='amountValueForNonFixed'>";
            pageVM.orphanCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.orphanCalculator +=
              "<option data-ng-repeat='price in prices' ng-value='price'>{{selectedCurrencySymbol}} {{price}}</option>";
            pageVM.orphanCalculator += "</select></div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'COUNT' | translate }}</label>";
            pageVM.orphanCalculator +=
              "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeForNonFixed()'>";
            pageVM.orphanCalculator +=
              "<option ng-value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.orphanCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'TOTAL AMOUNT' | translate }}</label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'AMOUNT' | translate }}</label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }

          pageVM.orphanCalculator +=
            `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "</div>";

          pageVM.orphanCalculator +=
            `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
          pageVM.orphanCalculator +=
            "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
          pageVM.orphanCalculator += "   </div>";
          pageVM.orphanCalculator += "</div>";
        }
      }
      let calculator = $compile(pageVM.orphanCalculator)($scope);
      angular
        .element(document.getElementById("orphanCalculator"))
        .html("")
        .append(calculator);
      $scope.selectedCount = undefined;
      $scope.amountValueForNonFixed = undefined;
      $scope.selectedDescend = undefined;
      $scope.selectedGender = undefined;
    }

    $scope.user = {};

    projectService.getDonationDuration().then(function (res) {
      var currentMonth = new Date().getMonth() + 1;
      //var currentMonth = 7;
      if (currentMonth == 1 || currentMonth == 12) {
        var donation = [];
        donation.push($filter("filter")(res.data, { noOfMonths: 6 })[0]);
        $scope.donationDurations = donation;
      } else if (currentMonth >= 7 || currentMonth <= 11) {
        var donation = [];
        donation.push($filter("filter")(res.data, { noOfMonths: 12 })[0]);
        donation.push($filter("filter")(res.data, { noOfMonths: 6 })[0]);
        $scope.donationDurations = donation;
      }
    });

    function getDzCalculator(projectDetail) {
      pageVM.orphanCalculator = "";
      $scope.commentTxt = "";
      $scope.user.roles = [];
      if (projectDetail != undefined) {
        pageVM.subCategories = projectDetail.programSubCategory;
        if (
          pageVM.subCategories != undefined
            ? pageVM.subCategories.length > 0
            : false
        ) {
          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label >{{ 'SUB CATEGORY' | translate}}</label>";
          pageVM.orphanCalculator +=
            "<select  class='form-control' ng-model='pageVM.selectedCategory' ng-change='pageVM.checkSubCategory()' ng-options='x.programSubCategoryName for x in pageVM.subCategories'>";
          pageVM.orphanCalculator += "</select>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
        }
        let donationProcess = projectDetail.donationProcess[0];
        //if Amount is Fixed
        if (donationProcess.isAmount) {
          var obj = new Object();
          obj.currency = JSON.parse(sessionStorage.getItem("currency"));
          if (obj.currency.title == "USD") {
            let fixedAmount = Math.round(donationProcess.amount).toFixed(2);
            $scope.amountValue = fixedAmount;
          } else {
            let fixedAmount =
              obj.currency.rateExchange * donationProcess.amount;
            $scope.amountValue = currencyService.currencyConversionFormula(
              fixedAmount
            )
          }

          // pageVM.orphanCalculator += "</select>";
          // pageVM.orphanCalculator += "</div>";
          pageVM.amount = Math.round(donationProcess.amount).toFixed(2);
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'DURATION' | translate}}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control' ng-model='selectedDonationDuration' data-ng-change='durationForOneTimeAndRecurring()' ng-options='x.donationDurationName for x in donationDurations'>";
            pageVM.orphanCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'PAYMENT METHOD' | translate}}</label>";
            pageVM.orphanCalculator +=
              // "<select  class='form-control' ng-model='selectedRecurring' ng-change='countChangeDz()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
              "<input type='text' min='1' disabled='true' autocomplete='off'  id='amountTextBox' ng-value='paymentMethod' class='form-control' />";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<div class='col-md-6' ng-show='selectedRecurring'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate}}</label>";
            // pageVM.orphanCalculator += "<div class='input-group date'>";
            // pageVM.orphanCalculator += "<div class='input-group-addon'>";
            // pageVM.orphanCalculator += "<i class='fa fa-calendar'></i>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<script>";
            pageVM.orphanCalculator += "jQuery('#txtFromDate').datepicker({";
            pageVM.orphanCalculator += " autoclose: true";
            pageVM.orphanCalculator += "});";
            pageVM.orphanCalculator += "</script>";

            if (donationProcess.isSyed) {
              pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
              pageVM.orphanCalculator += "<div class='form-group'>";
              pageVM.orphanCalculator +=
                " <label >{{ 'DESCEND' | translate}}</label>";
              pageVM.orphanCalculator +=
                "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
              pageVM.orphanCalculator += "</select>";
              pageVM.orphanCalculator += "</div>";
              pageVM.orphanCalculator += "</div>";
            }
            // jQuery("#project-calculator").append(pageVM.orphanCalculator);
          }

          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label id='amountLabel'>{{ 'AMOUNT' | translate}}</label>";
          pageVM.orphanCalculator += " <label id='fixedAmountValue' ></label>";
          pageVM.orphanCalculator += "<div class='input-group'>";
          pageVM.orphanCalculator += "<div class='input-icon'>";
          pageVM.orphanCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off' id='amountTextBox' ng-keyup='countChange()' data-ng-model='amountValue' readonly class='form-control' ng-disabled='pageVM.isAmount' />";
          pageVM.orphanCalculator +=
            "<i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";

          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'COUNT' | translate}}</label>";
            pageVM.orphanCalculator +=
              "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChangeDz()'>";
            pageVM.orphanCalculator +=
              "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.orphanCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }
          pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
          pageVM.orphanCalculator += "<div class='form-group'>";
          pageVM.orphanCalculator +=
            " <label >{{ 'TOTAL AMOUNT' | translate}}</label>";
          pageVM.orphanCalculator += " <div class='input-group'>";
          pageVM.orphanCalculator += "<div class='input-icon'>";
          pageVM.orphanCalculator +=
            "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
          pageVM.orphanCalculator +=
            " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "</div>";
          pageVM.orphanCalculator += "<div class='row col-md-12 form-group'>";
          pageVM.orphanCalculator +=
            " <label><span class='commentTxt'>{{commentTxt}}</span></label>";
          pageVM.orphanCalculator += "</div>";
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator +=
              "<div class='col-md-12  col-xs-12 centered'>";
            pageVM.orphanCalculator +=
              "  <div class='form-group col-md-6' style='float:none;'>";
            pageVM.orphanCalculator +=
              "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
            pageVM.orphanCalculator += `data-target='#studentListModal' ng-click='getStudentsByCount(selectedCount)' ng-if='!hideBtn && selectedCount > 0 ? true : false'>{{'SELECT STUDENTS' | translate}}</button>`;
            pageVM.orphanCalculator += "  </div>";
            pageVM.orphanCalculator += "</div>";

            //pageVM.orphanCalculator += "<div ng-show='user.roles.length > 0 ? true : false'>";
            pageVM.orphanCalculator +=
              "<div ng-show='(user.roles.length > 0 && selectedCount == user.roles.length) ? true : false'>";
            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator +=
              "<div class='col-md-12 col-xs-12 centered'>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal' style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
          }
        }
        //NOT FOR FIXED AMOUNT
        else {
          $scope.amountIsAmount = false;
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'DURATION' | translate}}</label>";
            pageVM.orphanCalculator +=
              "<select class='form-control' ng-model='selectedDonationDuration'  ng-options='x.donationDurationName for x in donationDurations'>";
            pageVM.orphanCalculator +=
              "<option value=''>---{{'PLEASE SELECT' | translate}}---</option>";
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'PAYMENT METHOD' | translate}}</label>";
            pageVM.orphanCalculator +=
              "<select  class='form-control' ng-change='durationForRecurring()' ng-model='selectedRecurring'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='false'>{{'ONETIME' | translate}}</option><option ng-value='true'>{{'RECURRING' | translate}}</option></select>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            // pageVM.orphanCalculator += "<div class='col-md-6' ng-show='selectedRecurring'>";
            // pageVM.orphanCalculator += "<div class='form-group'>";
            // pageVM.orphanCalculator += "<label for=''>{{ 'PAYMENT DATE' | translate}}</label>";
            // pageVM.orphanCalculator += "<div class='input-group date'>";
            // pageVM.orphanCalculator += "<div class='input-group-addon'>";
            // pageVM.orphanCalculator += "<i class='fa fa-calendar'></i>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "<input type='text' readonly id='txtFromDate' ng-click='setPosFromDate();' ng-change='startDateChange()' class='form-control pull-right readonly ng-pristine ng-untouched ng-valid ng-empty' ng-model='paymentDate'>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";
            // pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<script>";
            pageVM.orphanCalculator += "jQuery('#txtFromDate').datepicker({";
            pageVM.orphanCalculator += " autoclose: true";
            pageVM.orphanCalculator += "});";
            pageVM.orphanCalculator += "</script>";

            if (donationProcess.isSyed) {
              pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
              pageVM.orphanCalculator += "<div class='form-group'>";
              pageVM.orphanCalculator +=
                " <label >{{ 'DESCEND' | translate}}</label>";
              pageVM.orphanCalculator +=
                "<select class='form-control' ng-model='selectedDescend' ng-change='clearOrphans()'><option value=''>---{{'PLEASE SELECT' | translate}}---</option><option ng-value='true'>{{'SYED' | translate}}</option><option ng-value='false'>{{'NONSYED' | translate}}</option>";
              pageVM.orphanCalculator += "</select>";
              pageVM.orphanCalculator += "</div>";
              pageVM.orphanCalculator += "</div>";
            }
          }

          pageVM.isCount = donationProcess.isCount;
          if (donationProcess.isCount) {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'COUNT' | translate}}</label>";
            pageVM.orphanCalculator +=
              "   <select class='form-control' data-ng-model='selectedCount' ng-change='countChange()'>";
            pageVM.orphanCalculator +=
              "<option value='{{'PLEASE SELECT' | translate}}'>---{{'PLEASE SELECT' | translate}}---</option>";
            let min = Math.round(donationProcess.countMin);
            let max = Math.round(donationProcess.countMax);
            var interval = Math.round(donationProcess.interval);
            for (let i = min; i <= max; i += interval) {
              pageVM.orphanCalculator +=
                "      <option ng-value='" + i + "'>" + i + "</option>";
            }
            pageVM.orphanCalculator += "</select>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label id='amountLabel'>{{ 'AMOUNT' | translate}}</label>";
            pageVM.orphanCalculator +=
              " <label id='fixedAmountValue' ></label>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off'  id='amountTextBox' min='0' ng-keyup='countChange()' ng-change='countChange()' data-ng-model='amountValueForNonFixed'  class='form-control' ng-disabled='pageVM.isAmount' />";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "  </div>";

            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'TOTAL AMOUNT' | translate}}<span ng-show='selectedRecurring' style='color:green;font-size:10px;'>(Per Month)</span></label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount'/>";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator += "<div class='col-md-6 col-xs-12'>";
            pageVM.orphanCalculator += "<div class='form-group'>";
            pageVM.orphanCalculator +=
              " <label >{{ 'AMOUNT' | translate}}</label>";
            pageVM.orphanCalculator += " <div class='input-group'>";
            pageVM.orphanCalculator += "<div class='input-icon'>";
            pageVM.orphanCalculator +=
              "<input type='text' min='1' ng-keypress='isNumberKey($event)' autocomplete='off'   data-ng-disabled='pageVM.isCount' class='form-control' data-ng-model='totalAmount' />";
            pageVM.orphanCalculator +=
              " <i style='font-style: normal;' class=''>{{selectedCurrencySymbol}}</i>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";
          }
          if (donationProcess.isRecurring) {
            pageVM.orphanCalculator += "<div class='col-md-12 centered'>";
            pageVM.orphanCalculator +=
              "  <div class='form-group col-md-6 col-xs-12' style='float:none;'>";
            pageVM.orphanCalculator +=
              "   <button class='grop-btn  grop-btn_submit' data-toggle='modal'";
            pageVM.orphanCalculator +=
              " data-target='#studentListModal' ng-click='getStudentsByCount(selectedCount)' ng-show='selectedDescend == undefined ? false : true && selectedCount > 0 ? true : false'>{{'SELECT STUDENTS' | translate}}</button>";
            pageVM.orphanCalculator += "  </div>";
            pageVM.orphanCalculator += "  </div>";

            pageVM.orphanCalculator +=
              "<div ng-show='user.roles.length > 0 ? true : false'>";
            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
          } else {
            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage !== "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";

            pageVM.orphanCalculator +=
              `<div class='col-md-12 col-xs-12 centered' ng-if='pageVM.browserLanguage == "ARB"'>`;
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-donate grop-btn_submit grop-btn-addcart-cal' data-ng-click='pageVM.donate();'>{{ 'DONATE NOW' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "   <div class='col-md-4 col-xs-12'>";
            pageVM.orphanCalculator +=
              "      <button class='grop-btn-addcart grop-btn_submit grop-btn-addcart-cal'  style='' data-ng-click='pageVM.addCartItem();'>{{ 'ADD TO CART' | translate }}</button>";
            pageVM.orphanCalculator += "   </div>";
            pageVM.orphanCalculator += "</div>";
          }
        }
      }
      let calculator = $compile(pageVM.orphanCalculator)($scope);
      angular
        .element(document.getElementById("orphanCalculator"))
        .html("")
        .append(calculator);
      $scope.selectedCount = undefined;
      $scope.amountValueForNonFixed = undefined;
      $scope.selectedDescend = undefined;
      $scope.selectedGender = undefined;
    }

    //********* ORPHANS END *********/

    function donateProjects() {
      if (pageVM.clickedDonate) {
        return;
      }
      pageVM.clickedDonate = true;
      var obj = new Object();
      if (pageVM.projectDetail) {
        obj.program = pageVM.projectDetail;
        if (!validation(obj.program)) return pageVM.clickedDonate = false;
      } else {
        obj.program = pageVM.selectedProject;
        if (!validation(obj.program)) return pageVM.clickedDonate = false;
      }
      // obj.userId = pageVM.user.userId;
      // obj.userName = pageVM.user.username;

      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }

      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }

      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if (
          $scope.totalAmount >= 0 &&
          $scope.totalAmount < minimiumAmountForDonation
        ) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      // else {

      // }
      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      obj.programSubCategory = pageVM.selectedCategory;
      obj.isRecurring = pageVM.selectedRecurring;
      obj.donationDuration = pageVM.selectedDonationDuration || $scope.selectedDonationDuration;

      if (pageVM.selectedRecurring == true) {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      $scope.recurringOrOneTime = pageVM.selectedRecurring;

      // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // localStorage.setItem("cart", null);
      // localStorage.setItem("cart", JSON.stringify(obj));
      // if ($rootScope.isLogin) {
      //     $window.location.href = "/#/checkout";
      // } else {
      //     jQuery("#globalLoginModal").modal("show");
      // }

      // -------------------------------------------
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      cartService.addCartItem(obj).then(function () {
        // if ($rootScope.isLogin) {
        $rootScope.$broadcast("getCartCounter");
        $state.go("cart");
        pageVM.clickedDonate = false;
        // } else {
        //   jQuery("#globalLoginModal").modal("show");
        // }
      });
    }

    function donateOrphans() {
      var obj = new Object();
      if (pageVM.clickedDonate) return;
      pageVM.clickedDonate = true;
      if ($scope.selectedGc) {
        obj.program = $scope.selectedGc;
      } else if ($scope.selectedDz) {
        obj.program = $scope.selectedDz;
      }
      if (!validation(obj.program)) return pageVM.clickedDonate = false;

      // obj.userId = vm.user.userId;
      // obj.userName = vm.user.username;
      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }

      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if (
          $scope.totalAmount >= 0 &&
          $scope.totalAmount < minimiumAmountForDonation
        ) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      if (obj.program.donationProcess[0].isDuration) {
        // if(!$scope.selectedDonationDuration) return showError();
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      obj.programSubCategory = pageVM.selectedCategory;
      obj.isRecurring = $scope.selectedRecurring;
      if ($scope.selectedRecurring) {
        obj.donationDuration = $scope.selectedRecurring;

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }


      obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
      obj.isAutoRenew = $scope.isAutoRenew;
      obj.paymentPlan = $scope.selectedPaymentPlan;
      obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount

      if ($scope.selectedRecurring) {
        obj.donationDuration =
          $scope.donationDurationsYearly || $scope.selectedDonationDuration;
        var startDate = new Date();
        var endDate = new Date();
        if ($scope.selectedGc) {
          endDate.setDate(endDate.getDate() + 365);
        } else {
          endDate.setMonth(
            endDate.getMonth() + obj.donationDuration.noOfMonths
          );
        }

        obj.startDate =
          "" +
          (startDate.getMonth() + 1 < 10 ? "0" : "") +
          (startDate.getMonth() + 1) +
          "/" +
          (startDate.getDate() < 10 ? "0" : "") +
          startDate.getDate() +
          "/" +
          startDate.getFullYear() +
          "";

        obj.endDate =
          "" +
          (endDate.getMonth() + 1 < 10 ? "0" : "") +
          (endDate.getMonth() + 1) +
          "/" +
          (endDate.getDate() < 10 ? "0" : "") +
          endDate.getDate() +
          "/" +
          endDate.getFullYear() +
          "";

        obj.paymentDate = $scope.paymentDate;
      }

      if ($scope.user.roles.length > 0) {
        if ($scope.selectedGc) {
          obj.orphans = $scope.user.roles;
        } else if ($scope.selectedDz) {
          obj.students = $scope.user.roles;
        }
      }

      // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // localStorage.setItem("cart", null);
      // localStorage.setItem("cart", JSON.stringify(obj));
      // if ($rootScope.isLogin) {
      //     $window.location.href = "/#/checkout";
      // } else {
      //     jQuery("#globalLoginModal").modal("show");
      // }
      obj.donationDuration = $scope.donationDurationsYearly || $scope.selectedDonationDuration;

      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      if (obj.program && obj.program.slug === "home-renovation") {
        const index = $scope.prices.findIndex(i => i == $scope.amountValueForNonFixed);
        obj.currency.hajjAmount = $scope.originalPrices[index];
      }




      let addToCart = true;
      cartService.getCartDetail().then(function (result) {
        if (obj.isRecurringProgram) {
          if (result && result.data.items.length > 0) {
            const found = result.data.items.some(item => item.isRecurringProgram);
            if (found) {
              addToCart = false;
              pageVM.clickedDonate = false;


              let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddOrphan);

              eventLogsService.addEventLog(eventObj);


              swal({
                title: $translate.instant('MULTIPLE_RECURRING_ITEM_ALERT'),
                position: 'center-center',
                type: 'error',
                allowOutsideClick: false,
                html: utilService.createProgramListForErrorMessage(obj, result),
                confirmButtonText: $translate.instant("Yes")
              });
            }
          }
        }

        if (addToCart) {
          cartService.addCartItem(obj).then(function () {
            // if ($rootScope.isLogin) {
            $rootScope.$broadcast("getCartCounter");
            $state.go("cart");
            pageVM.clickedDonate = false;
            // } else {
            //   jQuery("#globalLoginModal").modal("show");
            // }
          });

          if (obj.orphans) {
            // update blocking date in in orphan table 
            orphanService.updateSelectedOrphan(obj.orphans).then(function (resp) {
            });
          }
        }

      });



    }

    function donateIslamicPayments() {
      var obj = new Object();
      if (pageVM.clickedDonate) return;
      pageVM.clickedDonate = true;
      if (pageVM.religiousPaymentDetail) {
        obj.program = pageVM.religiousPaymentDetail;
      } else {
        obj.program = pageVM.selectedReligiousPayment;
      }
      if (!validation(obj.program)) return pageVM.clickedDonate = false;
      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }

      if (obj.program.donationProcess[0].isMarhomeenName) {
        obj.marhomeenName = $scope.marhomeenName;
        obj.comment = $scope.marhumeenComment;
      }
      if (pageVM.otherFieldForNiyaz) {
        obj.otherPersonalityName = pageVM.otherFieldForNiyaz;
      }

      if ((obj.program.donationProcess[0].isCalendar && pageVM.selectedReligiousPayment.slug != '-niyaz') || (obj.program.donationProcess[0].isCalendar && pageVM.selectedReligiousPayment.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {
        obj.calendarForSacrifice = $scope.calendarForSacrifice;
        if (!obj.calendarForSacrifice) {
          pageVM.clickedDonate = false;
          return showError();
        };
      }
      if (!!obj.program.programSubCategory) {
        obj.fitrahSubType = $scope.selectedFitrahSubType;
        if (obj.fitrahSubType !== undefined && !obj.fitrahSubType) {
          pageVM.clickedDonate = false;
          return showError();

        }
      }


      if ($scope.selectedCategory.amountBasedOnCountry) {
        if ($scope.qurbaniPerformPlace) {
          obj.performLocation = $scope.qurbaniPerformPlace;
        }
        if (!obj.performLocation) {
          pageVM.clickedDonate = false;
          return showError();
        };

      }


      if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {
        if ($scope.childName) {
          obj.aqiqaChildName = $scope.childName;
        }
        if (!obj.aqiqaChildName) {
          pageVM.clickedDonate = false;
          return showError();
        };


      }

      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      if (!!$scope.selectedCategory) {
        obj.programSubCategory = $scope.selectedCategory;
        if ($scope.selectedCategory.isSDOZ) {
          obj.sdoz = $scope.selectedSDOZ;
        }
        if ($scope.selectedCategory.isSahm) {
          obj.sahm = $scope.selectedSahm;
          if (!obj.sahm) {
            pageVM.clickedDonate = false;
            return showError()
          };
        }
        if (!obj.programSubCategory) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }
      if (
        $scope.selectedCountryOfResidence !== undefined &&
        $scope.selectedCountryOfResidence !== ""
      ) {
        obj.countryOfResidence = $scope.selectedCountryOfResidence;
        if (!obj.countryOfResidence) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }
      obj.isRecurring = pageVM.selectedRecurring;
      if (pageVM.selectedRecurring) {
        obj.donationDuration = pageVM.selectedRecurring;
        if (obj.donationDuration !== false && !obj.donationDuration) {
          pageVM.clickedDonate = false;
          return showError();
        }

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }

      if (pageVM.selectedRecurring) {
        obj.donationDuration = pageVM.selectedDonationDuration;
        if (obj.donationDuration != false && !obj.donationDuration) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }

      if (obj.program.isSyed) {
        obj.descend = $scope.selectedDescend;
        if (obj.descend !== false && !obj.descend) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }

      if ($scope.ocassionList && $scope.ocassionList.length > 0) {
        obj.occasion = pageVM.selectedOccasion;
        if (!obj.occasion) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }

      if ($scope.duaList && $scope.duaList.length > 0) {
        obj.dua = pageVM.selectedDua;
        if (!obj.dua) {
          pageVM.clickedDonate = false;
          return showError();
        }
      }
      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if ($scope.totalAmount < minimiumAmountForDonation) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // localStorage.setItem("cart", null);
      // localStorage.setItem("cart", JSON.stringify(obj));
      // if ($rootScope.isLogin) {
      //     $window.location.href = "/#/checkout";
      // } else {
      //     jQuery("#globalLoginModal").modal("show");
      // }

      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      obj.currency.hajjAmount = pageVM.hajjAmount;

      cartService.addCartItem(obj).then(function () {
        // if ($rootScope.isLogin) {
        $rootScope.$broadcast("getCartCounter");
        $state.go("cart");
        pageVM.clickedDonate = false;
        // } else {
        //   jQuery("#globalLoginModal").modal("show");
        // }
      });
    }

    function donateSadaqa() {
      var obj = new Object();
      if (pageVM.clickedDonate) return;
      pageVM.clickedDonate = true;
      if (pageVM.sadaqaDetail) {
        obj.program = pageVM.sadaqaDetail;
        obj.totalAmount = pageVM.sadaqa.totalAmount;
        if (!validation(obj.program)) return pageVM.clickedDonate = false;
      } else {
        obj.program = pageVM.selectedSadaqa;
        if (!validation(obj.program)) return pageVM.clickedDonate = false;
      }

      // obj.userId = pageVM.user.userId;
      // obj.userName = pageVM.user.username;

      if ($scope.checkBoxNotChecked) {
        if (
          $scope.selectedCategory != null &&
          $scope.selectedCategory.length > 0
        ) {
          obj.programSubCategory = $scope.selectedCategory;
        }
      } else {
        if (pageVM.otherPersonalityTextBox != null) {
          obj.otherPersonalityName = pageVM.otherPersonalityTextBox;
        }
      }
      obj.otherPersonalityName = pageVM.selectedDonationDuration && pageVM.selectedDonationDuration.donationDurationName || obj.otherPersonalityName;
      ;
      obj.totalAmount =
        parseInt($scope.amount) || parseInt($scope.totalAmount) || parseInt(pageVM.sadaqa.totalAmount);
      $scope.selectedRecurringType = false;
      obj.isRecurring = $scope.selectedRecurringType;
      obj.paymentPlan = $scope.selectedPaymentPlan;
      obj.isRecurringProgram = obj.program && obj.program.isRecurringProgram;
      if ($scope.selectedRecurringType) {
        obj.donationDuration = $scope.selectedRecurringType;

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      if ($scope.selectedRecurringType) {
        obj.donationDuration = pageVM.selectedDonationDuration;
      }
      //Validations
      if (
        obj.program.programSubCategory != null &&
        obj.program.programSubCategory.length > 0
      ) {
        if ($scope.checkBoxNotChecked) {
          if (
            $scope.selectedCategory == null ||
            $scope.selectedCategory.length == 0
          ) {
            pageVM.clickedDonate = false;
            return showError();
          }
        } else {
          // if (!$scope.otherPersonalityTextBox) return showError();
        }
      }
      if (obj.program.donationProcess[0].isRecurring) {
        if ($scope.selectedRecurringType == undefined) {
          //stop and ask to select payment type
          pageVM.clickedDonate = false;
          return showError();
        } else if ($scope.selectedRecurringType) {
          if (pageVM.selectedDonationDuration == undefined) {
            //stop and ask to select duration
            pageVM.clickedDonate = false;
            return showError();
          }
        }
      }
      if (obj.totalAmount == undefined) {
        pageVM.clickedDonate = false;
        return showError();
      }
      $scope.totalAmount =
        $scope.totalAmount || (pageVM.sadaqa && pageVM.sadaqa.totalAmount);
      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        let minAmountmsg;
        if (
          $scope.totalAmount >= 0 &&
          $scope.totalAmount < minimiumAmountForDonation
        ) {
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }

      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clickedDonate = false;
        }
      }
      // obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // localStorage.setItem("cart", null);
      // localStorage.setItem("cart", JSON.stringify(obj));
      // if ($rootScope.isLogin) {
      //     $window.location.href = "/#/checkout";
      // } else {
      //     jQuery("#globalLoginModal").modal("show");
      // }
      if ($scope.selectedCategory != null) {
        obj.programSubCategory = $scope.selectedCategory;
      }
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));

      cartService.getCartDetail().then(function (result) {
        let addToCart = checkForMultipleRecurringPrograms(obj, result);
        if (addToCart) {
          cartService.addCartItem(obj).then(function () {

            $rootScope.$broadcast("getCartCounter");
            $state.go("cart");
            pageVM.clickedDonate = false;

          });

        }

      });

      // cartService.addCartItem(obj).then(function (res) {
      //     if ($rootScope.isLogin) {
      //         $window.location.href = "/#/checkout";
      //     } else {
      //         jQuery('#globalLoginModal').modal('show');
      //     }
      // });
    }

    function addCartProjects(tab) {
      var obj = new Object();
      if (pageVM.clikedCart) return;
      pageVM.clikedCart = true;
      if (pageVM.projectDetail) {
        obj.program = pageVM.projectDetail;
        if (!validation(pageVM.projectDetail)) {
          return pageVM.clikedCart = false;
        }
      } else {
        obj.program = pageVM.selectedProject;
        if (!validation(pageVM.selectedProject)) {
          return pageVM.clikedCart = false;
        }
      }
      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }

      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if ($scope.totalAmount < minimiumAmountForDonation) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false;
        }
      }
      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false;
        }
      }

      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      obj.programSubCategory = pageVM.selectedCategory;
      obj.isRecurring = pageVM.selectedRecurring;
      obj.otherPersonalityName = pageVM.selectedDonationDuration && pageVM.selectedDonationDuration.donationDurationName;

      obj.donationDuration = pageVM.selectedDonationDuration || $scope.selectedDonationDuration;
      obj.isRecurring = pageVM.selectedRecurring;
      if (pageVM.selectedRecurring == true) {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      cartService.addCartItem(obj).then(function (res) {
        $scope.clearFastDonationForm(tab);
        $rootScope.$broadcast("getCartCounter");
        var note = new Noty({
          text: $translate.instant("Items added successfully")
        });
        note.setTimeout(2600);
        note.show();
        pageVM.clikedCart = false;
      });

    }

    $scope.addCartItem = function () {

      var tab = jQuery(".nav-tabs li.active")[0]
        .innerText.trim()
        .toLowerCase();
      addCartOrphans(tab);
    }

    function addCartOrphans(tab) {
      var obj = new Object();
      if (pageVM.clikedCart) return;
      pageVM.clickedCart = true;
      if ($scope.selectedGc) {
        obj.program = $scope.selectedGc;
      } else if ($scope.selectedDz) {
        obj.program = $scope.selectedDz;
      }
      if (!validation(obj.program)) return pageVM.clikedCart = false;

      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }

      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if ($scope.totalAmount < minimiumAmountForDonation) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false;
        }
      }
      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false;
        }
      }
      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      obj.programSubCategory = pageVM.selectedCategory;
      obj.isRecurring = $scope.selectedRecurring;



      obj.isRecurringProgram = $scope.selectedGc && $scope.selectedGc.isRecurringProgram;
      obj.isAutoRenew = $scope.isAutoRenew;
      obj.paymentPlan = $scope.selectedPaymentPlan;
      obj.totalSubscriptionAmount = $scope.totalSubscriptionAmount





      if ($scope.selectedRecurring) {
        obj.donationDuration = $scope.donationDurationsYaerly;
        var startDate = new Date();
        var endDate = new Date();
        endDate.setDate(endDate.getDate() + 365);
        obj.startDate =
          "" +
          (startDate.getMonth() + 1) +
          "/" +
          startDate.getDate() +
          "/" +
          startDate.getFullYear() +
          "";
        obj.endDate =
          "" +
          (endDate.getMonth() + 1) +
          "/" +
          endDate.getDate() +
          "/" +
          endDate.getFullYear() +
          "";
        obj.paymentDate = $scope.paymentDate;
        obj.paymentType = "Recurring";
      } else {
        obj.paymentType = "One Time";
      }
      if ($scope.selectedRecurring) {
        obj.donationDuration =
          $scope.donationDurationsYearly || $scope.selectedDonationDuration
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }

      if ($scope.user.roles.length > 0) {
        if ($scope.selectedGc) {
          obj.orphans = $scope.user.roles;
        } else if ($scope.selectedDz) {
          obj.students = $scope.user.roles;
        }
      }
      obj.donationDuration = $scope.donationDurationsYearly || $scope.selectedDonationDuration;
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      if (obj.program && obj.program.slug === "home-renovation") {
        const index = $scope.prices.findIndex(i => i == $scope.amountValueForNonFixed);
        obj.currency.hajjAmount = $scope.originalPrices[index];
      }



      let addToCart = true;
      cartService.getCartDetail().then(function (result) {

        if (obj.isRecurringProgram) {

          if (result && result.data.items.length > 0) {
            const found = result.data.items.some(item => item.isRecurringProgram);
            if (found) {
              addToCart = false;
              pageVM.clikedCart = false
              let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddOrphan);
              eventLogsService.addEventLog(eventObj);
              swal({
                title: $translate.instant('MULTIPLE_RECURRING_ITEM_ALERT'),
                position: 'center-center',
                type: 'error',
                allowOutsideClick: false,
                html: utilService.createProgramListForErrorMessage(obj, result),
                confirmButtonText: $translate.instant("Yes")
              });
            }
          }
        }

        if (addToCart) {
          cartService.addCartItem(obj).then(function (res) {
            $scope.clearFastDonationForm(tab);
            $rootScope.$broadcast("getCartCounter");
            pageVM.clearOrphanCalculator();
            $scope.orphanType = undefined;
            var note = new Noty({
              text: $translate.instant("Items added successfully")
            });
            note.setTimeout(2600);
            note.show();
            pageVM.clikedCart = false
          });

          if (obj.orphans) {
            // update blocking date in in orphan table 
            orphanService.updateSelectedOrphan(obj.orphans).then(function (resp) {
            });
          }



        }
      });

    }

    function addCartIslamicPayment(tab) {
      var obj = new Object();
      if (pageVM.clikedCart) return;
      pageVM.clikedCart = true;
      if (pageVM.religiousPaymentDetail) {
        obj.program = pageVM.religiousPaymentDetail;
      } else {
        obj.program = pageVM.selectedReligiousPayment;
        if (!validation(obj.program)) return pageVM.clikedCart = false;
      }

      if (obj.program.donationProcess[0].isCount) {
        obj.count = ($scope.selectedCount || 0);
      }
      if (pageVM.otherFieldForNiyaz) {
        obj.otherPersonalityName = pageVM.otherFieldForNiyaz;
      }
      if ($scope.selectedCategory.isSahm) {
        obj.sahm = $scope.selectedSahm;
        if (!obj.sahm) { pageVM.clikedCart = false; return showError(); }
      }
      if (obj.program.donationProcess[0].isMarhomeenName) {
        obj.marhomeenName = $scope.marhomeenName;
        obj.comment = $scope.marhumeenComment;
      }



      if ((obj.program.donationProcess[0].isCalendar && pageVM.selectedReligiousPayment.slug != '-niyaz') || (obj.program.donationProcess[0].isCalendar && pageVM.selectedReligiousPayment.slug == '-niyaz' && ($scope.selectedCategory.slug == '-others' || $scope.selectedCategory.slug == 'others'))) {
        obj.calendarForSacrifice = $scope.calendarForSacrifice;
        if (!obj.calendarForSacrifice) { pageVM.clikedCart = false; return showError(); }
      }
      if (obj.program.donationProcess[0].isFirtahSubType) {
        obj.fitrahSubType = $scope.selectedFitrahSubType;
        if (!obj.fitrahSubType) { pageVM.clikedCart = false; return showError(); }
      }
      if (
        $scope.selectedCountryOfResidence !== undefined &&
        $scope.selectedCountryOfResidence !== ""
      ) {
        obj.countryOfResidence = $scope.selectedCountryOfResidence;
        if (!obj.countryOfResidence) { pageVM.clikedCart = false; return showError(); }
      }
      // obj.userId = pageVM.user.userId;
      // obj.userName = pageVM.user.username;


      
      if ($scope.selectedCategory.amountBasedOnCountry) {

        if ($scope.qurbaniPerformPlace) {
          obj.performLocation = $scope.qurbaniPerformPlace;
        }
        if (!obj.performLocation) {
          pageVM.clikedCart = false;
          return showError();
        };

      }


      if (religiousPaymentDetailAfterSelection.slug == "qurbani-(sacrifice)" && ($scope.selectedCategory.slug == '-aqiqa' || $scope.selectedCategory.slug == 'aqiqa-')) {
        if ($scope.childName) {
          obj.aqiqaChildName = $scope.childName;
        }
        if (!obj.aqiqaChildName) {
          pageVM.clikedCart = false;
          return showError();
        };


      }



      obj.totalAmount = Math.round($scope.totalAmount || 0).toFixed(2);
      if (!!$scope.selectedCategory) {
        obj.programSubCategory = $scope.selectedCategory;
        if ($scope.selectedCategory.isSDOZ) {
          obj.sdoz = $scope.selectedSDOZ;
        }
      }
      obj.isRecurring = pageVM.selectedRecurring;
      if (pageVM.selectedRecurring) {
        obj.donationDuration = pageVM.selectedDonationDuration;
        if (obj.donationDuration != false && !obj.donationDuration) {
          pageVM.clikedCart = false;
          return showError();
        }

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      if ($scope.selectedCategory.isSahm) {
        obj.sahm = $scope.selectedSahm;
        if (!obj.sahm) { pageVM.clikedCart = false; return showError(); }
      }
      if (obj.program.isSyed) {
        obj.descend = $scope.selectedDescend;
        if (obj.descend !== false && !obj.descend) { pageVM.clikedCart = false; return showError(); }
      }

      if ($scope.ocassionList && $scope.ocassionList.length > 0) {
        obj.occasion = pageVM.selectedOccasion;
        if (!obj.occasion) { pageVM.clikedCart = false; return showError(); }
      }

      if ($scope.duaList && $scope.duaList.length > 0) {
        obj.dua = pageVM.selectedDua;
        if (!obj.dua) { pageVM.clikedCart = false; return showError(); }
      }
      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if ($scope.totalAmount < minimiumAmountForDonation) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false
        }
      }
      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false
        }
      }
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      obj.currency.hajjAmount = pageVM.hajjAmount;

      cartService.addCartItem(obj).then(function (res) {
        $scope.clearFastDonationForm(tab);
        $rootScope.$broadcast("getCartCounter");
        var note = new Noty({
          text: $translate.instant("Items added successfully")
        });
        note.setTimeout(2600);
        note.show();
        pageVM.clikedCart = false;
      });
    }

    function addCartSadaqa(tab) {
      var obj = new Object();
      if (pageVM.clikedCart) return;
      pageVM.clikedCart = true;
      if (pageVM.sadaqaDetail) {
        obj.program = pageVM.sadaqaDetail;
      } else {
        obj.program = pageVM.selectedSadaqa;
      }
      obj.totalAmount = pageVM.sadaqa.totalAmount;
      if (!validation(obj.program)) return pageVM.clikedCart = false

      let minimiumAmountForDonation =
        obj.program.donationProcess[0].minimumAmount;

      // obj.userId = pageVM.user.userId;
      // obj.userName = pageVM.user.username;


      obj.programSubCategory = pageVM.selectedCategory;
      obj.totalAmount =
        parseInt($scope.amount) || parseInt($scope.totalAmount) || parseInt(pageVM.sadaqa.amount);
      $scope.selectedRecurringType = false;
      obj.isRecurring = $scope.selectedRecurringType;
      obj.otherPersonalityName = pageVM.selectedDonationDuration && pageVM.selectedDonationDuration.donationDurationName;

      // if ( == "true") {
      //     obj.donationDuration = pageVM.selectedDonationDuration;
      // }

      // New fields when opening sadaqah-a-day recurring module
      obj.paymentPlan = $scope.selectedPaymentPlan;
      obj.isRecurringProgram = obj.program && obj.program.isRecurringProgram;

      if ($scope.selectedRecurringType) {
        obj.donationDuration = pageVM.selectedDonationDuration;

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      //Validations
      $scope.totalAmount = Math.round($scope.totalAmount || pageVM.sadaqa.totalAmount).toFixed(2);
      obj.totalAmount = Math.round($scope.totalAmount).toFixed(2);
      if (
        obj.program.programSubCategory != null &&
        obj.program.programSubCategory.length > 0
      ) {
        if ($scope.checkBoxNotChecked) {
          if (
            $scope.selectedCategory == null ||
            $scope.selectedCategory.length == 0
          ) {
            pageVM.clikedCart = false;
            return showError();
          }
        } else {
          // if (!$scope.otherPersonalityTextBox) {pageVM.clikedCart = false; return showError();}
        }
      }
      if (obj.program.donationProcess[0].isRecurring) {
        if ($scope.selectedRecurringType == undefined) {
          //stop and ask to select payment type
          pageVM.clikedCart = false;
          return showError();
        } else if ($scope.selectedRecurringType) {
          if (pageVM.selectedDonationDuration == undefined) {
            //stop and ask to select duration
            pageVM.clikedCart = false;
            return showError();
          }
        }
      }
      if ($scope.checkBoxNotChecked) {
        if ($scope.selectedCategory != null) {
          obj.programSubCategory = $scope.selectedCategory;
        }
      } else {
        if (pageVM.otherPersonalityTextBox != null) {
          obj.otherPersonalityName = pageVM.otherPersonalityTextBox;
        }
      }
      obj.otherPersonalityName = pageVM.selectedDonationDuration && pageVM.selectedDonationDuration.donationDurationName || obj.otherPersonalityName;
      if (
        $scope.totalAmount >= 0 &&
        $scope.totalAmount < minimiumAmountForDonation
      ) {
        let minAmountmsg;

        let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
        if (pageVM.browserLanguage == "ARB") {
          minAmountmsg =
            currency +
            minimiumAmountForDonation.toString() +
            "الحد الأدنى للمساهمة في هذه الفئة هو";
        } else if (pageVM.browserLanguage == "FRN") {
          minAmountmsg =
            "Le montant minimum pour cette catégorie est " +
            currency +
            minimiumAmountForDonation.toString();
        } else {
          minAmountmsg =
            "The minimum donation amount for this category is " +
            currency +
            minimiumAmountForDonation.toString();
        }
        swal({
          title: minAmountmsg,
          position: "center-center",
          type: "error",
          allowOutsideClick: false
        });
        return pageVM.clikedCart = false
      }
      if (obj.program.donationProcess[0].isDuration) {
        let durationEndDate = obj.program.donationProcess[0].durationEndDate;
        var newEndDate = new Date(durationEndDate);
        var todayDate = new Date();
        var startDate = new Date(obj.program.donationProcess[0].durationStartDate);
        todayDate.setHours(0, 0, 0, 0);
        if (todayDate < startDate || newEndDate < todayDate) {
          let validateMsg;
          if (pageVM.browserLanguage == "ARB") {
            validateMsg = ".هذه الفئة غير متوفرة حاليا";
          } else if (pageVM.browserLanguage == "FRN") {
            validateMsg = "Cette catégorie est indisponible pour le moment.";
          } else {
            validateMsg = "This category is currently unavailable.";
          }
          swal({
            title: validateMsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false
        }
      }
      // obj.totalAmount = $scope.amount;

      if ($scope.selectedRecurringType) {
        obj.donationDuration = pageVM.selectedDonationDuration;

        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "متكرر";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Périodique";
        } else {
          obj.paymentType = "Recurring";
        }
      } else {
        if (pageVM.browserLanguage == "ARB") {
          obj.paymentType = "مرة واحدة";
        } else if (pageVM.browserLanguage == "FRN") {
          obj.paymentType = "Une fois";
        } else {
          obj.paymentType = "One Time";
        }
      }
      //Validations
      if (!pageVM.sadaqa.amount) {
        if (
          obj.program.programSubCategory != null &&
          obj.program.programSubCategory.length > 0
        ) {
          if ($scope.checkBoxNotChecked) {
            if (
              $scope.selectedCategory == null ||
              $scope.selectedCategory.length == 0
            ) {
              pageVM.clikedCart = false;
              return showError();
            }
          } else {
            // if (!$scope.otherPersonalityTextBox) {pageVM.clikedCart = false; return showError();}
          }
        }
        // if (obj.program.donationProcess[0].isRecurring) {
        //   if (!$scope.selectedRecurringType) { pageVM.clikedCart = false; return showError(); }
        //   else if ($scope.selectedRecurringType) {
        //     if (!pageVM.selectedDonationDuration) { pageVM.clikedCart = false; return showError(); }
        //   }
        // }
      }
      if (obj.program.donationProcess[0].isMinimumAmount) {
        let minimiumAmountForDonation =
          obj.program.donationProcess[0].minimumAmount;
        if ((Math.round($scope.totalAmount || $scope.amount).toFixed(2)) < minimiumAmountForDonation) {
          let minAmountmsg;
          let currency = JSON.parse(sessionStorage.getItem("currency")).symbol;
          if (pageVM.browserLanguage == "ARB") {
            minAmountmsg =
              currency +
              minimiumAmountForDonation.toString() +
              "الحد الأدنى للمساهمة في هذه الفئة هو";
          } else if (pageVM.browserLanguage == "FRN") {
            minAmountmsg =
              "Le montant minimum pour cette catégorie est " +
              currency +
              minimiumAmountForDonation.toString();
          } else {
            minAmountmsg =
              "The minimum donation amount for this category is " +
              currency +
              minimiumAmountForDonation.toString();
          }
          swal({
            title: minAmountmsg,
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false
        }
      } else {
        if ($scope.totalAmount <= 0) {
          swal({
            title: "Total amount can not be zero.",
            position: "center-center",
            type: "error",
            allowOutsideClick: false
          });
          return pageVM.clikedCart = false
        }
      }
      if ($scope.selectedCategory != null) {
        obj.programSubCategory = $scope.selectedCategory;
      }
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));

      cartService.getCartDetail().then(function (result) {
        let addToCart = checkForMultipleRecurringPrograms(obj, result);

        if (addToCart) {
          cartService.addCartItem(obj).then(function (res) {
            $scope.clearFastDonationForm(tab);
            $rootScope.$broadcast("getCartCounter");
            var note = new Noty({
              text: $translate.instant("Items added successfully")
            });
            note.setTimeout(2600);
            note.show();
            pageVM.clikedCart = false;
          });

        }
      });
    }

    function validation(program) {
      if (program) {
        if (pageVM.sadaqa && pageVM.sadaqa.amount || pageVM.sadaqa.totalAmount) return true;
        if (!Math.round($scope.totalAmount) && !Math.round($scope.amount)) {
          return showError();
        }
        if (program.donationProcess[0].isRecurring) {
          if (
            !$scope.paymentMethod &&
            ((pageVM.selectedRecurring !== false &&
              !pageVM.selectedRecurring) ||
              ($scope.selectedRecurringType !== false &&
                !$scope.selectedRecurringType)) &&
            $scope.selectedRecurring !== false &&
            !$scope.selectedRecurring
          ) {
            return showError();
          }
        }
        if (
          program.donationProcess[0].isMarhomeenName &&
          !$scope.marhomeenName
        ) {
          return showError();
        }

        if (program.donationProcess[0].isRecurring) {
          // if (!$scope.paymentMethod) return showError();
          if (
            (pageVM.selectedRecurring == "" ||
              pageVM.selectedRecurring == null) &&
            pageVM.selectedRecurring !== false &&
            !pageVM.selectedRecurring &&
            ($scope.selectedRecurring == "" ||
              $scope.selectedRecurring == null) &&
            $scope.selectedRecurring !== false &&
            !$scope.selectedRecurring
          )
            return showError();
        }
        if (program.donationProcess[0].donationDuration.length) {
          // const name = $translate.instant(program.programName);
          if (
            program.programName != $translate.instant("HIGHER EDUCATION LOANS")
          ) {
            if (!pageVM.selectedDonationDuration) return showError();
            if (!pageVM.selectedDonationDuration && !pageVM.StartDate)
              return showError();
          }
        }

        if (program.programSubCategory.length) {
          if (pageVM.selectedCategory != null && pageVM.selectedCategory !== undefined) {
            if (!pageVM.selectedCategory.isFixedAmount) {
              if (!$scope.amountValueForNonFixed) {
                return showError();
              }
            }
          }
        } else {
          if (!program.donationProcess[0].isAmount) {
            var amount = undefined;
            if (
              jQuery("#projectCalculator input") &&
              jQuery("#projectCalculator input").length &&
              jQuery("#projectCalculator input")[0].dataset.ngModel ==
              "totalAmount"
            ) {
              amount = Math.round($scope.totalAmount).toFixed(2);
            } else {
              amount = Math.round($scope.amountValueForNonFixed || $scope.totalAmount).toFixed(2);
            }
            if (!amount) return showError();
          }
        }
        // if (program.programSubCategory && program.programSubCategory.length) {
        //     if ((program.donationProcess[0].donationDuration && !program.donationProcess[0].donationDuration.length) && !$scope.selectedCategory) return showError();
        // }
        return true;
      }
    }

    $scope.donate = function () {

      donateOrphans();

    }


    function donate() {
      var tab = jQuery(".nav-tabs li.active")[0]
        .innerText.trim()
        .toLowerCase();
      if (
        tab.toLowerCase() ==
        $translate.instant("projects".toUpperCase()).toLowerCase()
      ) {
        donateProjects();
      } else if (
        tab.toLowerCase() ==
        $translate.instant("islamic payments".toUpperCase()).toLowerCase()
      ) {
        donateIslamicPayments();
      } else if (
        tab.toLowerCase() ==
        $translate.instant("orphans".toUpperCase()).toLowerCase()
      ) {
        donateOrphans();
      } else if (
        tab.toLowerCase() ==
        $translate.instant("sadaqah".toUpperCase()).toLowerCase()
      ) {
        donateSadaqa();
      }
    }




    function addCartItem() {
      var tab = jQuery(".nav-tabs li.active")[0]
        .innerText.trim()
        .toLowerCase();
      if (
        tab.toLowerCase() ==
        $translate.instant("projects".toUpperCase()).toLowerCase()
      ) {
        addCartProjects(tab);
      } else if (
        tab.toLowerCase() ==
        $translate.instant("islamic payments".toUpperCase()).toLowerCase()
      ) {
        addCartIslamicPayment(tab);
      } else if (
        tab.toLowerCase() ==
        $translate.instant("orphans".toUpperCase()).toLowerCase()
      ) {
        addCartOrphans(tab);
      } else if (
        tab.toLowerCase() ==
        $translate.instant("sadaqah".toUpperCase()).toLowerCase()
      ) {
        addCartSadaqa(tab);
      }
    }

    $scope.clearValuesFastDonations = function () {
      $scope.amountValue = undefined;
      $scope.selectedCount = undefined;
      $scope.totalAmount = undefined;
      //pageVM.selectedProject = undefined;
      pageVM.selectedDonationDuration = undefined;
      $scope.selectedDonationDuration = undefined;
      pageVM.selectedCategory = undefined;
      $scope.amountValueForNonFixed = undefined;
      //$scope.orphanType = undefined;
      //$scope.selectedGc = undefined;
      //$scope.selectedDz = undefined;
      $scope.user.roles = [];
      //pageVM.selectedReligiousPayment = undefined;
      $scope.selectedFitrahSubType = undefined;
      $scope.selectedCountryOfResidence = "";
      $scope.selectedDescend = undefined;
      $scope.selectedSahm = undefined;
      pageVM.otherFieldForNiyaz = "";
      //pageVM.selectedSadaqa = undefined;
      $scope.selectedRecurringType = undefined;
      $scope.amount = undefined;
      pageVM.isAmount = undefined;
      pageVM.isCount = undefined;
      pageVM.amount = undefined;
      $scope.allowTextBoxForRPField = false;
      pageVM.otherPersonalityTextBox = undefined;
      $scope.selectedCategory = undefined;
    };

    $scope.clearFastDonationForm = function (activeTabId) {
      var activeTab = jQuery("#" + activeTabId).hasClass("active");
      if (!activeTab) {
        jQuery("#projectCalculator").html("");
        jQuery("#orphanCalculator").html("");
        jQuery("#religiousPaymentCalculator").html("");
        jQuery("#sadaqaCalculator").html("");
        $scope.amountValue = undefined;
        $scope.selectedCount = undefined;
        $scope.totalAmount = undefined;
        pageVM.selectedProject = undefined;
        pageVM.selectedDonationDuration = undefined;
        $scope.selectedDonationDuration = undefined;
        pageVM.selectedCategory = undefined;
        $scope.selectedCategory = undefined;
        $scope.amountValueForNonFixed = undefined;
        $scope.orphanType = undefined;
        $scope.selectedGc = undefined;
        $scope.selectedDz = undefined;
        $scope.user.roles = [];
        pageVM.selectedReligiousPayment = undefined;
        $scope.selectedFitrahSubType = undefined;
        $scope.selectedCountryOfResidence = "";
        $scope.selectedDescend = undefined;
        $scope.selectedSahm = undefined;
        pageVM.otherFieldForNiyaz = "";
        pageVM.selectedSadaqa = undefined;
        $scope.selectedRecurringType = undefined;
        $scope.amount = undefined;
        $scope.allowTextBoxForRPField = false;
        pageVM.otherPersonalityTextBox = undefined;
        $scope.checkBoxNotChecked = true;
      }
    };

    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
    //FAST DONATION END

    jQuery("#txtFromDate").datepicker({
      minDate: 0,
      maxDate: "today",
      autoclose: true
    });
    $scope.checkStartDate = function (date) {
      var date1 = new Date(pageVM.volunteerDetails.from);
      var date2 = new Date(date);
      date2.setHours(0, 0, 0, 0);
      if (date1 > date2) {
        jQuery("#txtFromDate").val("");
        swal({
          title: "Invalid Date for Campaign",
          position: "center-center",
          type: "error",
          allowOutsideClick: false
        });
      }
    };

    $scope.galleryLightBox = function (url, type) {
      if (url) {
        jQuery("#galleryModal").modal("toggle");

        var content = "";
        jQuery("#galleryContent").html("");
        if (type == "image") {
          content = '<img src="uploads/' + url + '" class="fullWidth" alt=""/>';
        } else if ((type = "video")) {
          content =
            '<video controls autoplay class="fullWidth"><source src="uploads/' +
            url +
            '" type="video/mp4"></video>';
        } else {
          content = "Nothing to view";
        }
        jQuery("#galleryContent").append(content);
      }
    };

    jQuery("#galleryModal").on("hidden.bs.modal", function () {
      jQuery("#galleryContent").html("");
    });

    $scope.durationForOneTimeAndRecurring = function () {
      if (!$scope.selectedDonationDuration) {
        $scope.user.roles = [];
        return;
      }
      var obj = new Object();
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      if ($scope.selectedDonationDuration.donationDurationName == "Yearly") {
        $scope.DurationName = "Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = Math.round(pageVM.amount).toFixed(2);
        } else {
          let amount = obj.currency.rateExchange * pageVM.amount;
          $scope.amountValue = currencyService.currencyConversionFormula(
            amount
          )
        }
      }
      if (
        $scope.selectedDonationDuration.donationDurationName == $translate.instant("HALF YEARLY")
      ) {
        $scope.DurationName = "Half Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount / 2;
        } else {
          let amount = ((obj.currency.rateExchange * pageVM.amount) / 2);
          $scope.amountValue = currencyService.currencyConversionFormula(
            amount
          )
        }
      }

      $scope.countChangeDz();
    };

    $scope.durationForOneTimeAndRecurringProj = function () {
      var obj = new Object();
      obj.currency = JSON.parse(sessionStorage.getItem("currency"));
      // PROJECT calculator for yearly donation
      if (
        pageVM.selectedDonationDuration.donationDurationName == "Yearly" ||
        pageVM.selectedDonationDuration.donationDurationName == "Annuel" ||
        pageVM.selectedDonationDuration.donationDurationName == "سنوي"
      ) {
        $scope.DurationName = "Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount;
        } else {
          let amount = obj.currency.rateExchange * pageVM.amount;
          $scope.amountValue = currencyService.currencyConversionFormula(
            amount
          );
        }
        //$scope.amountValue = pageVM.amount;
      }

      // PROJECT calculator for half year donation
      if (
        pageVM.selectedDonationDuration.donationDurationName == "Half Yearly" ||
        pageVM.selectedDonationDuration.donationDurationName == "Semestriel" ||
        pageVM.selectedDonationDuration.donationDurationName == "نصف سنوي"
      ) {
        $scope.DurationName = "Half Yearly";
        if (obj.currency.title == "USD") {
          $scope.amountValue = pageVM.amount / 2;
        } else {
          let amount = Math.round(obj.currency.rateExchange * pageVM.amount) / 2;
          $scope.amountValue = currencyService.currencyConversionFormula(amount);
        }
      }

      $scope.countChangeProj();
    };

    $scope.campaignSliderBackground = function () {
      var bck = '';
      if (pageVM.campaignList && pageVM.campaignList.length > 0) {
        bck =
        {
          'background-image': `url(/uploads/${pageVM.campaignList[pageVM.sliderIndex].image})`,
          'background-repeat': 'no-repeat',
          'background-position': 'center',
          'background-size': 'cover'
        };
      }
      return bck;
    };

    function checkForMultipleRecurringPrograms(obj, result) {
      let addToCart = true;
      if (obj.isRecurringProgram) {

        if (result && result.data.items.length > 0) {
          const found = result.data.items.some(item => item.isRecurringProgram);
          if (found) {
            addToCart = false;
            pageVM.clikedCart = false;
            pageVM.clickedDonate = false;
            let eventObj = utilService.getEventObjMultipleSubscription(config.EventConstants.EventTypes.AddingSadaqah);
            eventLogsService.addEventLog(eventObj);
            swal({
              title: $translate.instant('MULTIPLE_RECURRING_ITEM_ALERT'),
              position: 'center-center',
              type: 'error',
              allowOutsideClick: false,
              html: utilService.createProgramListForErrorMessage(obj, result),
              confirmButtonText: $translate.instant("Yes")
            });
          }
        }
      }

      return addToCart;
    }
  }
})();
