import type { tag } from "@fscrypto/domain";
import clsx from "clsx";
import React from "react";
import ProjectOverflow from "./project-overflow";

interface ProjectsProps {
  projects: tag.Tag[];
  onSelect: (name: string) => void;
  activeName?: string;
}

const Projects = ({ projects, onSelect }: ProjectsProps) => {
  const slicedProjects = projects.slice(0, 5);
  const extraProjects = projects.length - 5;
  return (
    <div className="">
      <div className="isolate flex items-center -space-x-3 overflow-hidden">
        {slicedProjects.map((project) => (
          <img
            onClick={(e) => {
              e.preventDefault();
              onSelect(project.name);
            }}
            key={project.id}
            className={clsx("h-8 w-8 rounded-full p-1 drop-shadow")}
            src={`/images/project-icons/${project.iconFileName}`}
            alt={project.name}
          />
        ))}
        {extraProjects >= 1 && <ProjectOverflow number={extraProjects} />}
      </div>
    </div>
  );
};

export default Projects;
