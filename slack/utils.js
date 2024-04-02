const crypto = require('crypto');
const { WriteResponseToBody } = require("../helper/return.js");
const { Logger } = require("../helper/log.js");

exports.parseSlackHTTPData = (req, data) => {
    let params = [];
    let slackRequest = {};

    Object.keys(data).forEach((param) => {
        const fieldName = data[param];
        params.push(req.query[fieldName]);
    });

    const bodyParams = req.body.text.split(" ");
    let bodyId = 0;
    Object.keys(data).forEach((param, index) => {
        if (params[index] === undefined) {
            params[index] = bodyParams[bodyId++];
        }
        const fieldName = data[param];
        slackRequest[fieldName] = params[index];
    });

    return slackRequest;
}

exports.verifyRequestSignature = (signingSecret, body, signature, requestTimestamp) => {
    if (signature === undefined || requestTimestamp === undefined) {
        return WriteResponseToBody(false, false, "Slack request signing verification failed. Some headers are missing.", 401, {});
    }
  
    const ts = Number(requestTimestamp);
    if (isNaN(ts)) {
      return WriteResponseToBody(false, false, "Slack request signing verification failed. Timestamp is invalid.", 401, {});
    }
  
    // Divide current date to match Slack ts format
    // Subtract 5 minutes from current time
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  
    if (ts < fiveMinutesAgo) {
        return WriteResponseToBody(false, false, "Slack request signing verification failed. Timestamp is too old.", 401, {});
    }
  
    const hmac = crypto.createHmac('sha256', signingSecret);
    const [version, hash] = signature.split('=');
    hmac.update(`${version}:${ts}:${body}`);

    try {
        if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmac.digest('hex')))) {
          return WriteResponseToBody(false, false, "Slack request signing verification failed. Signature mismatch.", 401, {});
        }
    } catch(e) {
        Logger.debug("An error occured while validating user requests.", e);
        return WriteResponseToBody(false, false, "Slack request signing verification failed. Bad Request: invalid signature.", 400, {});
    }

    return WriteResponseToBody(true, false, "Slack request signing verification success. Signature match.", 200, {});
}
