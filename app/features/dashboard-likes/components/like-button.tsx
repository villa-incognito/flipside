import { Button, HeartIcon } from "@fscrypto/ui";
import clsx from "clsx";
import { DashboardLikesButtonProps } from "./dashboard-likes";

const LikeButton = ({ onClick, likeCount, likedByMe, variant }: DashboardLikesButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    onClick(e);
  };
  return (
    <Button
      onClick={handleClick}
      variant="secondary"
      size={variant === "discover" ? "xs" : "sm"}
      className={clsx("mx-1", {
        "!rounded-full": variant === "discover",
      })}
      dataTestId="like-button"
      aria-label="like-button"
    >
      <HeartIcon
        className={clsx("h4 w-4", {
          "fill-red-50 text-red-50": likedByMe,
          "text-gray-60 dark:text-gray-30": !likedByMe,
        })}
      />
      {(likeCount ?? 0) > 0 && <span className="dark:text-gray-30 ml-1 mr-1 text-xs text-gray-100">{likeCount}</span>}
    </Button>
  );
};

export default LikeButton;
