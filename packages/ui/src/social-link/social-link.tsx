import clsx from "clsx";
import { DiscordIcon, TelegramIcon, TwitterIcon } from "../icons";

interface SocialLinkProps {
  type: "twitter" | "discord" | "telegram";
  handle?: string | null;
  className?: string;
}

export function SocialLink({ type, handle, className = "" }: SocialLinkProps) {
  if (!handle) return null;
  if (type === "discord") {
    className = clsx(className, "pointer-events-none");
  }
  return (
    <a href={getLink(type, handle)} className={clsx("flex items-center", className)} target="_blank" rel="noreferrer">
      {getIcon(type)} <span className="ml-1">{getHandle(type, handle)}</span>
    </a>
  );
}

const getLink = (type: SocialLinkProps["type"], handle: SocialLinkProps["handle"]) => {
  switch (type) {
    case "twitter":
      return `https://twitter.com/${handle}`;
    case "discord":
      return ``;
    case "telegram":
      return `https://t.me/${handle}`;
  }
};

const getIcon = (type: SocialLinkProps["type"]) => {
  switch (type) {
    case "twitter":
      return <TwitterIcon />;
    case "discord":
      return <DiscordIcon />;
    case "telegram":
      return <TelegramIcon />;
  }
};

const getHandle = (type: SocialLinkProps["type"], handle: SocialLinkProps["handle"]) => {
  switch (type) {
    case "twitter":
      return `@${handle}`;
    case "discord":
      return `${handle}`;
    case "telegram":
      return `@${handle}`;
  }
};
