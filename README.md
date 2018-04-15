# facecamp-auth

## Setup

```sh
touch .env # Add env values
npm install
npm start
```

## Usage

1.  Start app server from [facecamp repo](https://github.com/lukekarrys/facecamp)
2.  Open the app at [localhost:8080](https://localhost:8080)

## `.env`

Your local `.env` file will need your Slack app's `CLIENT_ID` and `CLIENT_SECRET`.

### `AUTH_HOST` and `APP_URL`

It will also need the `AUTH_HOST` and `APP_URL`.

When developing locally use these values in your `.env` file:

```
AUTH_HOST=http://localhost:3000
APP_URL=https://localhost:8080
```

If you are testing on a device on your network, you'll need to use the url that is displayed in the app's startup message (eg `On Your Network: https://192.168.1.89:8080`) instead of `localhost`:

```
AUTH_HOST=http://192.168.1.89:3000
APP_URL=https://192.168.1.89:8080
```
