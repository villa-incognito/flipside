import { createIcon } from "./shared";

const paths = (
  <>
    <path
      d="M32.0837 19.9998C32.0837 26.6733 26.6738 32.0832 20.0003 32.0832C13.3269 32.0832 7.91699 26.6733 7.91699 19.9998C7.91699 13.3264 13.3269 7.9165 20.0003 7.9165C26.6738 7.9165 32.0837 13.3264 32.0837 19.9998Z"
      fill="#666666"
      stroke="#666666"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.583 6.6665V17.0832C19.583 18.9241 21.0754 20.4165 22.9163 20.4165H33.333"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </>
);

const PieChartFilledIcon = createIcon(paths, "PieChartFilledIcon", "0 0 40 40");

export default PieChartFilledIcon;
