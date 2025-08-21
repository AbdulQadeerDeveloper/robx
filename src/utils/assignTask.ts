export interface AssignTaskPayload {
  title: string;
  description: string;
  userId: number;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "to-do" | "in-progress" | "need-review" | "done";
}

export async function assignTask(task: AssignTaskPayload) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!res.ok) {
      throw new Error(`Failed to assign task: ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error assigning task:", err);
    throw err;
  }
}
