"use client";
import { useSidebar } from "@/contexts/SidebarProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import { LogOut, SidebarClose, SidebarIcon } from "lucide-react";
import TooltipButton from "./TooltipButton";
import { signOut } from "next-auth/react";

const Sidebar = () => {
  const LINKS = [
    { href: "/dashboard", label: "Home" },
    { href: "/transactions", label: "Miners" },
    { href: "/promo", label: "Promo" },
  ];
  const pathname = usePathname();
  const { toggle, setToggle } = useSidebar();

  if (!toggle)
    return (
      <>
        <Button
          type="button"
          onClick={() => setToggle(true)}
          variant={"ghostBtn"}
          size={"btn"}
          className="fixed top-4 right-4 text-main-default z-[110]"
        >
          <SidebarIcon className="w-full h-full" />
        </Button>
      </>
    );
  return (
    <>
      <section className="lg:hidden fixed inset-0 z-[110] bg-main-default text-white flex justify-center items-center">
        <Button
          type="button"
          onClick={() => setToggle(false)}
          variant={"ghostBtn"}
          size={"btn"}
          className="absolute top-4 right-4 text-white hover:text-slate-200"
        >
          <SidebarClose className="w-full h-full" />
        </Button>
        <ul className="w-full flex flex-col justify-center items-center">
          {LINKS.map((link) => {
            const isActive =
              (pathname.includes(link.href) && link.href.length > 1) ||
              pathname === link.href;

            const activeClass = isActive
              ? "bg-white text-main-default font-bold uppercase"
              : "text-white";

            return (
              <Link
                href={link.href}
                key={link.label}
                className="w-full max-w-xs"
                onClick={() => setToggle(false)}
              >
                <li className={`${activeClass} text-2xl py-2 text-center`}>
                  {link.label}
                </li>
              </Link>
            );
          })}
          <div className="w-full flex justify-center items-center mt-10">
            <TooltipButton tooltip="Sign Out">
              <Button
                variant={"ghostBtn"}
                className="flex justify-center items-center gap-2 group hover:text-slate-300"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <span className="text-2xl uppercase">Sign Out</span>
                <LogOut className="w-full h-full transition text-white group-hover:text-slate-300" />
              </Button>
            </TooltipButton>
          </div>
        </ul>
      </section>

      <section className="fixed top-0 right-0 hidden w-48 p-4 h-screen z-[110] bg-main-default text-white lg:flex flex-col justify-between items-center pt-20">
        <Button
          type="button"
          onClick={() => setToggle(false)}
          variant={"ghostBtn"}
          size={"btn"}
          className="absolute top-4 left-4 text-white hover:text-slate-200 rotate-180"
        >
          <SidebarClose className="w-full h-full" />
        </Button>
        <ul className="w-full flex flex-col justify-center items-center">
          {LINKS.map((link) => {
            const isActive =
              (pathname.includes(link.href) && link.href.length > 1) ||
              pathname === link.href;

            const activeClass = isActive
              ? "bg-white text-main-default font-bold uppercase"
              : "text-white";

            return (
              <Link
                href={link.href}
                key={link.label}
                className="w-full max-w-xs"
                onClick={() => setToggle(false)}
              >
                <li className={`${activeClass} text-2xl py-2 text-center`}>
                  {link.label}
                </li>
              </Link>
            );
          })}
        </ul>
        <div className="w-full flex justify-center items-center">
          <TooltipButton tooltip="Sign Out">
            <Button
              variant={"ghostBtn"}
              className="flex justify-center items-center gap-2 group hover:text-slate-300"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <span className="uppercase text-xl">Sign Out</span>
              <LogOut className="w-full h-full transition text-white group-hover:text-slate-300" />
            </Button>
          </TooltipButton>
        </div>
      </section>
    </>
  );
};

export default Sidebar;
