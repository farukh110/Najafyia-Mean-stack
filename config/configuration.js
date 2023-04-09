const dotenv = require('dotenv');
dotenv.config({ path: './environment.env' });

module.exports = {
    database: {
        mongoUrl: process.env.DB_MONGO_URL || "mongodb://localhost:27018/najafyia_qa",
        nativeParser: process.env.DB_MONGO_NATIVE_PARSER,
        poolSize: process.env.DB_MONGO_POOL_SIZE,
        ttl: process.env.DB_MONGO_TTL
    },
    payment: {
        stripeRecurringProductId: process.env.STRIPE_RECURRING_PRODUCT_ID,
        stripeOneTimeProductId: process.env.STRIPE_ONE_TIME_PRODUCT_ID,
        stripePublicKey: process.env.PAYMENT_STRIPE_PUBLIC_KEY,
        stripeSecretKey: process.env.PAYMENT_STRIPE_SECRET_KEY
    },
    sms: {
        apiUrl: process.env.SMS_API_URL,
        action: process.env.SMS_ACTION,
        userName: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        from: process.env.SMS_FROM

    },
    email: {
        host: process.env.EMAIL_HOST,
        userName: process.env.EMAIL_USERNAME,
        passWord: process.env.EMAIL_PASSWORD,
        port: process.env.MAIL_PORT,
        secure: process.env.EMAIL_SECURE,
        rejectUnauthorized: process.env.EMAIL_REJECT_UNAUTHORIZED,
        subjectPrefixEng_Frn: 'Najafyia Foundation',
        fromTextEng: 'Najafyia Foundation <info@najafyia.org>'
    },
    logger: {
        path: process.env.LOG_PATH || "./logs"
    },
    caching: {
        enabled: process.env.ENABLE_CACHING || false
    },
    app: {
        mode: process.env.APP_MODE || "API", //1. API, 2. Job
        env: process.env.NODE_ENV || "development",
        port: process.env.NODE_PORT || 80,
        sslport: process.env.NODE_SSL_PORT || 443,
        byPassAPIAuth: process.env.BY_PASS_API_AUTH || false,
        appUrl: process.env.APP_URL || "http://localhost/",
        apiUrlReportServer: process.env.apiUrlReportServer || 'http://localhost:3000/api/v2'

    },
    ziyarat: {
        // consultants: [
        //     {
        //         name: 'Consultant1',
        //         email: 'consultant1@abc.com',
        //         queryString: 'jcbkjfr876559ecwdswhu9i2986354978',
        //         phone: ''
        //     }
        // ],
        botUser:
        {
            name: 'Automated User',
            email: '',
            queryString: 'BOTjcbkjfrBOT',
            phone: ''
        },
        adminEmail: process.env.ADMIN_EMAILS,
        ziyaratCutOffTime: {//  * * * * * => second Min Hour Day Month weekday 
            zaireenSelection: process.env.ZAIREEN_SELECTION_SCHEDULE || '5 1 14 * * 4',
            enableAutoZaireenNotification: process.env.ENABLE_AUTO_ZAIREEN_NOTIFICATION_SCHEDULE || '5 1 4 * * 5',
            sendZaireenNotification: process.env.ZAIREEN_SEND_NOTIFICATION || '10 */15 * * * 4-5'
        },
        ziyaratQueStatuses: {
            notStarted: 'NotStarted',
            ignore: 'Ignore',
            processCompleted: 'Completed',
            inProgress: 'InProgress'
        },
        lockZaireenPage: (process.env.LOCK_ZAIREEN_PAGE && process.env.LOCK_ZAIREEN_PAGE.toLowerCase() == 'true'),
        ziyaratSettingKey: 'ZiyaratSetting'
    },
    sadaqah: {
        adminEmail: process.env.ADMIN_EMAILS,
        sadaqahDayAdjusment: process.env.SADAQAH_DAY_ADJUSMENT || -1,
        sadaqahCutOffTime: {//  * * * * * => second Min Hour Day Month weekday 
            sadaqahCalculation: process.env.SADAQAH_CALCULATION_SCHEDULE || '1 5 0 * * *',
            sadaqahSubscriptionEnd: process.env.SADAQAH_SUBSCRIPTION_END_SCHEDULE || '1 5 0 * * *'
        },
        gracePeriodDays: process.env.SADAQAH_ENDED_GRACE_PERIOD_DAY || 25
    },
    developmentSetting: {
        enableEmailsService: (process.env.ENABLE_EMAIL_NOTIFICATION && process.env.ENABLE_EMAIL_NOTIFICATION.toLowerCase() == 'true'),
        enableSmsService: (process.env.ENABLE_SMS_NOTIFICATION && process.env.ENABLE_SMS_NOTIFICATION.toLowerCase() == 'true')
    },
    sunriseSunset: {
        apiUrl: process.env.SUNRISE_SUNSET_API_URL
    },
    exchangeRate: {
        apiUrl: process.env.EXCHANGE_RATE_URL,
        apiKey: process.env.EXCHANGE_RATE_API_KEY
    },
    authorization:
    {
        key: process.env.AUTHORIZATION_KEY,
        systemPassword: process.env.SYSTEM_PASSWORD || '5fa,9Upy!Gs4kFsr'
    },
    aytamunaReport: {
        //  * * * * * => second Min Hour Day Month weekday 
        jobExecutionTime: process.env.AYTAMUNA_REPORT_STATUS_SCHEDULE || '0 59 23 * * *',
        gracePeriodDays: process.env.AYTAMUNA_REPORT_GRACE_PERIOD_DAY || 25

    },
    changeCardDetails: {
        pageUrl: process.env.CHANGE_CARD_DETAIL_URL || "/"
    },
    Renewal:
    {
        ThresholdDays: process.env.RENEWAL_THRESHOLD_DAYS || 15
    },
    orphanHold:
    {
        ThresholdPeriod: process.env.ORPHAN_HOLD_THRESHOLD_MINUTES || 15
    },
    SendOrphanSponsorshipNotification: {
        //  * * * * * => second Min Hour Day Month weekday 
        jobExecutionTime: process.env.ORPHAN_SPONSORSHIP_SCHEDULE || '0 0 06 * * *',
    },
    OutstandingNotification: {
        //  * * * * * => second Min Hour Day Month weekday 
        jobExecutionTime: process.env.OUTSTANDING_SCHEDULE || '0 0 0 1 */1 *',
    },
    SendSadaqahRenewalSponsorshipNotification: {
        //  * * * * * => second Min Hour Day Month weekday 
        jobExecutionTime: process.env.SADAQAH_RENEWAL_SPONSORSHIP_SCHEDULE || '0 0 06 * * *',
    },

    Notifications: {
        EnableBeforeNotification: (process.env.ENABLE_BEFORE_NOTIFICATION && process.env.ENABLE_BEFORE_NOTIFICATION.toLowerCase() == 'true'),
        EnableAfterNotification: (process.env.ENABLE_AFTER_NOTIFICATION && process.env.ENABLE_AFTER_NOTIFICATION.toLowerCase() == 'true')
    }
}