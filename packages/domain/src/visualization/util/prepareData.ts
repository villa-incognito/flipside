/**
 * This file contains utility functions to prepare data for our vis library
 * Based on the visualization domain object, and the data itself
 */

import { groupBy, toPairs, mapValues, sumBy, sortBy } from "lodash";
import type { BarChart } from "../bar";
import { isBarChart } from "../bar";
import type { Visualization } from "../visualization";

export type XData = string | number | Date;
export type YData = number;
export interface XYData {
  key: string;
  data: [XData, YData][];
}

export type DataType<Key extends string = string> = {
  [key in Key]: string | number | Date | DataType<Key>;
};

export function prepareData<T extends DataType>(chart: Visualization["chart"], data: T[]) {
  if (isBarChart(chart)) {
    return prepareBarChartData(chart, data);
  }
  return [{ key: "data", data: [] }];
}

function prepareBarChartData<T extends DataType>(chart: BarChart, data: T[]): XYData[] {
  const datum = chart.yAxisValues.flatMap((yAxisValue) => {
    return aggregateXYData(data, chart.xAxisValue, yAxisValue, chart.groupByValue);
  });
  if (chart.normalize && chart.displayType === "stacked") return normalizeData(datum);
  return datum;
}

/**
 * Normlize multiple series of data to be between 0 and 1
 * 100% is the sum of the Y values at each X value
 */
function normalizeData(data: XYData[]): XYData[] {
  if (data.length <= 1) return data;
  const explodedData = data.map((d) => d.data.map(([x, y]) => [x, y, d.key] as const)).flat();
  const grouped = groupBy(explodedData, ([x]) => x);
  const normalized = toPairs(grouped)
    .map(([, values]) => {
      const total = sumBy(values, ([, y]) => y);
      return values.map(([x, y, key]) => [x, y / total, key] as const);
    })
    .flat();
  const reGrouped = groupBy(normalized, ([, , key]) => key);
  return toPairs(reGrouped).map(([key, values]) => ({
    key,
    data: values.map(([x, y]) => [x, y] as const),
  })) as XYData[];
}

/**
 * This function aims to aggregate data of type T by the x and y values.
 */
export function aggregateXYData<T extends DataType>(
  data: T[],
  xValue?: keyof T,
  yValue?: keyof T,
  grouping?: keyof T
): XYData[] {
  if (!xValue || !yValue) return [];
  if (grouping) {
    const grouped = groupBy(data, grouping);
    const aggregates = toPairs(grouped).map(([key, group]) => ({
      ...aggregateXYData(group, xValue, yValue, undefined)[0],
      key,
    }));
    return aggregates as XYData[];
  }
  const groupedData = groupBy(data, xValue);
  const aggregatedData = Object.values(
    mapValues(groupedData, (d, key) => [key, sumBy(d, yValue as string)])
  ) as XYData["data"];
  return [{ key: yValue as string, data: sortBy(aggregatedData, (x) => x[0]) }];
}
