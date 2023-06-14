import { useEffect, useRef, useState } from "react";
import { isEqual } from "lodash";
import { Popover } from "../popover";
import Saturation from "@uiw/react-color-saturation";
import Hue from "@uiw/react-color-hue";
import EditableInput from "@uiw/react-color-editable-input";
import { hsvaToHex, getContrastingColor, hexToHsva } from "@uiw/color-convert";
import Swatch from "@uiw/react-color-swatch";

const standard = ["#04e1cb", "#1b96ff", "#ba01ff", "#baec70", "#ff5d2d", "#ac8e68", "#ffe620", "#e3066a", "#c9c9c9"];

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const ColorPicker = ({
  value,
  onChange,
  label,
  defaultColors,
  size = "md",
}: {
  label?: string;
  value?: string;
  onChange?: (val: string) => void;
  defaultColors?: string[];
  size?: "sm" | "md" | "lg";
}) => {
  const colors = defaultColors ?? standard;
  const [hsva, setHsva] = useState(() => (value ? hexToHsva(value) : hexToHsva("#ddd")));
  const hsvaRef = useRef(hsva);
  useEffect(() => {
    if (value) {
      setHsva(hexToHsva(value));
    }
  }, [value]);
  useEffect(() => {
    if (!isEqual(hsva, hsvaRef.current)) {
      onChange?.(hsvaToHex(hsva));
      hsvaRef.current = hsva;
    }
  }, [hsva, onChange]);
  return (
    <Popover.Root>
      <Popover.Trigger>
        <div className={`p-1 border rounded-lg ${sizeMap[size]}`}>
          <div className="w-full h-full rounded" style={{ background: hsvaToHex(hsva) }}></div>
        </div>
      </Popover.Trigger>
      <Popover.Content side="top">
        {label && <div className="border-b w-full px-2 py-1 font-medium text-gray-70 dark:text-gray-30">{label}</div>}
        <div className="p-2 w-[274px]" onClick={(e) => e.stopPropagation()}>
          <div className="mb-2">
            <div className="text-sm text-gray-70 mb-1 font-medium dark:text-gray-30">Default Colors:</div>
            <Swatch
              colors={colors}
              color={hsvaToHex(hsva)}
              rectProps={{
                children: <Point />,
                style: {
                  width: "38px",
                  height: "38px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                },
              }}
              onChange={(newColor) => {
                setHsva({ ...hsva, ...newColor, a: hsva.a });
              }}
            />
          </div>
          <Saturation
            style={{ width: "100%" }}
            hsva={hsva}
            onChange={(newColor) => {
              setHsva({ ...hsva, ...newColor, a: hsva.a });
            }}
          />
          <div className="my-3">
            <Hue
              hue={hsva.h}
              style={{ height: "32px" }}
              onChange={(newHue) => {
                setHsva({ ...hsva, ...newHue });
              }}
            />
          </div>
          <div className="flex justify-between mt-2 items-center">
            <div className="text-sm text-gray-70 mb-1 font-medium dark:text-gray-30 mr-3">Hex:</div>
            <EditableInput
              value={hsvaToHex(hsva)}
              inputStyle={{
                width: "100%",
                padding: "4px",
                borderRadius: "4px",
                fontSize: "14px",
                paddingLeft: "10px",
              }}
              className="[&>input]:dark:border-gray-70 [&>input]:dark:bg-gray-90 dark:text-gray-30"
              style={{ width: "100%", alignItems: "flex-start" }}
              onChange={(e, val) => {
                if (val) {
                  setHsva(hexToHsva(val.toString()));
                }
              }}
            />
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

function Point(props: { color?: string; checked?: boolean }) {
  if (!props.checked) return null;
  return (
    <div
      style={{
        height: 12,
        width: 12,
        borderRadius: "50%",
        backgroundColor: getContrastingColor(props.color!),
      }}
    />
  );
}

export default ColorPicker;
