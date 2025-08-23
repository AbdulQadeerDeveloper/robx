"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope } from "react-icons/fa";
import { BiSolidLock } from "react-icons/bi";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [seePass, setSeePass] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      if (username) {
        localStorage.setItem("userInitial", username.charAt(0).toUpperCase());
      }

      window.location.href = "/user/dashboard";
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center bg-[var(--accent-secondary)]">
      <section className="w-10/12 max-w-lg flex flex-col justify-center gap-10 p-10 rounded-lg bg-[#18062C] text-white">
        <h2 className="text-3xl font-bold text-center text-[var(--neutral)]">
          Welcome Back!
        </h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={submitForm} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-[var(--neutral)]">
              <FaEnvelope className="w-4 h-4" /> Username
            </label>
            <input
              type="text"
              placeholder="Enter your Username"
              className="w-full p-3 border border-[var(--button)] rounded-md focus:outline-none focus:ring-2 ring-[var(--button)]/50 text-[var(--dark)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-2 text-left">
            <label className="flex items-center gap-2 text-[var(--neutral)]">
              <BiSolidLock className="w-5 h-5" /> Password
            </label>
            <div className="relative">
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
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--button)] text-white font-semibold p-4 rounded-md text-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
};

export default Login;
