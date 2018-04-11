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
  APP_URL: appUrl
} = process.env

const paths = {
  token: '/token',
  auth: '/auth'
}

const redirect = (res, location) => {
  res.statusCode = 302
  res.setHeader('Location', location)
  res.end()
}

module.exports = router(
  get(paths.auth, (req, res) => {
    const params = qs.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: authHost + paths.token,
      scope: 'chat:write:user channels:read'
    })
    redirect(res, `https://slack.com/oauth/authorize?${params}`)
  }),
  get(paths.token, async (req, res) => {
    const { error, code } = req.query

    if (error) {
      return redirect(res, `${appUrl}?${qs.stringify({ error })}`)
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

    redirect(res, `${appUrl}?${qs.stringify(access)}`)
  })
)
