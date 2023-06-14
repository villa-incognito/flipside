import type { UserState } from "@fscrypto/domain/src/user-state";
import { CheckIcon, LightBulbIcon, LightOffIcon, LogInIcon, LogOutIcon } from "@fscrypto/ui";
import { useMatches, useNavigate } from "@remix-run/react";
import { useAppTheme } from "~/hooks/useAppTheme";
import { useFetcher } from "~/remix";
import { $path } from "remix-routes";
import type { CurrentUser } from "~/utils/auth.server";
import { tracking } from "~/utils/tracking";
import { truncate } from "lodash";
import { Sidebar } from "./sidebar";

export const UserProfile = ({ isActive }: { isActive: boolean }) => {
  const navigate = useNavigate();
  const { currentUser } = useUserProfile();

  if (currentUser) {
    return (
      <Sidebar.ProfileItem
        popoverContent={<UserProfileMenu currentUser={currentUser} />}
        avatarUrl={currentUser.avatarUrl || ""}
        username={truncate(currentUser.username, { length: 22 })}
        onOpenChange={(isOpen) => {
          const event = isOpen ? "open_user_profile" : "close_user_profile";
          tracking(event, "Primary Sidebar");
        }}
      />
    );
  } else {
    return (
      <Sidebar.LoginItem
        name="Login"
        Icon={LogInIcon}
        isActive={isActive}
        signInOnClick={() => navigate("/auth/auth0")}
        signUpOnClick={() => navigate("/auth/auth0?screen_hint=signup")}
      />
    );
  }
};

export const useUserProfile = () => {
  const [matches] = useMatches();
  return {
    currentUser: matches?.data?.currentUser as CurrentUser | undefined,
    userState: matches?.data.userState as UserState,
  };
};

//TODO: use components from library
const UserProfileMenu = ({ currentUser }: { currentUser: CurrentUser }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    tracking("logout", "Primary Sidebar");
    navigate($path("/auth/auth0/logout"));
  };

  return (
    <div className="w-[256px] py-4">
      <Sidebar.SecondaryNativeLinkItem
        name="View Profile"
        href={$path("/:owner", { owner: currentUser.username })}
        target=""
        onClick={() => tracking("view_profile", "Primary Sidebar")}
      />
      <Sidebar.SecondaryNativeLinkItem
        name="Edit Profile"
        href={$path("/account/profile")}
        target=""
        onClick={() => tracking("editprofile", "Primary Sidebar")}
      />

      <Sidebar.Divider />

      <Sidebar.ActionItem name="Logout" Icon={LogOutIcon} onClick={handleLogoutClick} />

      {/* <ThemeSwitch /> */}
    </div>
  );
};

//TODO: use components from library
export default function ThemeSwitch() {
  const theme = useAppTheme();
  const fetcher = useFetcher();

  return (
    <div className="mb-4">
      <div className="text-gray-70 mb-2 text-sm">Theme</div>
      <div
        className="mb-4 flex w-full cursor-pointer items-center justify-between"
        onClick={() => {
          fetcher.submit({ theme: "light" }, { action: $path("/api/user-state/update"), method: "post" });
          tracking("select_light_mode", "Primary Sidebar");
        }}
      >
        <div className="flex items-center">
          <LightBulbIcon className="text-gray-70 h-5 w-5" />
          <p className="text-gray-70 ml-4">Light Mode </p>
        </div>
        {theme === "light" && <CheckIcon />}
      </div>
      <div
        className="mb-4 flex w-full cursor-not-allowed items-center justify-between"
        // onClick={() => {
        //   fetcher.submit({ theme: "dark" }, { action: $path("/api/user-state/update"), method: "post" });
        //   tracking("select_dark_mode", "Primary Sidebar");
        // }}
      >
        <div className="flex items-center">
          <LightOffIcon className="h-5 w-5 text-gray-300" />
          <p className="ml-4 text-gray-300">Dark Mode - soon&trade;</p>
        </div>
        {theme === "dark" && <CheckIcon />}
      </div>
    </div>
  );
}
