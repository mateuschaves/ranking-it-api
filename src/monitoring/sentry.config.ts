// Import with `const Sentry = require("@sentry/nestjs");` if you are using CJS
import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: "https://7b821f95712d42ce159b826bbf9e63a6@o4509980686417920.ingest.us.sentry.io/4509980749660160",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
  environment: process.env.NODE_ENV,
  integrations: [
    Sentry.prismaIntegration(),
    Sentry.consoleLoggingIntegration(),
    Sentry.httpIntegration(),
    nodeProfilingIntegration(),
    
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  enableLogs: true,
  // Set sampling rate for profiling - this is evaluated only once per SDK.init call
  profileSessionSampleRate: 1.0,
  // Trace lifecycle automatically enables profiling during active traces
  profileLifecycle: 'trace',
});