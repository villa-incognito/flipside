import { Avatar, Button, Dropdown, LogoIcon } from "@fscrypto/ui";
import { FiArrowRight, FiChevronDown, FiMenu, FiMoreHorizontal } from "react-icons/fi";
import { BsDiscord, BsTwitter } from "react-icons/bs";
import { Link, NavLink, Outlet } from "@remix-run/react";
import { cva } from "class-variance-authority";
import { useOptionalUser } from "~/utils/auth";
import { trackInterface } from "~/utils/tracking";
import { useUserStateMachine } from "~/state/machines/user-state/user-state";
import { useState } from "react";
import { motion } from "framer-motion";
import { $path } from "remix-routes";
import * as Portal from "@radix-ui/react-portal";

const track = trackInterface("Top Nav");

// Tailwind styling for the primary nav items
const navItem = cva("h-8 text-base md:text-sm font-medium flex space-x-2 items-center rounded-lg px-3", {
  variants: {
    state: {
      active: "text-black dark:text-white",
      inactive: "text-neutral-400 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white",
    },
  },
  defaultVariants: {
    state: "inactive",
  },
});

const primaryItems = [
  { label: "Discover", to: "/", testId: "nav-discover" },
  { label: "Studio", to: "/edit", testId: "nav-studio" },
  { label: "API", to: "/account/api-keys", testId: "nav-api" },
] as const;

const secondaryItems = [
  { label: "Tools & Apps", to: "https://science.flipsidecrypto.xyz/research" },
  { label: "Documentation", to: "https://docs.flipsidecrypto.com/" },
  { label: "Bounties", to: "https://earn.flipsidecrypto.xyz/" },
  { label: "Governance", to: "https://medium.com/flipside-governance" },
] as const;

const tertiaryItems = [{ label: "Data Shares", to: "https://data.flipsidecrypto.com/data-shares" }] as const;

function ShellUser() {
  const user = useOptionalUser();
  const { theme, setTheme } = useUserStateMachine();

  if (!user) {
    return (
      <div className="flex items-center space-x-1">
        <Link to="/auth/auth0" className={navItem()} onClick={() => track(`Click Login`)}>
          Log in
        </Link>
        <Button variant="primary" size="sm" asChild>
          <Link to="/auth/auth0?screen_hint=signup" onClick={() => track(`Click Signup`)}>
            Sign up
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger>
        <div className="flex items-center space-x-2 text-sm dark:text-zinc-400">
          <Avatar size="sm" src="" />
          <span>{user.username}</span>
          <FiChevronDown className="h-4 w-4" />
        </div>
      </Dropdown.Trigger>
      <Dropdown.Content className="z-50">
        <Dropdown.Item asChild>
          <NavLink to={`/${user.username}`} onClick={() => track(`Click Profile`)}>
            Profile
          </NavLink>
        </Dropdown.Item>
        <Dropdown.Item asChild>
          <NavLink to={$path("/account/profile")} onClick={() => track(`Click Edit Profile`)}>
            Edit Profile
          </NavLink>
        </Dropdown.Item>
        <Dropdown.Item asChild>
          <NavLink to="/auth/auth0/logout" onClick={() => track(`Click Logout`)}>
            Logout
          </NavLink>
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => {
            setTheme(theme === "light" ? "dark" : "light");
            track(theme === "light" ? "set_theme-dark" : "set_theme_light");
          }}
        >
          {theme === "light" ? "Dark" : "Light"} Mode
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}

function ShellNavMobile() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="text-black dark:text-white"
        aria-label="menu"
        name="menu"
      >
        <FiMenu />
      </button>

      {open ? (
        <Portal.Root className="absolute inset-0 z-50 overflow-hidden md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-zinc-900/10 backdrop-blur-sm" onClick={() => setOpen(false)} />
          {/* Drawer */}
          <motion.div
            className="absolute inset-y-0 w-72 space-y-6 overflow-y-scroll bg-zinc-50 dark:bg-zinc-950"
            initial="closed"
            animate="open"
            transition={{ duration: 0.2, ease: "circOut" }}
            variants={{ closed: { x: "-100%" }, open: { x: 0 } }}
          >
            <Link to="/" className="p-4 dark:text-white" onClick={() => track("Click Home")}>
              <LogoIcon />
            </Link>

            <nav className="space-y-2 p-2">
              {primaryItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => navItem({ state: isActive ? "active" : "inactive" })}
                  onClick={() => track(`Click ${item.label}`)}
                  aria-label={`Open ${item.label}`}
                >
                  <span data-testid={item.testId}>{item.label}</span>
                </NavLink>
              ))}
              {tertiaryItems.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  className={navItem()}
                  onClick={() => track(`Click ${item.label}`)}
                  aria-label={`Open ${item.label}`}
                >
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>
            <nav className="flex flex-col space-y-4 px-4 dark:text-zinc-400">
              {secondaryItems.map((item) => (
                <a
                  key={item.to}
                  href={item.to}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => track(`Click ${item.label}`)}
                  aria-label={`Open ${item.label}`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="p-4">
              <ShellUser />
            </div>
          </motion.div>
        </Portal.Root>
      ) : null}
    </div>
  );
}

