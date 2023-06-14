import { SVGProps, memo } from "react";
const SvgLinkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16.75 13.25 18 12a4.243 4.243 0 0 0 0-6v0a4.243 4.243 0 0 0-6 0l-1.25 1.25M7.25 10.75 6 12a4.243 4.243 0 0 0 0 6v0a4.243 4.243 0 0 0 6 0l1.25-1.25M14.25 9.75l-4.5 4.5"
    />
  </svg>
);
const Memo = memo(SvgLinkIcon);
export default Memo;
