import { SVGProps, memo } from "react";
const SvgPlusIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 5.75v12.5M18.25 12H5.75"
    />
  </svg>
);
const Memo = memo(SvgPlusIcon);
export default Memo;
