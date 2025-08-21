export interface AddUserPayload {
  name: string;
  phone: string;
  designation: string;
}

export interface AddUserResponse {
  message: string;
  userId?: number;
}

export const addUser = async (
  payload: AddUserPayload
): Promise<AddUserResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type");
    let errorMsg = "Failed to add user";

    if (contentType?.includes("application/json")) {
      const errorData = await res.json();
      errorMsg = errorData.message || errorMsg;
    } else {
      errorMsg = await res.text();
    }

    throw new Error(errorMsg);
  }

  return res.json();
};
