import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
  logger
} from "@sentry/browser";

const VERSION = process.env.VERSION;

 const integrations = getDefaultIntegrations({}).filter(
  (defaultIntegration) => {
    return !["BrowserApiErrors", "Breadcrumbs", "GlobalHandlers"].includes(
      defaultIntegration.name,
    );
  },
);

 const client = new BrowserClient({
  dsn: "https://61de7fa7f64d2a4315d1c46c548f0955@o142358.ingest.us.sentry.io/4510224018374656",
  transport: makeFetchTransport,
  stackParser: defaultStackParser,
  integrations: integrations,
  environment: "production",
  release: VERSION,
  enableLogs: true,
  beforeSend(event) {
    return event;
  },
});

const scope = new Scope();
scope.setClient(client);

client.init();

const LEVELS = {
  debug: 'debug',
  info: 'info',
  warning: 'warn',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal'
}

const captureError = (error, context = {}) => {
  const eventScope = scope.clone();
  eventScope.setContext("extension", {
    version: VERSION,
    environment: "production",
    ...context
  });

   if (context.action) {
    eventScope.setTag("action", context.action);
  }

  client.captureException(error, {}, eventScope);
};

const captureMessage = (message, level = LEVELS.info, context = {}) => {
  logger[level](message, context, { scope });
};


export { captureError, captureMessage, LEVELS };
