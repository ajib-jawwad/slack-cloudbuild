exports.WriteResponseToBody = (ok, retry, message, statusCode, headers) => {
    return { 
        ok: ok,
        isRetryable: retry,
        response: {
            output: {
                message: message,
            },
            context: {
                statusCode: statusCode,
                headers: headers,
            },
        }
    }
}