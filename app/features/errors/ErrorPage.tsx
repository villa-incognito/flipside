import { ArrowLeftIcon, DiscordLink, LogoIcon } from "@fscrypto/ui";
import { Link } from "@remix-run/react";
import { useEffect } from "react";

interface ErrorPageProps {
  status: number;
  message: string;
}

const ErrorPage = ({ status, message }: ErrorPageProps) => {
  const backButtonEvent = () => {
    //** this forces the app to do a hard reload of the previous page when clicking back. This addresses the unpredictable state that an error can cause and creates a fresh page */
    //eslint-disable-next-line
    window.location.href = window.location.href;
  };
  useEffect(() => {
    window.addEventListener("popstate", backButtonEvent);
  }, []);
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex w-1/2 flex-col items-start">
        <LogoIcon className="text-gray-70 my-4 h-12 w-12" />
        <p className="text-gray-80 dark:text-gray-30 text-left text-4xl font-bold">Error: {status}</p>
        <br />
        <p className="text-gray-60 dark:text-gray-30 text-left text-2xl font-bold">We're Sorry</p>
        <p className="text-gray-60 dark:text-gray-30 text-left text-xl font-bold">{message}</p>
        <p className="w-[400px] py-8 text-sm">
          You’ve encountered an error, or the app has crashed — sorry about this! Please feel free to reach out on
          <DiscordLink className="font-bold" />
          and share any information that might help us track down the issue. (For example: what you were doing right
          before you encountered the error, your browser and OS, and anything else you think might be helpful!)
        </p>
        <Link to="/">
          <div className="flex items-center py-8">
            <ArrowLeftIcon className="text-gray-70 mr-4 h-8 w-6" />
            <p className="text-gray-70 text-sm">Back to App</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
