"use client";

import { Task } from "@/types/task";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onUpdate, onDelete }: TaskListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.length === 0 ? (
        <p className="text-center col-span-full">No tasks available.</p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        ))
      )}
    </div>
  );
}
