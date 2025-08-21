"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { IoCloseSharp } from "react-icons/io5";

const SidebarWrapper = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const toggle = (e: Event) => {
      const custom = e as CustomEvent;
      const newState = custom.detail?.open ?? !isOpen;
      setIsOpen(newState);
      // Notify back to sync Navbar state
      window.dispatchEvent(
        new CustomEvent("sidebar-toggled", { detail: { open: newState } })
      );
    };

    window.addEventListener("toggle-sidebar", toggle);
    return () => window.removeEventListener("toggle-sidebar", toggle);
  }, [isOpen]);

  const closeSidebar = () => {
    setIsOpen(false);
    window.dispatchEvent(
      new CustomEvent("sidebar-toggled", { detail: { open: false } })
    );
  };

  return (
    <aside
      className={`fixed xl:relative !z-50 xl:translate-x-0 transition-transform duration-500 sidebar-scroll xl:col-span-3 2xl:col-span-2 xl:row-span-3 xl:row-start-1 xl:block h-screen w-full md:w-[300px] lg:w-[330px] xl:w-auto ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <IoCloseSharp
        className="block md:hidden absolute top-4 right-4 text-white"
        size={30}
        type="button"
        onClick={closeSidebar}
      />
      <Sidebar />
    </aside>
  );
};

export default SidebarWrapper;
