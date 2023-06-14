import { ArrowLeftIcon, LogoIcon } from "@fscrypto/ui";
import { Link } from "@remix-run/react";
import { Button } from "@fscrypto/ui";

const ErrorUnauthorized = () => {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="flex w-1/2 flex-col items-start">
        <LogoIcon className="text-gray-70 my-4 h-12 w-12" />
        <p className="text-gray-80 dark:text-gray-30 text-left text-4xl font-bold">Error: 401 Unauthorized</p>
        <br />
        <p className="text-gray-60 dark:text-gray-30 text-left text-2xl font-bold">Please login.</p>
        <p className="text-gray-60 dark:text-gray-30 text-left text-xl font-bold">Your session may have expired.</p>

        <Link className="pt-8" to="/auth/auth0">
          <Button variant="primary" size="sm">
            Login
          </Button>
        </Link>
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

export default ErrorUnauthorized;
