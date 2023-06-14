import React from "react";
import type { DashboardCardActorRef } from "../machines/dashboard-card";
import { useActor } from "@xstate/react";
import { Avatar } from "@fscrypto/ui";
import { PreviewImage } from "./preview-image";
import { Link } from "@remix-run/react";
import { kebabCase } from "lodash";
import Projects from "./projects";
import { DateTime } from "luxon";
import { DashboardLikes } from "~/features/dashboard-likes";

interface DashboardCardProps {
  dashboardRef: DashboardCardActorRef;
  activeProject?: string;
  onSelectProject: (name: string) => void;
  showUser?: boolean;
}

const DashboardCard = ({ dashboardRef, onSelectProject, showUser }: DashboardCardProps) => {
  const [state] = useActor(dashboardRef);
  const { title, description, username, screenshotUrl, id, slug, totalLikes, avatarUrl, tags, createdAt, likedByMe } =
    state.context.dashboard;

  const projects = tags?.filter((o) => o.type === "project") ?? [];

  const createdAtDate = createdAt && DateTime.fromISO(createdAt).toFormat("MMM dd");
  return (
    <div className="group">
      <div className="relative transition-all group-hover:scale-105 ">
        <Link to={`/${username}/${kebabCase(title || "")}-${slug}`} prefetch="intent">
          <div className="bg-gray-15 group-hover:bg-gray-15 dark:bg-gray-90 dark:group-hover:bg-gray-80 relative w-full overflow-hidden rounded-2xl p-2 transition-all">
            <PreviewImage src={screenshotUrl} />
            <p className="dark:text-gray-30 pointer-events-none block truncate px-2 py-2 text-base font-medium text-gray-100">
              {title}
            </p>
            <p className="text-gray-70 pointer-events-none line-clamp-2 block h-8 px-2 pb-2 text-xs font-normal">
              <span className="text-gray-70">{createdAtDate}</span> {description && <> - {description}</>}
            </p>
            <div className="mt-2 flex w-full items-center justify-between">
              <DashboardLikes
                initialLikeCount={totalLikes ?? 0}
                initiallyLikedByMe={likedByMe ?? false}
                dashboardId={id}
                variant={"discover"}
              />
              <Projects projects={projects} onSelect={onSelectProject} />
            </div>
          </div>
        </Link>
        {showUser && (
          <Link to={`/${username}`}>
            <div className="absolute left-4 top-4 mr-4 flex items-center rounded-full bg-black bg-opacity-50 p-1 backdrop-blur">
              <Avatar src={avatarUrl ?? ""} size="sm" />
              <span className="mx-3 line-clamp-1 text-sm text-white">{username}</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
