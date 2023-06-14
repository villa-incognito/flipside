import { Button } from "@fscrypto/ui";
import React from "react";
import { PulseLoader } from "react-spinners";

interface LoadMoreProps {
  onClick: () => void;
  isLoading: boolean;
}

const LoadMore = ({ onClick, isLoading }: LoadMoreProps) => {
  return (
    <div className="flex w-full justify-center p-6">
      <Button variant="secondary" size="sm" onClick={onClick} className="w-24">
        {isLoading ? <PulseLoader loading={true} size={8} color="#ccc" /> : "Load More"}
      </Button>
    </div>
  );
};

export default LoadMore;
