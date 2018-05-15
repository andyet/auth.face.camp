# facecamp-auth

## Setup

```sh
npm install
npm start
```

## Local Dev

1.  Start app server from [facecamp repo](https://github.com/andyet/face.camp)
2.  Open the app at [localhost:8080](https://localhost:8080)

### `clientId` and `clientSecret`

To set these create a `config/local.json` file:

```sh
cp config/development.json config/local.json
```

This file will be ignored from git so its safe to put the `clientId` and `clientSecret` in here.

You can get these from [the Slack app's settings](https://api.slack.com/apps/AA4PZPLQL). If you don't have access to that, ask @lukekarrys and he'll add you as a collaborator or give you the credentials.

### `authHost` and `appUrl`

By default `config/development.json` has `authHost` and `appUrl` set for local development.

If you are testing on a device on your network, you'll need to use the url that is displayed in the app's startup message (eg `On Your Network: https://192.168.1.89:8080`) instead of `localhost` and set those in `config/local.json`.

```json
{
  "authHost": "http://192.168.1.89:3000",
  "appUrl": "https://192.168.1.89:8080"
}
```

_You will also need to whitelist your local IP address in your [Slack app's settings](https://api.slack.com/apps)._
