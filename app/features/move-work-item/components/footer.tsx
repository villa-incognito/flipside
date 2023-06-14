import { WorkItem } from "@fscrypto/domain/src/work-item";
import { Button, FolderIcon } from "@fscrypto/ui";
import React from "react";

interface FooterProps {
  moveWorkItem: () => void;
  selectedCollection: WorkItem | null;
  currentCollection: WorkItem | null;
  isMoveDisabled: boolean;
  isLoading: boolean;
}

const Footer = ({ moveWorkItem, selectedCollection, currentCollection, isMoveDisabled, isLoading }: FooterProps) => {
  return (
    <div className="dark:border-gray-80 flex items-center justify-between border-t p-2">
      {!isMoveDisabled && !isLoading ? (
        <MovingToLocation name={(selectedCollection?.name || currentCollection?.name) ?? null} />
      ) : (
        <div></div>
      )}
      <Button
        variant="primary"
        size="sm"
        onClick={() => {
          moveWorkItem();
          !isMoveDisabled && close();
        }}
        disabled={isMoveDisabled}
      >
        Move
      </Button>
    </div>
  );
};

export default Footer;

const MovingToLocation = ({ name }: { name: string | null }) => {
  return (
    <div className="text-gray-70 dark:text-gray-40 overflow-hidden font-medium">
      <div className="flex items-center overflow-hidden">
        <p className="text-gray-40 dark:text-gray-20 mr-2 flex-shrink-0 text-sm font-medium">Moving To: </p>
        {name ? (
          <>
            <FolderIcon className="text-gray-40 mr-1 h-5 w-5 flex-shrink-0" />
            <p className="text-gray-70 dark:text-gray-40 truncate text-sm">{name}</p>
          </>
        ) : (
          "Root"
        )}
      </div>
    </div>
  );
};
