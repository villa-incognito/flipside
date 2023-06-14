import { SVGProps, memo } from "react";
const SvgWarningTriangleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m4.952 16.354 5.263-10.497c.738-1.472 2.839-1.472 3.576 0l5.258 10.497a2 2 0 0 1-1.788 2.896H6.741a2 2 0 0 1-1.789-2.896Z"
    />
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v2" />
    <circle cx={12} cy={16} r={1} fill="currentColor" />
  </svg>
);
const Memo = memo(SvgWarningTriangleIcon);
export default Memo;
