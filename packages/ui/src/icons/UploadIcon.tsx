import { SVGProps, memo } from "react";
const SvgUploadIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M4.75 14.75v1.5a3 3 0 0 0 3 3h8.5a3 3 0 0 0 3-3v-1.5M12 14.25V5M8.75 8.25 12 4.75l3.25 3.5"
    />
  </svg>
);
const Memo = memo(SvgUploadIcon);
export default Memo;
