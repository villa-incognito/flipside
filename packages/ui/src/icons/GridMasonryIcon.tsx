import { SVGProps, memo } from "react";
const SvgGridMasonryIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M5.75 19.25h3.5a1 1 0 0 0 1-1V5.75a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v12.5a1 1 0 0 0 1 1ZM14.75 10.25h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1ZM14.75 19.25h3.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1h-3.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1Z"
    />
  </svg>
);
const Memo = memo(SvgGridMasonryIcon);
export default Memo;
