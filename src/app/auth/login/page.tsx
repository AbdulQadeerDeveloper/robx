"use client";

import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { BiSolidLock } from "react-icons/bi";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Link from "next/link";
import { loginAdmin } from "@/utils/login";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [seePass, setSeePass] = useState<"text" | "password">("password");
  const [error, setError] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError({});

    if (!email) {
      setError((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }
    if (!password) {
      setError((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      const data = await loginAdmin(email, password);
      localStorage.setItem("token", data.token);
      router.push("/user/dashboard");
    } catch (err: unknown) {
      console.error("Caught error during login:", err);

      let message = "An error occurred. Please try again.";

      if (err instanceof Error) {
        message = err.message;
      }

      setError((prev) => ({
        ...prev,
        email: message,
      }));
    }
  };

  return (
    <main className="relative w-full min-h-screen flex items-center justify-between bg-[var(--accent-secondary)]">
      <section className="w-1/2 h-screen hidden lg:block bg-[url('/Auth/Auth-Hero.jpg')] bg-cover bg-end bg-no-repeat"></section>
      <section className="text-white w-10/12 lg:w-[45%] flex flex-col justify-center gap-10 max-w-lg h-full mx-auto p-10 border-1 border-[var(--button)] rounded-lg bg-[#18062C]">
        <h2 className="text-3xl font-bold text-center text-[var(--neutral)]">
          Welcome Back!
        </h2>
        <form onSubmit={submitForm} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-[var(--neutral)]">
              <FaEnvelope className="w-4 h-4" /> Username
            </label>
            <div className="relative group">
              <input
                type="text"
                placeholder="Enter your Username"
                className="w-full p-3 border border-[var(--button)] rounded-md focus:outline-none focus:ring-2 ring-[var(--button)]/50 text-[var(--dark)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {/* {error.email && (
                <div className="absolute hidden group-hover:block bg-[var(--dark)] text-[var(--neutral)] text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  {error.email}
                </div>
              )} */}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-[var(--neutral)]">
              <BiSolidLock className="w-5 h-5" /> Password
            </label>
            <div className="relative group">
              <input
                type={seePass}
                placeholder="Enter your password"
                className="w-full p-3 border border-[var(--button)] rounded-md focus:outline-none focus:ring-2 ring-[var(--button)]/50 text-[var(--dark)]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() =>
                  setSeePass(seePass === "password" ? "text" : "password")
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--neutral)]"
              >
                {seePass === "password" ? (
                  <AiFillEye className="w-5 h-5" />
                ) : (
                  <AiFillEyeInvisible className="w-5 h-5" />
                )}
              </button>
              {/* {error.password && (
                <div className="absolute hidden group-hover:block bg-[var(--dark)] text-[var(--neutral)] text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                  {error.password}
                </div>
              )} */}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[var(--button)] text-white font-semibold p-4 rounded-md text-lg"
          >
            Login
          </button>
        </form>
        {/* <span className="text-center mx-auto text-[var(--neutral)]">
          Don&apos;t have an Account?{" "}
          <Link href="/auth/signup" className="underline text-[var(--neutral)]">
            Register
          </Link>
        </span> */}
      </section>
    </main>
  );
};

export default Login;
