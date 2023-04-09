const { email } = require("../config/configuration");

var Constants = {
    LogLiterals: {
        CHECKOUT_SESSION_METHOD: "createCheckoutSession()",
        STRIPE_CHECKOUT_METHOD: "stripeCheckout()",
        PERFORM_DONATION_METHOD: "performDonation()",
        SEND_EMAIL_WITH_RECIEPT_METHOD: "sendEmailWithReciept()",
        DONATION_CONTROLLER: "DonationController.js",
        SMS_HELPER: "smsHelper.js",
        SEND_SMS_METHOD: "sendSMS()",
        ORPHAN_CONTROLLER: "OrphanController.js",
        UPDATE_ORPHAN: "updateOrphan",
        CACHE_HELPER: "cacheHelper.js",
        SET_CACHE: "setCache()",
        GET_CACHE: "getCache()",
        DELETE_CACHE: "deleteCache()",
        CLEAR_ALL_CACHE: "clearAllCache()",
        LIST_ALL_CACHE: "listAllCache()",
        MENU_CONTROLLER: "menuController.js",
        COUNTRY_CONTROLLER: "countryController.js",
        COUNTRY_LIST_METHOD: "CountryList()",
        DONATION_DURATION_CONTROLLER: "donationDurationController.js",
        DONATION_DURATION_LIST_METHOD: "DonationDurationList()",
        PROGRAM_CONTROLLER: "programController.js",
        PROGRAM_LIST_METHOD: "ProgramList()",
        Email_Transporter: "emailTransporter.js",
        SEND_Email_METHOD_withPromise: "sendEmail()",
        ZIYARAT_SERVICE: "ziyaratService.js",
        ZIYARAT_CONTROLLER: "ziyaratController.js",
        ZIYARAT_NOTIFICATION_JOB: "ziaratPerformNotificationJob.js",
        SCHEDULE_CONTROLLER: "scheduleController.js",
        MANAGE_ORPHAN_CONTROLLER: "manageOrphanController.js",
        GET_ORPHAN_RECURRING_METHOD: "getOrphansRecurring()",
        CHANGE_ORPHAN_METHOD: "changeOrphan()",
        UPDATE_SPONSORSHIP_METHOD: "updateSponsorship()",
        SADAQAH_CALCULATION_JOB: "sadaqahCalculationJob.js",
        SADAQAH_SERVICE: "sadaqahService.js",
        SUNRISE_SUNSET_TIME_HELPER: "sunriseSunsetTimeHelper.js",
        GET_SUNRISE_SUNSET_TIME_METHOD: "getSunriseSunsetTime()",
        SADAQAH_CONTROLLER: "sadaqahController.js",
        EMAIL_SERVICE: "emailService.js",
        DONOR_PROGRAM_SERVICE: "donorProgramService.js",
        DONOR_PROGRAM_CONTROLLER: "donorProgramController.js",
        PROCESS_SUCCESSFULL_PAYMENT: "processSuccessfulPayment",
        PAYMENT_SERVICE: "paymentService",
        AYTAMUNA_REPORT_JOB: "aytamunaReportJob.js",
        AYTAMUNA_REPORT_SERVICE: "aytamunaReportService.js",
        EMAIL_NOTIFICATION_CONTROLLER: "emailNotificationController.js",
        EMAIL_NOTIFICATION_SERVICE: "emailNotificationService.js",
        GENERIC_HELPER: "genericHelper.js",
        SADAQAH_SUBSCRIPTION_ENDED_JOB: "sadaqahEndedJob.js",


    },
    Database: {
        DonationItem: {
            State: {
                NotStarted: "NotStarted",
                InProcess: "InProcess",
                Processed: "Processed"
            }
        },
        Collections: {
            DON_ITEM:
            {
                "dataKey": "DON_ITEM",
                "modelFile": "../models/donationItems"
            },
            DONR:
            {
                "dataKey": "DONR",
                "modelFile": "../models/donar"
            },
            PDF_TEMP:
            {
                "dataKey": "PDF_TEMP",
                "modelFile": "../models/pdfTemplate"
            },
            ORPN:
            {
                "dataKey": "ORPN",
                "modelFile": "../models/orphan.js"
            },
            DONATN:
            {
                "dataKey": "DONATN",
                "modelFile": "../models/donation.js"
            },
            CON:
            {
                "dataKey": "CON",
                "modelFile": "../models/country"
            },
            DON_PRG:
            {
                "dataKey": "DON_PRG",
                "modelFile": "../models/donorPrograms"
            },
            DON_PRG_DET:
            {
                "dataKey": "DON_PRG_DET",
                "modelFile": "../models/donorProgramDetails"
            },
            DON_REC:
            {
                "dataKey": "DON_REC",
                "modelFile": "../models/donationRecurring"
            },
            ORP_SCH:
            {
                "dataKey": "ORP_SCH",
                "modelFile": "../models/orphanScholarships"
            },
            DON_DET:
            {
                "dataKey": "DON_DET",
                "modelFile": "../models/donationDetail"
            },
            STU:
            {
                "dataKey": "STU",
                "modelFile": "../models/studentProfile"
            },
            STU_SCH:
            {
                "dataKey": "STU_SCH",
                "modelFile": "../models/studentSponsorship"
            },
            STRIPE_WH_EV:
            {
                "dataKey": "STRIPE_WH_EV",
                "modelFile": "../models/stripeWebhookEvents"
            },
            DON_PROC:
            {
                "dataKey": "DON_PROC",
                "modelFile": "../models/donationProcess"
            },
            PRGM:
            {
                "dataKey": "PRGM",
                "modelFile": "../models/program"
            },
            USR:
            {
                "dataKey": "USR",
                "modelFile": "../models/user"
            },
            PRGM_TYP:
            {
                "dataKey": "PRGM_TYP",
                "modelFile": "../models/programType"
            },
            CURNCY:
            {
                "dataKey": "CURNCY",
                "modelFile": "../models/currency"
            },
            CONFIG_SETTING:
            {
                "dataKey": "CONFIG_SETTING",
                "modelFile": "../models/configSetting.js"
            },
            NOTIFICATION_STATUS:
            {
                "dataKey": "NOTIFICATION_STATUS",
                "modelFile": "../models/notificationStatus.js"
            },
            EVENT_LOG:
            {
                "dataKey": "EVENT_LOG",
                "modelFile": "../models/eventLogs.js"
            }

        }
    },
    Stripe: {
        Events: {
            PaymentIntentSucceeded: "payment_intent.succeeded",
            InvoicePaid: "invoice.paid",
            InvoicePaymentFailed: "invoice.payment_failed",
            CustomerSubscriptionUpdated: "customer.subscription.updated",
            CustomerSubscriptionCancelled: "customer.subscription.deleted",
            InvoiceCreatedInDraft: "invoice.created"
        },
        SubscriptionStatuses:
        {
            Active: 'active',
            Past_Due: 'past_due',
            UnPaid: 'unpaid',
            Canceled: 'canceled',
            Incomplete: 'incomplete',
            Incomplete_Expired: 'incomplete_expired',
            Trialing: 'trialing'
        },
        Objects: {
            Invoice: 'invoice'
        },
        Actions: {
            InvoicePaymentIntentRequiresAction: 'invoice_payment_intent_requires_action'
        },
        PauseCollectionBehavior: {
            Draft: 'keep_as_draft',
            Void: 'void',
            FreeService: 'mark_uncollectible'
        },
        InoviceStatuses:
        {
            Draft: 'draft',
            Open: 'open',
            Paid: 'paid',
            Uncollectible: 'uncollectible',
            Void: 'void'
        },
        MetaDataVariables:
        {
            DisableAutoAdvanceDate: 'disableAutoAdvanceDate',
            ResumeSubscriptionAt: 'resumeSubscriptionAt'
        }
    },
    Messages: {
        ZiaratRegSuccess: "You have successfully registered for Ziyarah of Imam Hussain (as) to be performed on your behalf on this Thursday!",
        ErrorMessage: "Something went wrong. Please contact administrator."

    },
    GenderTypes: {
        ENG: {
            male: 'Male',
            female: 'Female'
        },
        ARB: {
            male: 'ذكر',
            female: 'أنثى'
        },
        FRN: {
            male: 'Masculin',
            female: 'Féminin'
        }
    },
    DescentTypes: {
        ENG: {
            syed: 'Syed',
            nonSyed: 'Non-Syed'
        },
        ARB: {
            syed: 'سيد',
            nonSyed: 'غير سيد'
        },
        FRN: {
            syed: 'Sayed',
            nonSyed: 'Non-Sayed'
        }
    },
    Languages: {
        English: {
            code: 'ENG',
            locale: 'en'
        },
        Arabic: {
            code: 'ARB',
            locale: 'ar'
        },
        French: {
            code: 'FRN',
            locale: 'fr'
        }
    },
    ProgramSlugs: {
        SadaqahADay: 'sadaqah-a-day',
        higherEducationLoans: 'higher-education-loans',
        studentSponsorship: 'student-sponsorship',
        orphanSponsorship: 'orphan-sponsorship'
    },
    MomentDateFilters:
    {
        IncludeStartDate: '[',
        ExcludeStartDate: '(',
        IncludeEndDate: ']',
        ExcludeEndDate: ')'
    },
    Operators:
    {
        GreaterThanAndEqualTo: '$gte',
        GreaterThan: '$gt',
        LessThanAndEqualTo: '$lte',
        LessThan: '$lt'
    },
    Currencies:
    {
        UnitedStateDollar: 'USD',
        Euro: 'EUR',
        BritishPound: 'GBP'
    },
    CurrencyCompleteMapping: [{
        "name": "US Dollar",
        "symbol": "$",
        "code": "USD"
    }, {
        "name": "Euro",
        "symbol": "€",
        "code": "EUR"
    }, {
        "name": "British Pound",
        "symbol": "£",
        "code": "GBP"
    }, {
        "name": "Canadian Dollar",
        "symbol": "C$",
        "code": "CAD"
    }, {
        "name": "Australian Dollar",
        "symbol": "AU$",
        "code": "AUD"
    }, {
        "name": "Indian Rupee",
        "symbol": "₹",
        "code": "INR"
    }, {
        "name": "Singapore Dollar",
        "symbol": "S$",
        "code": "SGD"
    }, {
        "name": "Swiss Franc",
        "symbol": "CHF",
        "code": "CHF"
    }, {
        "name": "Malaysian Ringgit",
        "symbol": "RM",
        "code": "MYR"
    }, {
        "name": "Japanese Yen",
        "symbol": "¥",
        "code": "JPY"
    }, {
        "name": "Chinese Yuan Renminbi",
        "symbol": "¥",
        "code": "CNY"
    }, {
        "name": "Argentine Peso",
        "symbol": "$",
        "code": "ARS"
    }, {
        "name": "Bahraini Dinar",
        "symbol": "BD",
        "code": "BHD"
    }, {
        "name": "Botswana Pula",
        "symbol": "P",
        "code": "BWP"
    }, {
        "name": "Brazilian Real",
        "symbol": "R$",
        "code": "BRL"
    }, {
        "name": "Bruneian Dollar",
        "symbol": "B$",
        "code": "BND"
    }, {
        "name": "Bulgarian Lev",
        "symbol": "Лв",
        "code": "BGN"
    }, {
        "name": "Chilean Peso",
        "symbol": "$",
        "code": "CLP"
    }, {
        "name": "Colombian Peso",
        "symbol": "$",
        "code": "COP"
    }, {
        "name": "Croatian Kuna",
        "symbol": "kn",
        "code": "HRK"
    }, {
        "name": "Czech Koruna",
        "symbol": "Kč",
        "code": "CZK"
    }, {
        "name": "Danish Krone",
        "symbol": "Kr.",
        "code": "DKK"
    }, {
        "name": "Emirati Dirham",
        "symbol": "د.إ",
        "code": "AED"
    }, {
        "name": "Hong Kong Dollar",
        "symbol": "HK$",
        "code": "HKD"
    }, {
        "name": "Hungarian Forint",
        "symbol": "Ft",
        "code": "HUF"
    }, {
        "name": "Icelandic Krona",
        "symbol": "kr",
        "code": "ISK"
    }, {
        "name": "Indonesian Rupiah",
        "symbol": "Rp",
        "code": "IDR"
    }, {
        "name": "Iranian Rial",
        "symbol": "ريال",
        "code": "IRR"
    }, {
        "name": "Israeli Shekel",
        "symbol": "₪",
        "code": "ILS"
    }, {
        "name": "Kazakhstani Tenge",
        "symbol": "₸",
        "code": "KZT"
    }, {
        "name": "Kuwaiti Dinar",
        "symbol": "KD",
        "code": "KWD"
    }, {
        "name": "Libyan Dinar",
        "symbol": "LD",
        "code": "LYD"
    }, {
        "name": "Mauritian Rupee",
        "symbol": "Rs",
        "code": "MUR"
    }, {
        "name": "Mexican Peso",
        "symbol": "Mex$",
        "code": "MXN"
    }, {
        "name": "Nepalese Rupee",
        "symbol": "Rp",
        "code": "NPR"
    }, {
        "name": "New Zealand Dollar",
        "symbol": "$",
        "code": "NZD"
    }, {
        "name": "Norwegian Krone",
        "symbol": "Kr",
        "code": "NOK"
    }, {
        "name": "Omani Rial",
        "symbol": "ر.ع.",
        "code": "OMR"
    }, {
        "name": "Pakistani Rupee",
        "symbol": "Rs",
        "code": "PKR"
    }, {
        "name": "Philippine Peso",
        "symbol": "₱",
        "code": "PHP"
    }, {
        "name": "Polish Zloty",
        "symbol": "zł",
        "code": "PLN"
    }, {
        "name": "Qatari Riyal",
        "symbol": "QR",
        "code": "QAR"
    }, {
        "name": "Romanian New Leu",
        "symbol": "lei",
        "code": "RON"
    }, {
        "name": "Russian Ruble",
        "symbol": "₽",
        "code": "RUB"
    }, {
        "name": "Saudi Arabian Riyal",
        "symbol": "SR",
        "code": "SAR"
    }, {
        "name": "South African Rand",
        "symbol": "R",
        "code": "ZAR"
    }, {
        "name": "South Korean Won",
        "symbol": "₩",
        "code": "KRW"
    }, {
        "name": "Sri Lankan Rupee",
        "symbol": "ரூ",
        "code": "LKR"
    }, {
        "name": "Swedish Krona",
        "symbol": "kr",
        "code": "SEK"
    }, {
        "name": "Taiwan New Dollar",
        "symbol": "NT$",
        "code": "TWD"
    }, {
        "name": "Thai Baht",
        "symbol": "฿",
        "code": "THB"
    }, {
        "name": "Trinidadian Dollar",
        "symbol": "TT$",
        "code": "TTD"
    }, {
        "name": "Turkish Lira",
        "symbol": "₺",
        "code": "TRY"
    }, {
        "name": "Venezuelan Bolivar",
        "symbol": "Bs.F",
        "code": "VEF"
    }],
    SunRotation:
    {
        sunrise: 'Sunrise',
        sunset: 'Sunset'
    },
    emailTemplates:
    {
        SUCCESSFUL_PAYMENT_EMAIL: 'SUCCESSFUL_PAYMENT_EMAIL',
        SUCCESSFUL_SUBSEQUENT_PAYMENT_EMAIL: 'SUCCESSFUL_SUBSEQUENT_PAYMENT_EMAIL',
        FAILED_SUBSEQUENT_PAYMENT_EMAIL: 'FAILED_SUBSEQUENT_PAYMENT_EMAIL',
        SUBSCRIPTION_CANCELLED_EMAIL: 'SUBSCRIPTION_CANCELLED_EMAIL',
        SUBSCRIPTION_ENDED_EMAIL: 'SUBSCRIPTION_ENDED_EMAIL',
        SUCCESSFUL_RENEWAL_PAYMENT_EMAIL: 'SUCCESSFUL_RENEWAL_PAYMENT_EMAIL',
        SUBSCRIPTION_AUTO_CANCELLED_EMAIL_FOR_SADAQAH_A_DAY: 'SUBSCRIPTION_AUTO_CANCELLED_EMAIL_SADAQAH',
        SUBSCRIPTION_MANUAL_CANCELLED_EMAIL_FOR_SADAQAH_A_DAY: 'SUBSCRIPTION_MANUAL_CANCELLED_EMAIL_SADAQAH',
    },
    pdfTemplates:
    {
        PAYMENT_INVOICE: 'PAYMENT_INVOICE'
    },
    SubscriptionStatus:
    {
        Active: 'Active',
        Inactive: 'Inactive',
        GracePeriod: 'Renewal Required',
        Cancelled: 'Cancelled'
    },
    CancellationMode:
    {
        NotAllowed: 'NotAllowed',
        DonorOnly: 'DonorOnly',
        AdminOnly: 'AdminOnly',
        Allowed: 'Allowed'
    },
    PaymentStatus:
    {
        Paid: 'Paid',
        Unpaid: 'Unpaid',
        Failed: 'Failed'
    },
    PaymentPlans:
    {
        GIVE_ONCE: 'GIVE_ONCE',
        MONTHLY: 'MONTHLY'
    },
    PayableBy:
    {
        Donor: 'Donor',
        Akhyar: 'Akhyar'
    },
    TransitionStage:
    {
        Active: 'Active',
        End: 'Ended',
        OnHold: 'OnHold',
        Changed: 'Changed'
    },
    AytamunaReport: {
        DaysToAdd: {
            ForGracePeriod: 25
        }
    },
    Date:
    {
        DayStartTime: "T00:00:00.000Z",
        DayEndTime: "T23:59:59.000Z"
    },
    DateUnit: {
        Months: 'months',
        Days: 'days',
        Years: 'years',
        Hours: 'hours',
        Minutes: 'minutes'
    },
    SponsorshipType:
    {
        Student: "student",
        Orphan: "orphan"
    },
    MomentDateDifferenceUnits: {
        Days: 'days',
        Months: 'months'
    },
    ReminderTypes:
    {
        Before: "Before",
        After: "After"
    },
    Universal:
    {
        OrphanSponsorshipsReminders: "OrphanSponsorshipsReminders"
    },
    MonthUnitMapping:
    {
        month: 1,
        year: 12
    },
    SubscriptionDuration: {
        YEARLY: 'YEARLY',
        LIFETIME: 'LIFETIME'
    },
    SubscriptionCancelledBy: {
        Job: 'Job',
        Donor: 'Donor'
    }

}

module.exports = Constants;