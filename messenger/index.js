require('dotenv').config({
  path: require('path').resolve(__dirname, '.env')
});

const debug = require('debug')('app:log');
debug.log = console.log.bind(console);

const MongoConnection = require('mongo-connection');
const parseUrl = require('url').parse;
const http = require('http');
const request = require('request');
const readFileSync = require('fs').readFileSync;
const collections = {};

let database = null;

const DB = new MongoConnection();
DB.connect().then(db => database = db);

const uniqId = () => {
  return Math.random() * process.hrtime().join('');
};

const verifyToken = token => {
  if(token === process.env.FB_VALIDATION_TOKEN) {
    return true;
  }
};

const textToJson = text => {
  try {
    return JSON.parse(text);
  } catch(e) {
    debug(`Erro ao converter texto para JSON: `, e.message, text);
    return text;
  }
};

const callSendAPI = messageData => {
  return new Promise((resolve, reject) => {
    request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: messageData
    }, (err, response, body) => {
      debug('facebook call send api: ', err, body);
      resolve();
    });
  });
};

// copyright facebook
const sendTextMessage = (recipientId, messageText, quickReplies) => {
  return callSendAPI({
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: 'SEND_NEWS',
      quick_replies: quickReplies
    }
  });
};

// copyright facebook
const sendGenericMessage = (recipientId, message, quickReplies) => {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: message.tag,
            subtitle: message.text,
            item_url: message.link,
            image_url: message.image,
            buttons: [{
              type: "web_url",
              url: message.link,
              title: "Open Web URL"
            }],
          }]
        }
      },
      quick_replies: quickReplies
    }
  };

  return callSendAPI(messageData);
}

/**
 * Recebe optin de usuário com a tag.
 * Faz o cadastro da tag e id do usuário no banco.
 */
const receivedAuthentication = event => {
  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const tagRef = event.optin.ref;
  const timeOfAuth = event.timestamp;

  const users = database.collection('users');

  const user = {
    $setOnInsert: {
      userId: senderId,
      pageId: recipientId
    },
    $push: {
      tags: tagRef
    }
  };

  users
    .findOneAndUpdate({ userId: senderId }, user, { upsert: true })
    .then(result => sendTextMessage(senderId, 'Ok, você está cadastrado!'));
};

const sendNews = data => {
  const tag = data.tag;
  const text = data.text;
  const link = data.link;
  const image = data.image;

  const users = database.collection('users');

  const quickReplies = [{
    'content_type': 'text',
    'title': 'Cancelar inscrição',
    'payload': `CANCEL_TAG:${tag}`
  }];

  users.find({ tags: { $in: [tag] } }).toArray().then(docs => {
    docs.forEach(user => {
      if(image) {
        sendGenericMessage(user.userId, { link, tag, text, image }, quickReplies)
          .then(() => debug('[send] envio de notícia para usuário'));
      } else {
        sendTextMessage(user.userId, `${tag}: ${text} ${link}`, quickReplies)
          .then(() => debug('[send] envio de notícia para usuário'));
      }
    });
  }).catch(err => debug(err));
};

const receivedMessage = event => {
  const senderID = event.sender.id;
  const recipientID = event.recipient.id;
  const timeOfAuth = event.timestamp;
  const message = event.message;
  const messageText = message.text || message.quick_reply;

  debug('-> recebido mensagem: %s', messageText);

  if(message.is_echo == true) {
    return;
  }

  if(message.quick_reply && /CANCEL_TAG:/.test(message.quick_reply.payload) == true) {
    removeUserTag(senderID, message.quick_reply.payload.split(':')[1]);
    sendTextMessage(senderID, 'Ok, você não receberá mais mensagens sobre esse assunto');
    return;
  }

  sendTextMessage(senderID, messageText);
};

const removeUserTag = (userId, tag) => {
  const user = database.collection('users');
  user.findOneAndUpdate({ userId: userId }, {
    $pull : {
      tags: tag
    }
  });
};

const app = http.createServer((req, res) => {
  let id = uniqId();
  let url = parseUrl(req.url, true);
  let method = req.method;
  let body = '';

  debug(`-> [${id}] ${method} ${url.pathname} %j`, req.headers);

  // rota para optin exemplo
  // remove
  if(method === 'GET' && url.pathname == '/optin.htm') {
    debug(`-> [${id}] static optin.htm file`);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(readFileSync('messenger/optin.htm'));
    return ;
  }

  if(method === 'OPTIONS' || method === 'POST') {
    debug(`<- [${id}] 200 ${method} Accept`);
    res.writeHead(200, {
    	'Content-Type': 'text/plain',
    	'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type'
    });
  }

  if(method !== 'GET' && method !== 'POST') {
    debug(`<- [${id}] 405 method not allowed`);
    res.writeHead(405, {'Content-Type': 'text/plain'});
    res.end();
    return;
  }

  if(/^\/(webhook|send)$/.test(url.pathname) === false) {
    debug(`<- [${id}] 404 not found`);
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end();
    return;
  }

  // valida o webhook junto ao facebook
  if(method === 'GET' && url.pathname === '/webhook' && url.query['hub.mode'] === 'subscribe') {
    if(verifyToken(url.query['hub.verify_token']) === true) {
      debug(`<- [${id}] ${url.query['hub.mode']} is a valid token, writing ${url.query['hub.challenge']}`);

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.write(`${url.query['hub.challenge']}`);
      res.end();
    } else {
      debug(`<- [${id}] ${url.query['hub.verify_token']} is invalid token`);
      res.writeHead(403, {'Content-Type': 'text/plain'});
      res.end();
    }

    return;
  }

  req.on('data', chunk => body += chunk);

  req.on('end', () => {
    let data = textToJson(body);

    debug(`<- [${id}] 200 ok`);
    debug(`[${id}] body text: %j`, data);

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();

    switch(url.pathname) {
      case '/send':
        sendNews(data);
      break;

      case '/webhook':
        if(data.object == 'page') {
          data.entry.forEach(pageEntry => {
            const pageId = pageEntry.id;
            const timeOfEvent = pageEntry.time;

            pageEntry.messaging.forEach(messagingEvent => {
              if (messagingEvent.optin) {
                receivedAuthentication(messagingEvent);
              } else if (messagingEvent.message) {
                receivedMessage(messagingEvent);
              }
            });
          });
        }
      break;
    }
  });
});

app.listen(process.env.PORT || 0, () => {
  debug(`Listen at ${app.address().port}`);
});

module.exports = app;
