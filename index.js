const { send } = require('micro')
const slack = require('microauth-slack')
const dotenv = require('dotenv')

dotenv.config()

module.exports = slack({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackUrl: process.env.CALLBACK_URL,
  path: '/',
  scope: 'identity.basic'
})((req, res, auth) => {
  if (!auth) {
    return send(res, 404, 'Not Found')
  }

  if (auth.err) {
    return send(res, 403, 'Forbidden')
  }

  return send(res, 200)
})
