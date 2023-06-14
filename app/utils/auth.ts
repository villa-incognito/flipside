import { useMatches } from "@remix-run/react";
import type { CurrentUser } from "./auth.server";

export function useOptionalUser() {
  const [matches] = useMatches();
  return matches?.data?.currentUser as CurrentUser | undefined;
}

export function useUser() {
  const maybeUser = useOptionalUser();
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    );
  }
  return maybeUser;
}
