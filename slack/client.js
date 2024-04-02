const { App } = require("@slack/bolt");
const { Logger } = require("../helper/log.js");

module.exports = class Slack {
    constructor() {
        this.app = new App({
            token: process.env.SLACK_BOT_TOKEN ? process.env.SLACK_BOT_TOKEN : null,
            tokenVerificationEnabled: process.env.SLACK_BOT_TOKEN ? true : false,
            signingSecret: process.env.SLACK_SIGNING_SECRET
        });
    }

    // No message count limitation.
    async sendMsg(message, channelId, threadId) {
        const res = await this.app.client.chat.postMessage({
            channel: channelId,
            threadId: threadId ? threadId : null,
            text: message
        });
        Logger.debug(`Successfully sending message to ${channelId}: ${JSON.stringify(res)}`);
    }
}
