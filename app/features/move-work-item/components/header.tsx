import { WorkItem } from "@fscrypto/domain/src/work-item";
import { CloseIcon, Tooltip } from "@fscrypto/ui";
import React from "react";
import { FileTreeIcon } from "~/features/file-explorer/components/file-explorer-row/file-tree-icon";

interface HeaderProps {
  workItemData: WorkItem | null;
  collectionName: string | null;
  onClose: () => void;
  isLoading: boolean;
}

const Header = ({ workItemData, onClose, isLoading }: HeaderProps) => {
  if (isLoading) {
    return (
      <div className="dark:border-gray-80 w-full animate-pulse border-b p-2">
        <div className="flex h-8 w-full items-center">
          <div className="mr-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-6 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 "></div>
        </div>
      </div>
    );
  }
  return (
    <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      <div className="dark:border-gray-80 flex flex-nowrap items-center justify-between border-b p-2">
        <div className="w-full overflow-hidden truncate">
          <Title name={workItemData?.name ?? ""} type={workItemData?.typename} />
        </div>
        <Tooltip content="Close" side="top">
          <div
            className="hover:bg-gray-15 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full dark:hover:bg-gray-100"
            onClick={onClose}
          >
            <CloseIcon className="text-gray-70 h-6 w-6 flex-shrink-0" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default Header;

const Title = ({ name, type }: { name: string; type?: WorkItem["typename"] }) => {
  return (
    <div className="text-gray-70 dark:text-gray-40 flex items-center overflow-hidden truncate font-medium">
      <FileTreeIcon type={type ?? "query"} />
      <p className="ml-1 truncate">Move "{name}"</p>
    </div>
  );
};
