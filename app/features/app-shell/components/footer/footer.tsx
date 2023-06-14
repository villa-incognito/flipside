import { DiscordIcon, LinkedinIcon, LogoIcon, TwitterIcon } from "@fscrypto/ui";
import { Link } from "@remix-run/react";

const navigation = {
  analysts: [
    { name: "Bounties", href: "https://earn.flipsidecrypto.xyz" },
    { name: "Tools & Apps", href: "https://science.flipsidecrypto.xyz/research" },
    { name: "API", href: "https://flipsidecrypto.xyz/account/api-keys" },
  ],
  partners: [{ name: "Enterprise Data", href: "https://data.flipsidecrypto.xyz" }],
  company: [
    { name: "Careers", href: "https://flipsidecrypto.breezy.hr" },
    { name: "Terms & Privacy", href: "https://flipsidecrypto.xyz/terms" },
  ],
  research: [
    { name: "Analyst Tips", href: "https://data.flipsidecrypto.com/analyst-emails" },
    { name: "Crypto Research Newsletter", href: "https://flipsidecrypto.beehiiv.com" },
    { name: "Governance Blog", href: "https://medium.com/flipside-governance" },
  ],
  social: [
    {
      name: "Twitter",
      href: "https://twitter.com/flipsidecrypto",
      icon: <TwitterIcon />,
    },
    {
      name: "Discord",
      href: "https://discord.gg/ZmU3jQuu6W",
      icon: <DiscordIcon />,
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/flipside-crypto",
      icon: <LinkedinIcon />,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-20 dark:bg-gray-90 relative bottom-0" aria-labelledby="footer-heading">
      <div className="mx-auto w-full p-8">
        <div className="pr-20 xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 text-lg dark:text-white">
              <LogoIcon className="h-6 dark:fill-white" />
              <span className="text-xl font-normal">flipside</span>
            </Link>
            <div className="ml-2 flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-gray-500"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="dark:text-gray-30 text-sm font-semibold leading-6 text-gray-900">For Analysts</h3>
                <ul className="mt-3 space-y-3">
                  {navigation.analysts.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="dark:hover:text-gray-40 text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="dark:text-gray-30 text-sm font-semibold leading-6 text-gray-900">For Partners</h3>
                <ul className="mt-3 space-y-3">
                  {navigation.partners.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="dark:hover:text-gray-40 text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="dark:text-gray-30 text-sm font-semibold leading-6 text-gray-900">Company</h3>
                <ul className="mt-3 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="dark:hover:text-gray-40 text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="dark:text-gray-30 text-sm font-semibold leading-6 text-gray-900">
                  Newsletters &amp; Research
                </h3>
                <ul className="mt-3 space-y-3">
                  {navigation.research.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className="dark:hover:text-gray-40 text-sm leading-6 text-gray-600 hover:text-gray-900 dark:text-gray-50"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
          <p className="text-gray-70 text-xs leading-5">&copy; {new Date().getFullYear()} Flipside Crypto</p>
        </div>
      </div>
    </footer>
  );
}
