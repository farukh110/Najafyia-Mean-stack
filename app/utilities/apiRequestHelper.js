const axios = require('axios').default;
var logHelper = require('../utilities/logHelper');
module.exports = {
    HTTPMethods: {
        GET: "GET",
        POST: "POST",
        PUT: "PUT",
    },
    sendRequest: async (url, method, headers, bodyData) => {
        try {
            logHelper.logInfo("Making API call to ", url, method, headers, bodyData);
            let requestOptions = {
                method: method,
                url: url
            };
            if (bodyData)
                requestOptions.data = bodyData;
            if (headers)
                requestOptions.headers = headers;
            const resp = await axios(requestOptions);
            logHelper.logInfo("Response received from API call ", resp.data);
            return resp.data;
        } catch (err) {
            // Handle Error Here
            logHelper.logError("Error in API Request Helper", err);
        }
    }
}