export default function Shell() {
  return (
    <div className="relative flex min-h-screen flex-col antialiased">
      <header className="sticky top-0 z-40 w-full whitespace-nowrap bg-[#F7F8FA] dark:bg-zinc-800">
        <div className="items-center justify-between px-4 md:flex md:h-[50px]">
          {/* Left */}
          <div className="flex h-12 items-center justify-between md:h-auto md:w-[300px]">
            <Link
              to="/"
              className="flex items-center space-x-2 text-lg dark:text-white"
              onClick={() => track("Click Home")}
            >
              <LogoIcon className="h-6 dark:fill-white" />
              <span className="text-xl font-normal">flipside</span>
            </Link>
            <ShellNavMobile />
          </div>

          {/* Center */}
          <nav className="hidden space-x-1 md:flex">
            {primaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => navItem({ state: isActive ? "active" : "inactive" })}
                onClick={() => track(`Click ${item.label}`)}
              >
                <span data-testid={item.testId}>{item.label}</span>
              </NavLink>
            ))}
            <Dropdown.Root>
              <Dropdown.Trigger aria-label="secondary-items">
                <div className={navItem()} onClick={() => track("Click More")}>
                  <FiMoreHorizontal className="h-4 w-4" />
                </div>
              </Dropdown.Trigger>
              <Dropdown.Content className="z-50">
                {secondaryItems.map((item) => (
                  <Dropdown.Item key={item.to} asChild>
                    <a
                      key={item.to}
                      href={item.to}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => track(`Click ${item.label}`)}
                    >
                      {item.label}
                    </a>
                  </Dropdown.Item>
                ))}
              </Dropdown.Content>
            </Dropdown.Root>
          </nav>

          {/* Right */}
          <div className="hidden w-[300px] items-center justify-end space-x-4 text-zinc-500 md:flex">
            {tertiaryItems.map((item) => (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center justify-center space-x-1 rounded-full bg-gradient-to-r from-indigo-400/20 to-cyan-400/20 px-3 py-1 text-sm"
                onClick={() => track(`Click ${item.label}`)}
                aria-label={`Open ${item.label} in new tab`}
              >
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-500 bg-clip-text font-medium text-transparent">
                  {item.label}
                </span>
                <FiArrowRight className="text-cyan-500 transition-all group-hover:translate-x-1" />
              </a>
            ))}
            <a
              href="https://twitter.com/flipsidecrypto"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400"
              onClick={() => track(`Click Twitter`)}
              aria-label={`Open Twitter in new tab`}
            >
              <BsTwitter />
            </a>
            <a
              href="https://discord.com/invite/ZmU3jQuu6W"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-400"
              onClick={() => track(`Click Discord`)}
              aria-label={`Open Discord in new tab`}
            >
              <BsDiscord />
            </a>
            <ShellUser />
          </div>
        </div>
      </header>

      <main className="relative flex-1">
        <Outlet />
      </main>
    </div>
  );
}
