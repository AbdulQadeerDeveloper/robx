export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
  };
}

export const loginAdmin = async (username: string, password: string): Promise<LoginResponse> => {
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });


  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data: LoginResponse = await res.json();
  return data;
};
