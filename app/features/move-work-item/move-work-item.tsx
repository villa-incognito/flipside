import { Modal } from "@fscrypto/ui";
import { useMoveWorkItemMachine } from "./machines/move-work-item-machine";
import Header from "./components/header";
import FileExplorer from "./components/file-explorer";
import Footer from "./components/footer";

const MoveWorkItem = () => {
  const {
    workItemData,
    workItems,
    currentCollection,
    initialCollection,
    setCurrentCollectionId,
    moveWorkItem,
    selectedCollection,
    setSelectedCollectionId,
    isOpen,
    close,
    isMoveDisabled,
    isInitialLoading,
    isCollectionLoading,
  } = useMoveWorkItemMachine();

  return (
    <div>
      <Modal open={isOpen} setOpen={close} className="sm:w-[400px] sm:max-w-[400px]">
        <div onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
          <Header
            workItemData={workItemData}
            collectionName={initialCollection?.name ?? null}
            onClose={close}
            isLoading={isInitialLoading}
          />
          <FileExplorer
            workItems={workItems}
            selectedCollection={selectedCollection}
            currentCollection={currentCollection}
            setCurrentCollectionId={setCurrentCollectionId}
            setSelectedCollectionId={setSelectedCollectionId}
            isLoading={isInitialLoading || isCollectionLoading}
          />
          <Footer
            moveWorkItem={moveWorkItem}
            selectedCollection={selectedCollection}
            currentCollection={currentCollection}
            isMoveDisabled={isMoveDisabled}
            isLoading={isInitialLoading || isCollectionLoading}
          />
        </div>
      </Modal>
    </div>
  );
};

export default MoveWorkItem;
