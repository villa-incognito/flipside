import { Button, HeartIcon } from "@fscrypto/ui";
import clsx from "clsx";

interface LikeFilterProps {
  onSetLikedByMe: (v: boolean) => void;
  likedByMe: boolean;
}

const LikeFilter = ({ onSetLikedByMe, likedByMe }: LikeFilterProps) => {
  return (
    <div className="" data-testid="discover-liked-filter">
      <Button
        onClick={() => {
          onSetLikedByMe(!likedByMe);
        }}
        variant="secondary"
        size="sm"
      >
        <HeartIcon
          className={clsx("h-5 w-5", {
            "fill-red-50 text-red-50": likedByMe,
            "text-gray-60 dark:text-gray-30": !likedByMe,
          })}
        />
        <span className="dark:text-gray-30 ml-1 mr-1 text-sm text-gray-100">Liked</span>
      </Button>
    </div>
  );
};

export default LikeFilter;
