"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { sidebarLinks } from "@/constants/Data";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <section className=" w-full h-full space-y-10 bg-white p-4 md:p-6 2xl:p-7 overflow-y-auto border-r border-[#EAECF0]">
      {/* Logo */}
      <div className="flex items-center justify-start gap-7">
        <span className="text-2xl font-semibold text-black">
          Task Management
        </span>
      </div>

      {/* Links */}
      <div className="flex flex-col items-start justify-start gap-4 ">
        {sidebarLinks.map((item) => {
          const isActive = pathname === item.link;

          return (
            <Link
              key={item.id}
              href={item.link}
              className={`w-full flex items-center font-medium text-lg xl:text-xl gap-2 2xl:gap-4 px-4 2xl:px-6 py-4 rounded-2xl transition-colors ${
                isActive ? "bg-[var(--button)] text-white" : "bg-transparent"
              }`}
            >
              <item.imgSrc />
              {item.title}
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Sidebar;
