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
    console.log(Date.now(), 'facecamp is so healthy')
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
          .filter((type) => types.includes(type))
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
