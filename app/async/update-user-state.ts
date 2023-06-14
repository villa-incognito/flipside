import { userState } from "@fscrypto/domain";
import { $path } from "remix-routes";
import { POST } from "./fetch";

export const updateUserState = async ({ theme }: Partial<userState.UserState>) => {
  return POST<userState.UserState>($path("/api/user-state/update"), { theme });
};
