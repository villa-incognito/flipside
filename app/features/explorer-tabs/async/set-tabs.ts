import { $path } from "remix-routes";
import { ExplorerTabData } from "../machines/explorer-tabs-machine";
import { WorkItem } from "@fscrypto/domain/src/work-item";

export const setTabs = async ({ tabs }: { tabs: ExplorerTabData[] }) => {
  const url = window.location.protocol + "//" + window.location.host + $path("/api/work-items/tabs/set");
  try {
    const response = await fetch(url, {
      method: "post",
      body: JSON.stringify({ explorerTabs: createTabsFromWorkItems(tabs) }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401) window.location.pathname = "/auth/auth0";
    if (!response.ok) {
      const data = await response.json();
      const parsed = JSON.parse(data);
      throw new Error(parsed?.message);
    }
    let data: { items: WorkItem[] } = await response.json();

    return data.items;
  } catch (e) {
    let message = "Failed to add work item";
    if (e instanceof Error) message = e.message;
    throw new Error(message);
  }
};

const createTabsFromWorkItems = (tabs: ExplorerTabData[]) => {
  return tabs.map((tab) => {
    return {
      typeId: tab.id,
      active: false,
      type: tab.type,
    };
  });
};
