# Quasar App (recordatorio-app)

A Quasar Project

## Install the dependencies
```bash
yarn
# or
npm install
```

Before running `quasar dev` or `npm run lint`, install the dependencies:

```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```


### Build the app for production
```bash
quasar build
```

### API base URL
Set `API_URL` to change the backend endpoint used by Axios. You can also create a `.env` file with this variable so it is picked up automatically.

```bash
API_URL=https://example.com quasar dev
```
If not provided, it defaults to `https://medialert-backend-1q8e.onrender.com`.

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
