"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TbMenu3, TbX } from "react-icons/tb";
import Image from "next/image";

const Navbar = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [userInitial, setUserInitial] = useState<string | null>(null);

  useEffect(() => {
    const initial = localStorage.getItem("userInitial");
    setUserInitial(initial);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sidebarLinkClass =
    "w-full flex items-center font-medium text-lg xl:text-xl gap-2 2xl:gap-4 px-4 2xl:px-6 py-4 rounded-2xl transition-colors bg-[var(--button)] text-white";

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      localStorage.clear();
      // window.location.href = "/auth/login";
      router.push("/auth/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {/* MOBILE NAVBAR */}
      <div className="sticky top-0 w-full border-b border-[#EAECF0] bg-white p-4 md:p-6 z-30 flex items-center justify-between shadow xl:hidden">
        <h2 className="text-2xl font-semibold text-black">TO DO LIST</h2>

        <TbMenu3
          className="text-black cursor-pointer"
          size={30}
          onClick={() => setIsSidebarOpen(true)}
        />
      </div>

      {/* Sidebar (Mobile only) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          <div className="relative w-full h-full bg-white shadow-lg flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-semibold text-black">TO DO LIST</h2>
              <TbX
                size={28}
                className="cursor-pointer text-gray-600 hover:text-black"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP + IPAD NAVBAR */}
      <div className="sticky top-0 border-b border-gray-200 bg-white p-6 z-30 hidden md:flex items-center justify-between shadow">
        <h2 className="text-2xl font-semibold text-black">TO DO LIST</h2>

        {/* Buttons visible on desktop + iPad */}
        <div className="flex gap-4">
          <button
            className={sidebarLinkClass}
            onClick={() => router.push("/dashboard")}
          >
            Dashboard
          </button>
        </div>

        {/* User Avatar */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-200 text-black font-bold">
              {userInitial ? (
                <span>{userInitial}</span>
              ) : (
                <Image
                  src="/user-avatar.png"
                  alt="User Avatar"
                  width={40}
                  height={40}
                  className="object-cover w-full h-full rounded-full"
                />
              )}
            </div>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-100 rounded-md"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
