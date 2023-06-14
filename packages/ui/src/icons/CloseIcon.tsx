import { SVGProps, memo } from "react";
const SvgCloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m17.25 6.75-10.5 10.5M6.75 6.75l10.5 10.5"
    />
  </svg>
);
const Memo = memo(SvgCloseIcon);
export default Memo;
