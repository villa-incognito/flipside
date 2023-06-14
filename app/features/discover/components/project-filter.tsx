import type { tag } from "@fscrypto/domain";
import { Select } from "@fscrypto/ui";
import { orderBy } from "lodash";

interface SortByProps {
  onChange: (v: string) => void;
  projectName?: string;
  projects: tag.Tag[];
}

const ProjectFilter = ({ onChange, projectName, projects }: SortByProps) => {
  const project = projects.find((o) => o.name === projectName);
  return (
    <div className="w-40 pb-2 sm:pb-0" data-testid="discover-project-filter">
      <Select
        placeholder="Placeholder"
        name="small"
        size="sm"
        options={[
          { name: "all", displayName: "All Projects", iconFileName: null } as typeof projects[number],
          ...orderBy(projects, "name", "asc"),
        ]}
        getOptionName={(o) => o?.displayName ?? ""}
        getOptionValue={(o) => o?.name ?? ""}
        getOptionIcon={(o) => {
          return o?.iconFileName ? (
            <img src={`/images/project-icons/${o?.iconFileName}`} className="mr-2 h-5 w-5" alt={o?.name} />
          ) : null;
        }}
        onChange={(val) => onChange(val.name)}
        value={project ?? ({ name: "all", displayName: "All Projects" } as tag.Tag)}
      />
    </div>
  );
};

export default ProjectFilter;
