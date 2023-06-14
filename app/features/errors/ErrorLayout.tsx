import { Links, Meta, Scripts } from "@remix-run/react";

export default function ErrorLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
