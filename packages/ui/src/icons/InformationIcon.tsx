import { SVGProps, memo } from "react";
const SvgInformationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 13v2" />
    <circle cx={12} cy={9} r={1} fill="currentColor" />
    <circle
      cx={12}
      cy={12}
      r={7.25}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);
const Memo = memo(SvgInformationIcon);
export default Memo;
