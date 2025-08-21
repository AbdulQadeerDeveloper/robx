"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TasksBoard from "./TasksBoard";

export default function Page() {
    const router = useRouter();
     const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

   useEffect(() => {
    const userInitial = localStorage.getItem("userInitial");

    if (!userInitial) {
      router.replace("/auth/login");
    } else {
      setAuthorized(true); 
    }

    setCheckingAuth(false); 
  }, [router]);

   if (checkingAuth) {
    return null;
  }

  if (!authorized) {
    return null;
  }

  const userInitial = typeof window !== "undefined" && localStorage.getItem("userInitial");
  if (!userInitial) {
    return null; 
  }
  return <TasksBoard />;
}