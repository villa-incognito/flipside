import React from "react";
import { InitialDashboardLikesValues, useDashboardLikes } from "../machines/dashboard-likes-machine";
import { useUserProfile } from "~/features/app-shell/components/side-panel/user-profile";
import { useSubmit } from "@remix-run/react";
import LikeButton from "./like-button";

interface DashboardLikesProps extends InitialDashboardLikesValues {
  variant: "published" | "discover";
}

export interface DashboardLikesButtonProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  likedByMe: boolean;
  likeCount?: number | null;
  variant: "published" | "discover";
}

export const DashboardLikes = ({ initiallyLikedByMe, initialLikeCount, dashboardId, variant }: DashboardLikesProps) => {
  const { currentUser } = useUserProfile();
  const submit = useSubmit();
  const { likedByMe, likeCount, toggleLiked } = useDashboardLikes({
    initiallyLikedByMe,
    initialLikeCount,
    dashboardId,
  });

  return (
    <LikeButton
      onClick={() =>
        currentUser
          ? toggleLiked()
          : submit({}, { method: "post", action: `/auth/auth0?redirectUrl=${location.pathname}` })
      }
      likedByMe={likedByMe}
      likeCount={likeCount}
      variant={variant}
    />
  );
};
