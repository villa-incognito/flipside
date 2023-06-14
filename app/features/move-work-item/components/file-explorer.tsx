import { WorkItem } from "@fscrypto/domain/src/work-item";
import { ArrowRightIcon, ChevronLeftIcon, DoubleChevronLeftIcon, FolderIcon, Tooltip } from "@fscrypto/ui";
import clsx from "clsx";
import React from "react";
import { useSpinDelay } from "spin-delay";
import { FileTreeIcon } from "~/features/file-explorer/components/file-explorer-row/file-tree-icon";

interface FileExplorerProps {
  currentCollection: WorkItem | null;
  setCurrentCollectionId: (id: string | null) => void;
  workItems: WorkItem[];
  selectedCollection: WorkItem | null;
  setSelectedCollectionId: (id: string | null) => void;
  isLoading: boolean;
}

const FileExplorer = ({
  currentCollection,
  setCurrentCollectionId,
  workItems,
  setSelectedCollectionId,
  selectedCollection,
  isLoading,
}: FileExplorerProps) => {
  const loading = useSpinDelay(isLoading, { delay: 0, minDuration: 300 });
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="h-[218px] overflow-hidden">
      {currentCollection?.id ? (
        <CollectionDetails
          onMoveToRoot={() => setCurrentCollectionId(null)}
          onMoveBack={() => setCurrentCollectionId(currentCollection?.parentId!)}
          collection={currentCollection}
        />
      ) : (
        <RootDetails />
      )}
      <div className="scrollbar dark:border-gray-60 ml-5 max-h-[174px] flex-1 border-l-2 py-1">
        {workItems.map((workItem) =>
          workItem.typename === "collection" ? (
            <CollectionRow
              selected={selectedCollection?.id === workItem.id}
              collection={workItem}
              onClick={() => {
                setSelectedCollectionId(workItem.id);
              }}
              onSetCollection={() => setCurrentCollectionId(workItem.id)}
            />
          ) : (
            <NonSelectableRow workItem={workItem} />
          )
        )}
      </div>
    </div>
  );
};

export default FileExplorer;

const CollectionDetails = ({
  collection,
  onMoveBack,
  onMoveToRoot,
}: {
  collection: WorkItem;
  onMoveBack: () => void;
  onMoveToRoot: () => void;
}) => {
  return (
    <div className="flex w-full items-center justify-between overflow-hidden p-2">
      <div className="flex items-center overflow-hidden">
        <FolderIcon className="text-gray-40 mr-2 h-5 w-5 flex-shrink-0" />
        <p className="text-gray-70 dark:text-gray-40 truncate font-medium">{collection?.name}</p>
      </div>
      <div className="flex w-[60px] items-center">
        <Tooltip content="Go to Parent" side="top">
          <div
            className="hover:bg-gray-15 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full dark:hover:bg-gray-100"
            onClick={onMoveBack}
          >
            <ChevronLeftIcon className="text-gray-70 dark:text-gray-40 h-6 w-6 flex-shrink-0" />
          </div>
        </Tooltip>
        <Tooltip content="Go to Root" side="top">
          <div
            className="hover:bg-gray-15 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full dark:hover:bg-gray-100"
            onClick={onMoveToRoot}
          >
            <DoubleChevronLeftIcon className="text-gray-70 dark:text-gray-40 h-6 w-6 flex-shrink-0" />
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

const CollectionRow = ({
  collection,
  onClick,
  onSetCollection,
  selected,
}: {
  collection: WorkItem;
  onClick: React.MouseEventHandler<HTMLDivElement>;
  onSetCollection: React.MouseEventHandler<HTMLDivElement>;
  selected: boolean;
}) => {
  return (
    <div
      className={clsx(
        "dark:bg-gray-90 group my-0.5 ml-1 mr-3  flex cursor-pointer select-none items-center justify-between rounded border p-1",
        {
          "bg-blue-10 dark:border-gray-60 hover:border-blue-50 dark:bg-gray-100": selected,
          "hover:bg-gray-10 dark:bg-gray-80 border-transparent bg-white dark:hover:bg-gray-100": !selected,
        }
      )}
      onClick={onClick}
      onDoubleClick={onSetCollection}
    >
      <div className="flex items-center justify-between overflow-hidden">
        <FileTreeIcon type={collection.typename} />
        <div className="text-gray-70 dark:text-gray-40 mr-2 truncate text-sm group-hover:dark:text-white">
          {collection.name}
        </div>
      </div>
      <Tooltip content={`Got to "${collection.name}"`} side="top">
        <div
          className="hover:bg-gray-20 hover:dark:bg-gray-80 cursor-pointer rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            onSetCollection(e);
          }}
        >
          <ArrowRightIcon className="text-gray-70 dark:text-gray-40 h-6 w-6 opacity-0 group-hover:opacity-100 " />
        </div>
      </Tooltip>
    </div>
  );
};
const NonSelectableRow = ({ workItem }: { workItem: WorkItem }) => {
  return (
    <div className="flex cursor-pointer select-none items-center p-2 opacity-50">
      <FileTreeIcon type={workItem.typename} />
      <div className="text-gray-40 truncate text-sm font-medium">{workItem.name}</div>
    </div>
  );
};

const RootDetails = () => {
  return (
    <div className="flex items-center p-2">
      <FolderIcon className="text-gray-40 mr-2 h-7 w-7 flex-shrink-0" />
      <p className="text-gray-70 dark:text-gray-40 mx-2 truncate font-medium">Root</p>
    </div>
  );
};

const Loading = () => {
  return (
    <div className="h-[218px] w-full animate-pulse p-2">
      <div className="flex h-8 w-full items-center">
        <div className="mr-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-6 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 "></div>
      </div>
      <div className="ml-4 mt-4">
        <div className="mb-2 flex h-6 w-full items-center">
          <div className="mr-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 "></div>
        </div>
        <div className="mb-2 flex h-6 w-full items-center">
          <div className="mr-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 "></div>
        </div>
        <div className="flex h-6 w-full items-center">
          <div className="mr-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-5 flex-1 rounded-full bg-gray-200 dark:bg-gray-700 "></div>
        </div>
      </div>
    </div>
  );
};
