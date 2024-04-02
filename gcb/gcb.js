const { CloudBuildClient } = require('@google-cloud/cloudbuild');
const cb = new CloudBuildClient();

exports.triggerBuild = async (projectId, triggerId, substitutions = {}) => {
    const request = {
        projectId,
        triggerId,
        source: {
            substitutions,
        },
    };
    const [operation] = await cb.runBuildTrigger(request);
    const [build] = await operation.promise();
    return build.id;
};

exports.retryBuild = async (projectId, buildId) => {
    const [operation] = await cb.retryBuild(projectId, buildId);
    const [build] = await operation.promise();

    return build.id;
};

exports.helpMessages = 
function getHelpMessage() {
    return `Available commands:
    /gcb trigger <trigger_name> [--substitution _KEY=VALUE]  - Triggers a build with optional substitutions
    /gcb retry <build_id>  - Retries a failed build
    /gcb help  - Displays this help message
    `;
}

function parseSubstitutions(text) {
    const substitution = {};
    const pairs = text.match(/--substitution (.+)/);
    if (pairs) {
        const substitutionStrings = pairs[1].split(',');
        substitutionStrings.forEach((pair) => {
            const [key, value] = pair.split('=');
            substitution[key] = value; 
        });
    }
}