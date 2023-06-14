import { SVGProps, memo } from "react";
const SvgBookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.25 5.75a1 1 0 0 0-1-1H14a2 2 0 0 0-2 2v12.5l.828-.828a4 4 0 0 1 2.829-1.172h2.593a1 1 0 0 0 1-1V5.75ZM4.75 5.75a1 1 0 0 1 1-1H10a2 2 0 0 1 2 2v12.5l-.828-.828a4 4 0 0 0-2.829-1.172H5.75a1 1 0 0 1-1-1V5.75Z"
    />
  </svg>
);
const Memo = memo(SvgBookIcon);
export default Memo;
