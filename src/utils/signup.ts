export interface SignUpPayload {
  username: string;
  password: string;
  role: "admin" | "author" | "superadmin";
}

export const registerUser = async (payload: SignUpPayload) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Signup failed");
    }

    return await res.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message || "Network error");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};
