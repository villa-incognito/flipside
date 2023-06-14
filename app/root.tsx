import { json } from "~/remix";
import type { LinksFunction, MetaFunction, LoaderArgs } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useCatch, useLoaderData } from "@remix-run/react";
import styles from "./styles/tailwind.css";
import gridStyles from "./styles/grid.css";
import vizStyles from "@fscrypto/viz/styles.css";
import codeMirror from "./styles/codemirror.css";
import mdStyles from "@uiw/react-md-editor/dist/mdeditor.min.css";
import customMdStyles from "./styles/markdown-styles.css";
import clsx from "clsx";
import { withSentry } from "@sentry/remix";
import type { userState } from "@fscrypto/domain";
import * as Sentry from "@sentry/remix";
import type { CurrentUser } from "./utils/auth.server";
import { auth } from "./utils/auth.server";
import ErrorPage from "./features/errors/ErrorPage";
import UncaughtErrorPage from "./features/errors/UncaughtError";
import ErrorUnauthorized from "./features/errors/ErrorUnauthorized";
import ErrorLayout from "./features/errors/ErrorLayout";
// import InitializeApp from "./features/app-state/initialize-app";
import { ToastRoot } from "./features/toasts/toast-root";
import { AppStateProvider } from "./state";
import { useUserStateMachine } from "./state/machines/user-state/user-state";
import MoveWorkItem from "./features/move-work-item/move-work-item";
import { ClientEnv, clientEnv } from "~/utils/env.server";
import { PostHogClient } from "./services/post-hog.server";
import { useTrackingInitialize } from "./utils/tracking-initialize";
import { useIsBot } from "./utils/bot-detection";
import isbot from "isbot";

// this allows us to pass server env vars down to the client
declare global {
  interface Window {
    ENV: ClientEnv;
  }
}

export const links: LinksFunction = () => {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com", as: "font" },
    {
      rel: "preconnect",
      as: "font",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "preload",
      as: "style",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne&display=swap",
    },
    {
      rel: "preload",
      as: "style",
      href: "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Source+Code+Pro:ital@0;1&display=swap",
    },
    { rel: "stylesheet", href: styles },
    { rel: "stylesheet", href: gridStyles },
    { rel: "stylesheet", href: vizStyles },
    { rel: "stylesheet", href: codeMirror },
    { rel: "stylesheet", href: mdStyles },
    { rel: "stylesheet", href: customMdStyles },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Flipside Data App",
  viewport: "width=device-width,initial-scale=1",
  description: "On-chain data available anytime, anywhere, for free.",
});

type RootLoaderProps = {
  currentUser?: CurrentUser;
  userState: userState.UserState;
  ENV: { [key: string]: number | string | boolean };
  featureFlags: Record<string, string | boolean>;
};
export const loader = async ({ request, context }: LoaderArgs) => {
  // if bot no need to return data
  if (isbot(request.headers.get("user-agent"))) {
    return {
      currentUser: null,
      ENV: clientEnv,
      featureFlags: {},
    };
  }
  if (request.url.endsWith("/healthcheck")) {
    return json({});
  }

  const currentUser = await auth.getCurrentUser(request);

  if (currentUser) {
    await PostHogClient.identifyUser(currentUser);
    Sentry.setUser({ id: currentUser.id, username: currentUser.username, email: currentUser.email });
  }

  let userStateData;
  let featureFlags;
  if (currentUser?.id) {
    userStateData = await context.userState.getByUserId(currentUser.id);
    featureFlags = await PostHogClient.getFeatureFlags(currentUser.id);
  }
  return json({
    currentUser: currentUser,
    userState: userStateData,
    ENV: clientEnv,
    featureFlags: featureFlags ?? {},
  });
};

function App() {
  const { userState, currentUser, ENV, featureFlags } = useLoaderData<RootLoaderProps>() as unknown as RootLoaderProps;
  useTrackingInitialize(currentUser);
  return (
    <AppStateProvider initialUserState={userState} featureFlags={featureFlags} user={currentUser}>
      <AppContent ENV={ENV} />
    </AppStateProvider>
  );
}

const AppContent = ({ ENV }: { ENV: RootLoaderProps["ENV"] }) => {
  const { theme } = useUserStateMachine();
  let isBot = useIsBot();
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        {/* load rudderstack data place through cloudflare worker */}
        <script src="https://rsp-production.flipsidecrypto.workers.dev/dataPlane" async />
        {/* load appcues via flipside subdomain */}
        <script src="https://ac.flipsidecrypto.xyz/89192.js" async></script>
      </head>
      <body className={clsx(theme, "font-inter bg-white")}>
        <div className="dark:bg-gray-90 flex min-h-screen flex-col">
          {!isBot && <ToastRoot />}
          {!isBot && <MoveWorkItem />}
          <Outlet />
        </div>

        <ScrollRestoration />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        {isBot ? null : <Scripts />}
        <LiveReload />
      </body>
    </html>
  );
};

export default withSentry(App, {
  wrapWithErrorBoundary: false,
});

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <html>
      <head>
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <UncaughtErrorPage message={error.message} name={error.name} stack={error.stack} />
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401)
    return (
      <ErrorLayout>
        <ErrorUnauthorized />
      </ErrorLayout>
    );

  return (
    <ErrorLayout>
      <ErrorPage status={caught.status} message={caught.statusText || caught.data} />
    </ErrorLayout>
  );
}

export const shouldRevalidate = () => {
  return false;
};
