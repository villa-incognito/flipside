import { createIcon } from "./shared";

const paths = (
  <>
    <path
      d="M7.91699 11.2498C7.91699 9.40889 9.40938 7.9165 11.2503 7.9165H28.7503C30.5913 7.9165 32.0837 9.40889 32.0837 11.2498V28.7498C32.0837 30.5908 30.5913 32.0832 28.7503 32.0832H11.2503C9.40938 32.0832 7.91699 30.5908 7.91699 28.7498V11.2498Z"
      fill="#666666"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M14.583 25.4167V16.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25.417 25.4167V16.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 25.4167V21.25" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>
);
const BarChartFilledIcon = createIcon(paths, "BarChartFilledIcon", "0 0 40 40");

export default BarChartFilledIcon;
