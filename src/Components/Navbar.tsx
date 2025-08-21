"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TbMenu3, TbX } from "react-icons/tb";


const Navbar = () => {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const sidebarLinkClass =
    "w-full flex items-center font-medium text-lg xl:text-xl gap-2 2xl:gap-4 px-4 2xl:px-6 py-4 rounded-2xl transition-colors bg-[var(--button)] text-white";
  const handleLogout = async () => {
    try {
    

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
       
      });

    

      window.location.href = "/auth/login";
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
              <h3 className="text-xl font-semibold">Menu</h3>
              <TbX
                size={28}
                className="cursor-pointer text-gray-600 hover:text-black"
                onClick={() => setIsSidebarOpen(false)}
              />
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4">
              <button
                className={sidebarLinkClass}
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </button>
              <button
                className={sidebarLinkClass}
                onClick={() => router.push("/tasks")}
              >
                My Tasks
              </button>
              <button
                className={sidebarLinkClass}
                onClick={() => router.push("/settings")}
              >
                Settings
              </button>
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

      {/* DESKTOP NAVBAR */}
      <div className="sticky top-0 border-b border-gray-200 bg-white p-6 z-30 hidden xl:flex items-center justify-between shadow">
        <h2 className="text-2xl font-semibold text-black">TO DO LIST</h2>

        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </>
  );
};

export default Navbar;
