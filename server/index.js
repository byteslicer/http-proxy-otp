
const express = require('express')
const bodyParser = require('body-parser')
const consola = require('consola')
const httpProxy = require('http-proxy');
const ipRegex = require('ip-regex');
const loadJsonFile = require('load-json-file');
const writeJsonFile = require('write-json-file');
const moment = require('moment');
const { Nuxt, Builder } = require('nuxt')

const totp = require('./totp')

const app = express()
const proxy = httpProxy.createProxyServer();

// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

let appConfig = require('../config.js')
const host = appConfig.host || '0.0.0.0'
const port = appConfig.port || 8080

app.set('port', port)

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  }

  let whitelist = await loadJsonFile('data/whitelist.json').catch(r => ({}))
  Object.keys(whitelist).map((key, index) => {
    whitelist[key] = moment(whitelist[key]);
  });

  // Give nuxt middleware to express
  app.use(nuxt.render)

  app.post('/.auth-validate', bodyParser.json(), (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let token = req.body.token;

    // Check for malformed ip
    if(!ipRegex({exact: true}).test(ip)) {
      res.status(500).send({ error: 'malformed ip' });
      return;
    }

    let delta = totp.validate({
      token: token,
      window: 10
    });

    if(delta != null & delta == 0) {
      whitelist[ip] = moment()
      writeJsonFile('data/whitelist.json', whitelist)
        .then(r => res.json({ msg: 'ok' }))
        .catch(r => res.json({ msg: 'error' }))
    } else {
      res.json({ msg: 'Bad token' })
    }
  })


  app.all('/*', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Check for malformed ip
    if(!ipRegex({exact: true}).test(ip)) {
      res.status(500).send({ error: 'malformed ip' });
      return;
    }

    let encoded = Buffer.from(req.originalUrl).toString('base64')

    if (ip in whitelist) {
      if (appConfig.expire && appConfig.expire != 0) {
        let diff = moment.duration(moment().diff(whitelist[ip]))
        let maxDiff = moment.duration(appConfig.expire, 'm')

        if(diff >= maxDiff) {
          res.redirect(`/.auth/?dst=${encoded}`);
          return;
        }
      }

      proxy.web(req, res, {target: appConfig.target});
    } else {
      res.redirect(`/.auth/?dst=${encoded}`);
    }
  })

  // Listen the server
  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}
start()
