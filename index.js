const express = require('express');
const { SlackApp } = require('./slack/app.js');
const { SlackAuthorization } = require('./slack/middleware.js');

// Create an Express object and routes (in order)
const app = express();
app.use('/', [SlackAuthorization], SlackApp);

// Set our GCF handler to our Express app.
exports.triggerCloudBuild = app;
