import { useLocation } from "@remix-run/react";
import { useEffect } from "react";
import type { CurrentUser } from "./auth.server";
import { identify, page, load } from "./tracking";

export const useTrackingInitialize = (currentUser?: CurrentUser) => {
  const location = useLocation();

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    currentUser && identify(currentUser);
  }, [currentUser]);

  useEffect(() => {
    page(location.pathname);
  }, [location.pathname]);
};
