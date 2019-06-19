const { send } = require('micro')
const rp = require('request-promise')
const { router, get } = require('microrouter')
const qs = require('qs')
const config = require('getconfig')
const { version } = require('./package.json')

const { clientId, clientSecret, authHost, appUrl, getconfig } = config

const paths = {
  token: '/token',
  auth: '/',
  app: '/app',
  healthcheck: '/healthcheck'
}

const redirect = (res, location) => {
  res.statusCode = 302
  res.setHeader('Location', location)
  res.end()
}

module.exports = router(
  get(paths.healthcheck, (req, res) => {
    send(res, 200, JSON.stringify({ version, env: getconfig.env }))
  }),
  get(paths.app, (req, res) => redirect(res, appUrl)),
  get(paths.auth, (req, res) => {
    // App can always post files
    const scope = ['files:write:user']

    const { types = '' } = req.query
    if (types && typeof types === 'string') {
      scope.push(
        ...['channels', 'groups', 'im', 'mpim']
          .filter((type) => types.split(',').includes(type))
          .map((type) =>
            `${type === 'im' ? 'users:read' : ''} ${type}:read`.trim()
          )
      )
    }

    // If no other scopes have been added then add channels read to allow
    // the app to work. This allows the client to request other scopes without
    // public channels
    if (scope.length === 1) {
      scope.push('channels:read')
    }

    const redirectUrl = `https://slack.com/oauth/authorize?${qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: authHost + paths.token,
      scope: scope.join(' ')
    })}`

    redirect(res, redirectUrl)
  }),
  get(paths.token, async (req, res) => {
    const { error, code } = req.query

    if (error) {
      return send(res, 403, 'Error')
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

    redirect(
      res,
      `${appUrl}${
        // This makes it easier to test that we are redirecting with the proper
        // information since we cant access the url hash from the request. This
        // is a good thing as far as the app is concerned, but makes it impossible to test/
        getconfig.env === 'test' ? '?query=' : '#'
      }${encodeURIComponent(JSON.stringify(access))}`
    )
  })
)
