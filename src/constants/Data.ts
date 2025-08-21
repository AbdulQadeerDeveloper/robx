import { JSX } from "react";
import { GoHome } from "react-icons/go";

export const ACCOUNTS = [
  "Ammad",
  "Najaf",
  "Mudassir",
  "Hasnain",
  "Sahad",
  "Awais",
];

 export const COLORS = [
   "var(--accent)",
   "#F12F37",
   "#8F1E5C",
   "#0EA5E9",
   "#22C55E",
   "#F97316",
 ];

interface Sidebar {
  id: number;
  imgSrc: JSX.ElementType;
  title: string;
  link: string;
}

export const sidebarLinks: Sidebar[] = [
  {
    id: 1,
    imgSrc: GoHome,
    title: "Dashboard",
    link: "/user/dashboard",
  },
];
