import _ from "lodash";
import type { AreaChart } from "../area";
import type { BarChart } from "../bar";
import type { BigNumber } from "../big-number";
import type { Donut } from "../donut";
import { holeSizeSchema, labelOptionSchema } from "../donut";
import type { LineChart } from "../line";
import { schema as scaleSchema } from "../scale";
import type { ScatterChart } from "../scatter";
import { markerScaleTypeSchema } from "../scatter";
import type {
  Visualization,
  VisualizationLegacyType,
  VisualizationLegend,
  VisualizationLegacyOptions,
  VisualizationType,
} from "../visualization";
import { legacyChartTypeSchema } from "../visualization";
import { chartTypeSchema } from "../visualization";
import { trim } from "lodash";
import { BarLineLegacyChart } from "../legacy-bar-line";

type ConverterDirection = "legacyToGumby" | "gumbyToLegacy";

export class VisualizationConverter {
  constructor(private vis: Visualization) {}

  convertOptionsToChart(): BigNumber | BarChart | LineChart | AreaChart | ScatterChart | Donut | BarLineLegacyChart {
    if (this.vis.legacyType === "big_number") {
      return this.bigNumberLegacyToGumby();
    } else if (this.vis.legacyType === "bar2") {
      return this.barChartLegacyToGumby();
    } else if (this.vis.legacyType === "line2") {
      return this.lineChartLegacyToGumby();
    } else if (this.vis.legacyType === "area") {
      return this.areaChartLegacyToGumby();
    } else if (this.vis.legacyType === "scatter") {
      return this.scatterChartLegacyToGumby();
    } else if (this.vis.legacyType === "donut") {
      return this.donutChartLegacyToGumby();
    } else if (this.vis.legacyType === "multi") {
      return this.multiChartLegacyToGumby();
    }

    throw new Error("Unsupported visualization type: " + this.vis.chartType);
  }

  convertChartToOptions(): VisualizationLegacyOptions {
    if (this.vis.chartType === "big_number") {
      return this.bigNumberGumbyToLegacy();
    } else if (this.vis.chartType === "bar") {
      return this.barChartGumbyToLegacy();
    } else if (this.vis.chartType === "line") {
      return this.lineChartGumbyToLegacy();
    } else if (this.vis.chartType === "area") {
      return this.areaChartGumbyToLegacy();
    } else if (this.vis.chartType === "scatter") {
      return this.scatterChartGumbyToLegacy();
    } else if (this.vis.chartType === "donut") {
      return this.donutChartGumbyToLegacy();
    }

    throw new Error("Unsupported visualization type: " + this.vis.chartType);
  }

  convertOptionsToLegend(): VisualizationLegend {
    const legend: VisualizationLegend = {
      // Default legend to show if not specified
      show:
        this.vis.legacyOptions["legendEnabled"] !== undefined
          ? (this.vis.legacyOptions["legendEnabled"] as boolean)
          : true,
      position: "top",
      colorMap: {},
    };

    return legend;
  }

  convertLegacyTypeToChartType(): VisualizationType {
    const result = chartTypeSchema.safeParse(this.vis.legacyType);
    if (result.success) return result.data;
    if (this.vis.legacyType === "line2") return "line";
    if (this.vis.legacyType === "bar2") return "bar";
    if (this.vis.legacyType === "multi") return "bar_line";
    throw new Error("Unsupported visualization legacy type: " + this.vis.legacyType);
  }

  convertChartTypeToLegacyType(): VisualizationLegacyType {
    const result = legacyChartTypeSchema.safeParse(this.vis.chartType);
    if (result.success) return result.data;
    if (this.vis.chartType === "line") return "line2";
    if (this.vis.chartType === "bar") return "bar2";
    throw new Error("Unsupported visualization type: " + this.vis.chartType);
  }

  private bigNumberLegacyToGumby(): BigNumber {
    const rowNumber: number = this.vis.legacyOptions["rowNumber"] ? Number(this.vis.legacyOptions["rowNumber"]) : 1;

    const chart: BigNumber = {
      type: "big_number",
      caption: this.vis.legacyOptions["caption"] ? (this.vis.legacyOptions["caption"] as string) : undefined,
      rowNumber: rowNumber,
      valueKey: this.vis.legacyOptions["column"] ? (this.vis.legacyOptions["column"] as string) : undefined,
      decimals: 1,
      autoFormat: true,
    };

    return chart;
  }

