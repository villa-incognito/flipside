export interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  className?: string;
}

export const createIcon = (paths: React.ReactNode, name: string, viewBox = "0 0 26 26") => {
  const component = (props: IconProps) => {
    const { width = 24, height = 24, fill = "none" } = props;
    return (
      <svg
        viewBox={viewBox}
        fill={fill}
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        className={props.className}
      >
        {paths}
      </svg>
    );
  };
  component.displayName = name;
  return component;
};
