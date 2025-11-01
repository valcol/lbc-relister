import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from "@sentry/browser";

const VERSION = process.env.VERSION;

// Filter integrations that use the global variable
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
  beforeSend(event) {
    return event;
  },
});

const scope = new Scope();
scope.setClient(client);

// Initializing has to be done after setting the client on the scope
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

  // Set tags for better filtering
  if (context.action) {
    eventScope.setTag("action", context.action);
  }

  client.captureException(error, {}, eventScope);
};

const captureMessage = (message, level = LEVELS.info, context = {}) => {
  const eventScope = scope.clone();

  // Set context if provided
  if (Object.keys(context).length > 0) {
    eventScope.setContext("messageContext", context);
  }

  // Add version info
  eventScope.setTag("version", VERSION);

  // Capture the message with the specified level
  client.captureMessage(message, level, {}, eventScope);
};


export { captureError, captureMessage, LEVELS };
