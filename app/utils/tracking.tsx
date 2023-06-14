import type { CurrentUser } from "./auth.server";
import { omit } from "lodash";

export function load() {
  if (window.rudderanalytics) {
    const writeKey = window.ENV.RUDDERSTACK_WRITE_KEY;
    const url = window.ENV.RUDDERSTACK_DATAPLANE_URL;
    if (writeKey && url) {
      // configUrl and destSDKBaseURL are overriding the default values, we are sending those requests through cloudflare
      window.rudderanalytics.load(writeKey, url, { configUrl: url, destSDKBaseURL: url + "/integrations" });
    }
  }
  if (window.AppcuesSettings) {
    window.AppcuesSettings = {
      enableURLDetection: false,
    };
  }
}

interface CustomTracking {
  [key: string]: string | null | boolean;
}

export type TrackingInterface =
  | "Tab Bar"
  | "My Work"
  | "Primary Sidebar"
  | "Explore Data"
  | "Tab Bar"
  | "Query Taskbar"
  | "Query Editor"
  | "Dashboard Editor"
  | "SDK"
  | "Top Nav"
  | "Empty State"
  | "API Modal";

export function tracking(trackingMsg: string, interfaceMsg: TrackingInterface, customTrackingObj?: CustomTracking) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...rest } = customTrackingObj || {};
  if (window?.rudderanalytics) {
    window.rudderanalytics.track(trackingMsg, {
      category: "Website",
      interface: interfaceMsg,
      ...rest,
    });
    if (window.ENV.NODE_ENV === "development") {
      console.log("tracking", trackingMsg, interfaceMsg, customTrackingObj);
    }
  }

  if (window?.Appcues) {
    window.Appcues.track(trackingMsg, {
      category: "Website",
      interface: interfaceMsg,
      ...rest,
    });
  }
}

/** Helperr to create a track function for a given interface. Just to reduce noise in components. */
export function trackInterface(ifc: TrackingInterface) {
  return (eventName: string, data?: CustomTracking) => {
    tracking(eventName, ifc, data);
  };
}

export function identify(currentUser: CurrentUser) {
  // the id field is reserved in rudderstack so we need to rename it
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user: any = { ...omit(currentUser, "id"), ...{ userId: currentUser.id } };

  if (window?.rudderanalytics) {
    window.rudderanalytics.identify(
      user.userId,

      {
        email: user.email,
        username: user.username,
        avatar: user.avatarUrl,
        createdAt: user.createdAt,
      },
      {
        integrations: {
          "Google Analytics": true,
          "Amplitude Prod": true,
          "Snowflake Analytics": true,
          Appcues: true,
        },
      }
    );
  }
  if (window?.Appcues) {
    window.Appcues.identify(user.userId, {
      email: user.email,
      username: user.username,
      avatar: user.avatarUrl,
      createdAt: user.createdAt,
    });
  }
}

export function page(pathName: string) {
  if (window.rudderanalytics) window.rudderanalytics.page(pathName, pathName);
  if (window.Appcues) window.Appcues.page(pathName, pathName);
}
