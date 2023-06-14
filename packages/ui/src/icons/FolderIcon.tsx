import { SVGProps, memo } from "react";
const SvgFolderIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M19.25 17.25v-7.5a2 2 0 0 0-2-2H4.75v9.5a2 2 0 0 0 2 2h10.5a2 2 0 0 0 2-2Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m13.5 7.5-.931-1.708a2 2 0 0 0-1.756-1.042H6.75a2 2 0 0 0-2 2V11"
    />
  </svg>
);
const Memo = memo(SvgFolderIcon);
export default Memo;
