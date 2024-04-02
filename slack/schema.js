exports.slackRequestTriggerSchema = {
    action: {
        label: "action",
        type: "enum",
        values: ["trigger"],
        lowercase: true
    },

    triggerName: {
        label: "trigger name",
        type: "string",
    },
}

exports.slackRequestRetrySchema = {
    action: {
        label: "action",
        type: "enum",
        values: ["retry"],
        lowercase: true
    },

    buildID: {
        label: "build ID",
        type: "string",
    }
}
