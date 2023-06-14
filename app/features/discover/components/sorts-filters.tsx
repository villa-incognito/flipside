import React from "react";

interface SortsFiltersProps {
  leftSlot: React.ReactNode;
  rightSlot: React.ReactNode;
}

const SortsFilters = ({ leftSlot, rightSlot }: SortsFiltersProps) => {
  return (
    <div className="flex items-center justify-between p-6 align-top">
      <div className="flex flex-1 justify-start align-top">{leftSlot}</div>
      <div className="flex flex-1 flex-wrap justify-end gap-x-2 sm:flex-nowrap">{rightSlot}</div>
    </div>
  );
};

export default SortsFilters;
