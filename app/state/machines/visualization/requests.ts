import { visualization } from "@fscrypto/domain";
import { $path } from "remix-routes";

export const deleteVisualization = async (id: string) => {
  const res = await fetch($path("/api/visualizations/:id/delete", { id }), {
    method: "POST",
    body: new FormData(),
  });
  if (!res.ok) throw Error("Error deleting visualization");
};

export const updateVisualization = async (id: string, payload: visualization.VisualizationUpdate) => {
  const res = await fetch($path("/api/visualizations/:id/update", { id }), {
    method: "POST",
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw Error("Error saving visualization");
  const vis = (await res.json()) as visualization.Visualization;
  return vis;
};

export const createVisualization = async (newVis: visualization.VisualizationNew) => {
  const response = await fetch($path("/api/queries/:id/visualizations/create", { id: newVis.queryId! }), {
    method: "POST",
    headers: { "no-redirect": "true", "Content-Type": "application/json" },
    body: JSON.stringify(newVis),
  });
  if (!response.ok) throw new Error("Could not create new vis");
  const vis = (await response.json()) as visualization.Visualization;
  return vis;
};
