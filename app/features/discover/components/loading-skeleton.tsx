import React from "react";
import GridContainer from "./grid-container";

export const LoadingSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between p-6 align-top">
        <div role="status" className="bg-gray-10 h-[42px] w-1/2 rounded-full dark:bg-gray-700"></div>
        <div className="flex flex-1 flex-wrap justify-end gap-x-2 sm:flex-nowrap"></div>
      </div>
      <GridContainer>
        {Array(8)
          .fill(null)
          .map((_, index) => (
            <LoadingCard key={index} />
          ))}
      </GridContainer>
    </div>
  );
};

export default LoadingSkeleton;

const LoadingCard = () => {
  return (
    <div
      role="status"
      className="bg-gray-10 flex h-[308px] max-w-sm animate-pulse items-center justify-center rounded-lg dark:bg-gray-700"
    ></div>
  );
};
