// const express = require('express');
// const dotenv = require('dotenv').config();
// const http = require('http');
// const bodyParser = require('body-parser');

// const app = express();

// app.use(bodyParser.urlencoded({ extended: false }));
// const server = http.createServer(app);

// // ROUTER LIST
// const commandRouter = require('./router/command/route');
// const interactivityRouter = require('./router/interactivity/route');

// // ROUTING
// app.use('/slack', commandRouter);
// app.use('/slack', interactivityRouter);

// server.listen(process.env.SERVER_PORT);

const { App } = require('@slack/bolt');
const dotenv = require('dotenv').config();

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  // appToken: process.env.SLACK_APP_TOKEN,
});

slackApp.command('/echo', async ({ command, ack, respond }) => {
  // Acknowledge command request
  await ack();

  await respond(`${command.text}`);
});

slackApp.message('hello', async ({ message, say }) => {
  await say(`Hey there <@${message.user}>!`);
});

(async () => {
  await slackApp.start(process.env.SERVER_PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
