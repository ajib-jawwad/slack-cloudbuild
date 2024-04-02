// const fs = require('fs');
// const yaml = require('js-yaml');
const crypto = require('crypto');
const Validator = require('fastest-validator');
const Slack = require("./client.js");
const { Logger } = require("../helper/log.js");
const { parseSlackHTTPData, verifyRequestSignature } = require("./utils.js");
const { slackRequestTriggerSchema, slackRequestRetrySchema } = require("./schema.js")

// const AccessControl = yaml.load(fs.readFileSync(`${process.cwd()}/authorization.yaml`, 'utf8'))["platform"]["slack"]
const SlackClient = new Slack();
const SlackValidator = new Validator();
// const SlackRequestValidator = SlackValidator.compile(slackRequestSchema);
const SlackRequestTriggerValidator = SlackValidator.compile(slackRequestTriggerSchema);
const SlackRequestRetrtValidator = SlackValidator.compile(slackRequestRetrySchema);

exports.SlackAuthorization = async (req, res, next) => {
    // Initialize local variables to be passed to next route
    req.locals = {}
    
    // Generate request hash and log request details
    const requestHash = crypto.randomUUID();
    Logger.info(`Slack request ${requestHash} ${JSON.stringify(req.body)}.`, {});
    req.locals.id = requestHash

    // Verify Request Siganture
    const verifiedRequest = verifyRequestSignature(
        process.env.SLACK_SIGNING_SECRET, 
        req.rawBody, 
        req.headers['x-slack-signature'], 
        req.headers['x-slack-request-timestamp']
    );

    if ( verifiedRequest.ok ) {
        res.status(200).json({
            response_type: "in_channel",
            text: "Got it!"
        });
    } else {
        return res.status(verifiedRequest.response.context.statusCode).send(verifiedRequest.response.output.message);
    }

    // // Extract fields value
    // const fields = ["action", "cloudProvider", "resourceType", "projectCode", "cloudAccountId", "cloudRegion"];
    // const slackRequest = parseSlackHTTPData(req, fields);

    // // Validate slack request
    // const resultSlackRequestValidator = SlackRequestValidator(slackRequest);
    // if (resultSlackRequestValidator == true) {
    //     // Slack request is valid
    //     req.locals.data = slackRequest;
    //     SlackClient.sendMsg(
    //         '⏳ request verified, processing request, estimated time required: 5m.',
    //         req.body.channel_id,
    //         req.body.thread_ts
    //     );
    // } else {
    //     // Invalid Slack request
    //     return SlackClient.sendMsg(
    //         `🔥 ${resultSlackRequestValidator[0].message}`,
    //         req.body.channel_id,
    //         req.body.thread_ts
    //     );
    // };

    if (SlackRequestTriggerValidator == true) {
        const fields = ["action", "triggerName"];
        const slackRequest = parseSlackHTTPData(req, fields);
        const resultSlackRequestValidator = SlackRequestTriggerValidator(slackRequest);
        if (resultSlackRequestValidator == true) {
            // Slack request is valid
            req.locals.data = slackRequest;
            SlackClient.sendMsg(
                '⏳ request verified, processing request, estimated time required: 5m.',
                req.body.channel_id,
                req.body.thread_ts
            );
        } else {
            // Invalid Request 
            return SlackClient.sendMsg(
                `🔥 ${resultSlackRequestValidator[0].message}`,
                req.body.channel_id,
                req.body.thread_ts
            )
        };
    } else {
        const fields = ["action", "buildID"];
        const slackRequest = parseSlackHTTPData(req, fields);
        const resultSlackRequestValidator = SlackRequestRetrtValidator(slackRequest);
        if (resultSlackRequestValidator == true) {
            // Slack request is valid
            req.locals.data = slackRequest;
            SlackClient.sendMsg(
                '⏳ request verified, processing request, estimated time required: 5m.',
                req.body.channel_id,
                req.body.thread_ts
            );
        } else {
            // Invalid Request 
            return SlackClient.sendMsg(
                `🔥 ${resultSlackRequestValidator[0].message}`,
                req.body.channel_id,
                req.body.thread_ts
            )
        };
    };

    // // Check if the requested requests is allowed to operate by the channel
    // listAllowedResourcesCode = AccessControl?.[req.body.channel_id]?.["allowed_resources"];
    // authorized = false;
    // if (listAllowedResourcesCode?.length != undefined) {
    //     for (const pattern of listAllowedResourcesCode) {
    //         const re = new RegExp(pattern);
    //         authorized = re.test(slackRequest.projectCode);
    //         Logger.debug(`Regex match between "${pattern}" and "${slackRequest.projectCode}" is "${authorized}"`);
    //         if (authorized) {
    //             return next();
    //         }
    //     }
    // }

    SlackClient.sendMsg(
        `🚫 Unauthorized request for resource with codename "${slackRequest.projectCode}".`,
        req.body.channel_id,
        req.body.thread_ts
    );
}
