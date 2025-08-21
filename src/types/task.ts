export interface Task {
  id: string;
  title: string;
  description:string;
  assignedTo: string;
 assignedUser?: {
    id: number;
    name: string;
    phone?: string;
  };
    dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
status: "to-do" | "in-progress" | "need-review" | "done";
  comments: string;
}
