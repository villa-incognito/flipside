import type { searchDashboard } from "@fscrypto/domain";
import { Select } from "@fscrypto/ui";
import React from "react";

interface SortByProps {
  onChange: (v: searchDashboard.SearchDashboardQuery["sortBy"]) => void;
  sortBy: searchDashboard.SearchDashboardQuery["sortBy"];
}

const SortBy = ({ onChange, sortBy }: SortByProps) => {
  const value = options.find((o) => o.value === sortBy);
  return (
    <div className="w-40" data-testid="discover-sortby-filter">
      <Select
        placeholder="Placeholder"
        name="small"
        size="sm"
        options={options}
        getOptionName={(o) => o?.name ?? ""}
        getOptionValue={(o) => o?.value ?? ""}
        getOptionIcon={(o) => o?.icon}
        onChange={(val) => onChange(val.value)}
        value={value}
      />
    </div>
  );
};

const iconClassName = "h-5 w-5 mr-2";

const options: { name: string; value: searchDashboard.SearchDashboardQuery["sortBy"]; icon: React.ReactNode }[] = [
  { name: "Trending", value: "trending", icon: <span className={iconClassName}>🔥</span> },
  { name: "Newest", value: "new", icon: <span className={iconClassName}>✨</span> },
  { name: "All Time", value: "greatest", icon: <span className={iconClassName}>🏆</span> },
];
export default SortBy;
