const { send } = require('micro')
const dotenv = require('dotenv')
const rp = require('request-promise')
const { router, get } = require('microrouter')
const qs = require('qs')

dotenv.config()

const {
  CLIENT_ID: clientId,
  CLIENT_SECRET: clientSecret,
  AUTH_HOST: authHost,
  APP_URL: appUrl,
  NODE_ENV
} = process.env

if (!clientId || !clientSecret) {
  throw new Error('CLIENT_ID and CLIENT_SECRET are required .env variables')
}

const paths = {
  token: '/token',
  auth: '/'
}

const redirect = (res, location) => {
  res.statusCode = 302
  res.setHeader('Location', location)
  res.end()
}

module.exports = router(
  get('/healthcheck', (req, res) => {
    console.log(Date.now(), 'facecamp is so healthy')
    send(res, 200, 'ok!')
  }),
  get('/app', (req, res) => redirect(res, appUrl)),
  get(paths.auth, (req, res) => {
    // App can always post files and get public channels
    const scope = ['files:write:user', 'channels:read']

    const { types = '' } = req.query
    if (types && typeof types === 'string') {
      scope.push(
        ...['groups', 'im', 'mpim']
          .filter((type) => types.includes(type))
          .map((type) => `${type}:read`)
      )
    }

    redirect(
      res,
      `https://slack.com/oauth/authorize?${qs.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: authHost + paths.token,
        scope: scope.join(' ')
      })}`
    )
  }),
  get(paths.token, async (req, res) => {
    const { error, code } = req.query

    if (error) {
      return send(res, 403, error)
    }

    const access = await rp({
      uri: 'https://slack.com/api/oauth.access',
      json: true,
      qs: {
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: authHost + paths.token
      }
    })

    if (access.error || !access.ok) {
      return send(res, 403, access.error || 'Not ok')
    }

    redirect(res, `${appUrl}#${encodeURIComponent(JSON.stringify(access))}`)
  })
)