  private bigNumberGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: BigNumber = this.vis.chart as BigNumber;
    const legacyChart: VisualizationLegacyOptions = {
      caption: chart.caption,
      rowNumber: chart.rowNumber.toString(),
      column: chart.valueKey,
    };

    return legacyChart;
  }

  private barChartLegacyToGumby(): BarChart {
    // parse axis scale values and default to auto if they're not present or invalid
    const xAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["xAxisType"]);
    const xAxisScale = xAxisScaleParse.success ? xAxisScaleParse.data : "auto";

    const yAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["yAxisType"]);
    const yAxisScale = yAxisScaleParse.success ? yAxisScaleParse.data : "auto";

    const chart: BarChart = {
      type: "bar",
      legacyColorTheme: this.vis.legacyOptions["theme"] ? (this.vis.legacyOptions["theme"] as string) : "Default",
      displayType: this.vis.legacyOptions["isStacked"] ? "stacked" : "grouped",
      normalize: this.vis.legacyOptions["isNormalized"] ? (this.vis.legacyOptions["isNormalized"] as boolean) : false,
      groupByValue:
        this.vis.legacyOptions["colorColumn"] && trim(this.vis.legacyOptions["colorColumn"]) !== "None"
          ? (this.vis.legacyOptions["colorColumn"] as string)
          : undefined,
      xAxisValue: this.vis.legacyOptions["xAxisColumn"] ? (this.vis.legacyOptions["xAxisColumn"] as string) : undefined,
      yAxisValues: this.vis.legacyOptions["yAxisBarColumns"]
        ? (this.vis.legacyOptions["yAxisBarColumns"] as string[])
        : [],
      yAxisLineValue:
        this.vis.legacyOptions["yAxisLineColumns"] && trim(this.vis.legacyOptions["yAxisLineColumns"]) !== "None"
          ? (this.vis.legacyOptions["yAxisLineColumns"] as string)
          : undefined,
      yAxisLinePosition: "right",
      xAxisScale,
      yAxisScale,
      xAxisLabel:
        this.vis.legacyOptions["xAxisLabelType"] && trim(this.vis.legacyOptions["xAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["xAxisLabel"] as string)
          : undefined,
      yAxisLabel:
        this.vis.legacyOptions["yAxisLabelType"] && trim(this.vis.legacyOptions["yAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["yAxisLabel"] as string)
          : undefined,
      maximumCategories: 8,
      xAxisType: "auto",
      yAxisType: "auto",
      lineGap: "none",
      xAxisSortDirection: "none",
    };

    return chart;
  }

  private barChartGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: BarChart = this.vis.chart as BarChart;
    const legacyChart: VisualizationLegacyOptions = {
      theme: chart.legacyColorTheme,
      isStacked: chart.displayType === "stacked",
      isNormalized: chart.normalize,
      legendEnabled: this.vis.legend ? this.vis.legend.show : false,
      colorColumn: chart.groupByValue,
      xAxisType: chart.xAxisScale,
      yAxisType: chart.yAxisScale,
      xAxisLabel: chart.xAxisLabel,
      yAxisLabel: chart.yAxisLabel,
      xAxisColumn: chart.xAxisValue,
      xAxisLabelType: chart.xAxisLabel ? "Manual" : "Column",
      yAxisLabelType: chart.yAxisLabel ? "Manual" : "Column",
      yAxisBarColumns: chart.yAxisValues,
      yAxisLineColumns: chart.yAxisLineValue,
    };

    return legacyChart;
  }

  private lineChartLegacyToGumby(): LineChart {
    // parse axis scale values and default to auto if they're not present or invalid
    const xAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["xAxisType"]);
    const xAxisScale = xAxisScaleParse.success ? xAxisScaleParse.data : "auto";

    const yAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["yAxisType"]);
    const yAxisScale = yAxisScaleParse.success ? yAxisScaleParse.data : "auto";

    const yAxisScaleRightParse = scaleSchema.safeParse(this.vis.legacyOptions["yAxisScale"]);
    const yAxisScaleRight = yAxisScaleRightParse.success ? yAxisScaleRightParse.data : "auto";

    const chart: LineChart = {
      type: "line",
      legacyColorTheme: this.vis.legacyOptions["theme"] ? (this.vis.legacyOptions["theme"] as string) : "Default",
      xAxisValue: this.vis.legacyOptions["xAxisColumn"] ? (this.vis.legacyOptions["xAxisColumn"] as string) : undefined,
      yAxisValues: this.vis.legacyOptions["yAxisColumns"] ? (this.vis.legacyOptions["yAxisColumns"] as string[]) : [],
      yAxisValuesRight: this.vis.legacyOptions["yAxisRightColumns"]
        ? (this.vis.legacyOptions["yAxisRightColumns"] as string[])
        : [],
      groupByValue:
        this.vis.legacyOptions["colorColumn"] && trim(this.vis.legacyOptions["colorColumn"]) !== "None"
          ? (this.vis.legacyOptions["colorColumn"] as string)
          : undefined,
      xAxisScale,
      yAxisScale,
      yAxisScaleRight,
      xAxisLabel:
        this.vis.legacyOptions["xAxisLabelType"] && trim(this.vis.legacyOptions["xAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["xAxisLabel"] as string)
          : undefined,
      yAxisLabel:
        this.vis.legacyOptions["yAxisLabelType"] && trim(this.vis.legacyOptions["yAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["yAxisLabel"] as string)
          : undefined,
      yAxisLabelRight:
        this.vis.legacyOptions["yAxis2LabelType"] && trim(this.vis.legacyOptions["yAxis2LabelType"]) === "Manual"
          ? (this.vis.legacyOptions["yAxis2Label"] as string)
          : undefined,
      maximumCategories: 8,
      xAxisType: "auto",
      yAxisType: "auto",
      lineGap: "none",
      xAxisSortDirection: "none",
    };

    return chart;
  }

  private lineChartGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: LineChart = this.vis.chart as LineChart;
    const legacyChart: VisualizationLegacyOptions = {
      theme: chart.legacyColorTheme,
      xAxisType: chart.xAxisScale,
      yAxisType: chart.yAxisScale,
      yAxis2Type: chart.yAxisScaleRight,
      xAxisLabel: chart.xAxisLabel,
      yAxisLabel: chart.yAxisLabel,
      yAxis2Label: chart.yAxisLabelRight,
      xAxisColumn: chart.xAxisValue,
      yAxisColumns: chart.yAxisValues,
      yAxisRightColumns: chart.yAxisValuesRight,
      xAxisLabelType: chart.xAxisLabel ? "Manual" : "Column",
      yAxisLabelType: chart.yAxisLabel ? "Manual" : "Column",
      yAxis2LabelType: chart.yAxisLabelRight ? "Manual" : "Column",
      legendEnabled: this.vis.legend ? this.vis.legend.show : false,
      colorColumn: chart.groupByValue,
    };

    return legacyChart;
  }

  private scatterChartLegacyToGumby(): ScatterChart {
    const x = this.vis.legacyOptions["x"] as VisualizationLegacyOptions;
    const y = this.vis.legacyOptions["y"] as VisualizationLegacyOptions;

    // parse axis scale values and default to auto if they're not present or invalid
    const xAxisScaleParse = scaleSchema.safeParse(x["scaleType"]);
    const xAxisLabel = trim(x["titleType"]) === "Manual" ? (x["title"] as string) : undefined;
    const xAxisScale = xAxisScaleParse.success ? xAxisScaleParse.data : "auto";

    const yAxisScaleParse = scaleSchema.safeParse(y["scaleType"]);
    const yAxisLabel = trim(y["titleType"]) === "Manual" ? (y["title"] as string) : undefined;
    const yAxisScale = yAxisScaleParse.success ? yAxisScaleParse.data : "auto";

    const markerScaleTypeParse = markerScaleTypeSchema.safeParse(this.vis.legacyOptions["markerScaleType"]);
    const markerScaleType = markerScaleTypeParse.success ? markerScaleTypeParse.data : "linear";

    const chart: ScatterChart = {
      type: "scatter",
      legacyColorTheme: this.vis.legacyOptions["theme"] ? (this.vis.legacyOptions["theme"] as string) : "Default",
      xAxisValue: this.vis.legacyOptions["xAxisColumn"] ? (this.vis.legacyOptions["xAxisColumn"] as string) : undefined,
      yAxisValue: this.vis.legacyOptions["yAxisColumn"] ? (this.vis.legacyOptions["yAxisColumn"] as string) : undefined,
      colorValue:
        this.vis.legacyOptions["colorColumn"] && trim(this.vis.legacyOptions["colorColumn"]) !== "None"
          ? (this.vis.legacyOptions["colorColumn"] as string)
          : undefined,
      markerColumn:
        this.vis.legacyOptions["markerColumn"] && trim(this.vis.legacyOptions["markerColumn"]) !== "None"
          ? (this.vis.legacyOptions["markerColumn"] as string)
          : undefined,
      xAxisScale,
      yAxisScale,
      xAxisLabel,
      yAxisLabel,
      markerScaleType,
      markerScaleRange: this.vis.legacyOptions["markerScaleRange"]
        ? (this.vis.legacyOptions["markerScaleRange"] as number)
        : 0,
      maximumCategories: 8,
      xAxisType: "auto",
      yAxisType: "auto",
      lineGap: "none",
      xAxisSortDirection: "none",
    };

    return chart;
  }

  private scatterChartGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: ScatterChart = this.vis.chart as ScatterChart;
    const legacyChart: VisualizationLegacyOptions = {
      x: {
        scaleType: chart.xAxisScale,
        titleType: chart.xAxisLabel ? "Manual" : "Column",
        title: chart.xAxisLabel,
      },
      y: {
        scaleType: chart.yAxisScale,
        titleType: chart.yAxisLabel ? "Manual" : "Column",
        title: chart.yAxisLabel,
      },
      theme: chart.legacyColorTheme,
      colorColumn: chart.colorValue,
      xAxisColumn: chart.xAxisValue,
      yAxisColumn: chart.yAxisValue,
      markerColumn: chart.markerColumn,
      legendEnabled: this.vis.legend ? this.vis.legend.show : false,
      markerScaleType: chart.markerScaleType,
      markerScaleRange: chart.markerScaleRange,
    };

    return legacyChart;
  }

  private donutChartLegacyToGumby(): Donut {
    const labelOptionValue = this.vis.legacyOptions["sliceLabels"]
      ? this.convertDonutLabel(this.vis.legacyOptions["sliceLabels"] as string, "legacyToGumby")
      : "labelAndValue";

    const labelOptionParse = labelOptionSchema.safeParse(labelOptionValue);
    const labelOption = labelOptionParse.success ? labelOptionParse.data : "labelAndValue";

    const holeSizeParse = holeSizeSchema.safeParse(this.vis.legacyOptions["hole"]);
    const holeSize = holeSizeParse.success ? holeSizeParse.data : "25%";

    const chart: Donut = {
      type: "donut",
      labelKey: this.vis.legacyOptions["sliceColumn"] ? (this.vis.legacyOptions["sliceColumn"] as string) : undefined,
      valueKey: this.vis.legacyOptions["angleColumn"] ? (this.vis.legacyOptions["angleColumn"] as string) : undefined,
      maxSlices: this.vis.legacyOptions["maxSlices"] ? (this.vis.legacyOptions["maxSlices"] as number) : null,
      hasOtherSlice: this.vis.legacyOptions["hasOtherSlice"]
        ? (this.vis.legacyOptions["hasOtherSlice"] as boolean)
        : false,
      labelOption,
      groupAdditionalSlices: true,
      holeSize,
      maximumCategories: this.vis.legacyOptions["maxSlices"] ? (this.vis.legacyOptions["maxSlices"] as number) : 0,
    };

    return chart;
  }

  private donutChartGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: Donut = this.vis.chart as Donut;
    const legacyChart: VisualizationLegacyOptions = {
      hole: chart.holeSize,
      maxSlices: chart.maxSlices,
      angleColumn: chart.valueKey,
      sliceColumn: chart.labelKey,
      sliceLabels: this.convertDonutLabel(chart.labelOption, "gumbyToLegacy"),
      hasOtherSlice: chart.hasOtherSlice,
    };

    return legacyChart;
  }

  private areaChartLegacyToGumby(): AreaChart {
    // parse axis scale values and default to auto if they're not present or invalid
    const xAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["xAxisType"]);
    const xAxisScale = xAxisScaleParse.success ? xAxisScaleParse.data : "auto";

    const yAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions["yAxisType"]);
    const yAxisScale = yAxisScaleParse.success ? yAxisScaleParse.data : "auto";

    const chart: AreaChart = {
      type: "area",
      legacyColorTheme: this.vis.legacyOptions["theme"] ? (this.vis.legacyOptions["theme"] as string) : "Default",
      xAxisValue: this.vis.legacyOptions["xAxisColumn"] ? (this.vis.legacyOptions["xAxisColumn"] as string) : undefined,
      yAxisValues: this.vis.legacyOptions["yAxisColumns"] ? (this.vis.legacyOptions["yAxisColumns"] as string[]) : [],
      displayType: this.vis.legacyOptions["isStacked"] ? "stacked" : "overlay",
      normalize: this.vis.legacyOptions["isNormalized"] ? (this.vis.legacyOptions["isNormalized"] as boolean) : false,
      xAxisScale,
      yAxisScale,
      xAxisLabel:
        this.vis.legacyOptions["xAxisLabelType"] && trim(this.vis.legacyOptions["xAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["xAxisLabel"] as string)
          : undefined,
      yAxisLabel:
        this.vis.legacyOptions["yAxisLabelType"] && trim(this.vis.legacyOptions["yAxisLabelType"]) === "Manual"
          ? (this.vis.legacyOptions["yAxisLabel"] as string)
          : undefined,
      maximumCategories: 8,
      xAxisType: "auto",
      yAxisType: "auto",
      lineGap: "none",
      xAxisSortDirection: "none",
    };

    return chart;
  }

  private areaChartGumbyToLegacy(): VisualizationLegacyOptions {
    const chart: AreaChart = this.vis.chart as AreaChart;
    const legacyChart: VisualizationLegacyOptions = {
      theme: chart.legacyColorTheme,
      isStacked: chart.displayType === "stacked",
      isNormalized: chart.normalize,
      legendEnabled: this.vis.legend ? this.vis.legend.show : false,
      colorColumn: chart.groupByValue,
      xAxisType: chart.xAxisScale,
      yAxisType: chart.yAxisScale,
      xAxisLabel: chart.xAxisLabel,
      yAxisLabel: chart.yAxisLabel,
      xAxisColumn: chart.xAxisValue,
      yAxisColumns: chart.yAxisValues,
      xAxisLabelType: chart.xAxisLabel ? "Manual" : "Column",
      yAxisLabelType: chart.yAxisLabel ? "Manual" : "Column",
    };

    return legacyChart;
  }

  private multiChartLegacyToGumby(): BarLineLegacyChart {
    const xAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions.xAxis?.value);
    const xAxisScale = xAxisScaleParse.success ? xAxisScaleParse.data : "auto";

    const yAxisScaleParse = scaleSchema.safeParse(this.vis.legacyOptions.yAxisLeft?.value);
    const yAxisScale = yAxisScaleParse.success ? yAxisScaleParse.data : "auto";

    const yAxisRightScaleParse = scaleSchema.safeParse(this.vis.legacyOptions.yAxisRight?.value);
    const yAxisRightScale = yAxisRightScaleParse.success ? yAxisRightScaleParse.data : "auto";

    const chart: BarLineLegacyChart = {
      type: "bar_line",
      xAxisValue: this.vis.legacyOptions.xAxisColumn?.value,
      yAxisValues: this.vis.legacyOptions.yAxisColumns?.map((c: { value?: string }) => c.value) ?? [],
      displayType: this.vis.legacyOptions["isStacked"] ? "stacked" : "grouped",
      xAxisScale,
      yAxisScale,
      yAxisRightScale,
      groupByValue: this.vis.legacyOptions.groupColumn?.value,
      seriesConfigSchema: this.convertSeriesOptionsToGumby(),
      maximumCategories: 8,
      xAxisType: "auto",
      yAxisType: "auto",
      lineGap: "none",
      xAxisSortDirection: "none",
    };

    return chart;
  }

  private convertSeriesOptionsToGumby(): BarLineLegacyChart["seriesConfigSchema"] {
    const legacySeriesOptions = this.vis.legacyOptions.seriesOptions ?? {};
    const seriesOptionKeys = Object.keys(legacySeriesOptions);
    const seriesOptions: BarLineLegacyChart["seriesConfigSchema"] = seriesOptionKeys.map((key) => {
      return {
        key: key.replace("col-", ""),
        axis: legacySeriesOptions[key]?.axis ?? "left",
        type: legacySeriesOptions[key]?.type ?? "bar",
        color: legacySeriesOptions[key]?.color,
      };
    });
    return seriesOptions;
  }

  // bidirectional conversion between legacy and gumby donut label options
  private convertDonutLabel(option: string, direction: ConverterDirection): string {
    const map: Record<string, string> = {
      label: "label",
      "label+percent": "labelAndPercent",
      "label+value": "labelAndValue",
      percent: "percent",
      "value+percent": "valueAndPercent",
    };

    if (direction === "legacyToGumby") {
      return map[option] ?? "labelAndValue";
    } else if (direction === "gumbyToLegacy") {
      const invertedMap = _.invert(map);
      return invertedMap[option] ?? "label+value";
    } else {
      throw new Error("Invalid direction");
    }
  }
}
