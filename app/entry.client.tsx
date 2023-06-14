import * as React from "react";
import { RemixBrowser } from "@remix-run/react";
import { hydrateRoot } from "react-dom/client";
import { useLocation, useMatches } from "@remix-run/react";
import * as Sentry from "@sentry/remix";
import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";

// Uncomment these lines to enable wdyr
// import { enable } from "./shared/wdyr";
// console.log(enable);

// import { inspect } from "@xstate/inspect";

// inspect({
//   // options
//   // url: 'https://stately.ai/viz?inspect', // (default)
//   iframe: () => document.querySelector("iframe[data-xstate]"),
// });

const tracesSampleRate = (window.ENV.NODE_ENV === "production" || window.ENV.NODE_ENV === "test" ? 0.1 : 0) as number;
Sentry.init({
  dsn: "https://a88c9c59e8e149488c8a6e785810f615:57682f2d472948299653c845dd6648c2@o112472.ingest.sentry.io/4503971445932032",
  tracesSampleRate: tracesSampleRate,
  environment: window.ENV.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(useEffect, useLocation, useMatches),
    }),
  ],
});

if (window.ENV.NODE_ENV === "production") {
  //these keys are public, so it's ok to have them in the client
  datadogRum.init({
    applicationId: "49266f91-2c7b-42d6-8cf9-f74e33056a59",
    clientToken: "pubf084b02c6f741b03aa195613a15747e1",
    site: "datadoghq.com",
    service: "gumby",
    // Specify a version number to identify the deployed version of your application in Datadog
    version: "1.0.0",
    sessionSampleRate: 15,
    sessionReplaySampleRate: 5,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  });
  datadogRum.startSessionReplayRecording();
}

function hydrate() {
  React.startTransition(() => {
    hydrateRoot(
      document,
      // <React.StrictMode>
      <RemixBrowser />
      // </React.StrictMode>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
