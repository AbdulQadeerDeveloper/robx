"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FaRegUser, FaClock } from "react-icons/fa";
import TaskForm from "../Modals/TaskForm";
import Modal from "../Modals/Modal";

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onUpdate, onDelete }: TaskCardProps) {
  const [prevStatus, setPrevStatus] = useState<Task["status"]>();

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease",
  };

  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updatedTask: Partial<Task>) => {
    onUpdate({
      ...task,
      ...updatedTask,
      id: task.id,
      assignedTo: updatedTask.assignedTo ?? task.assignedTo,
      comments: updatedTask.comments ?? task.comments ?? "",
    });
    setIsEditing(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="bg-[#F7F2FA] border border-[var(--button)] rounded-2xl p-4 md:p-6 lg:p-7 shadow-sm flex flex-col gap-3"
      >
        {/* Title row */}
        <div className="flex items-center gap-2">
          <input
            id={`task-checkbox-${task.id}`}
            type="checkbox"
            checked={task.status === "done"}
            onChange={(e) => {
              let newStatus: Task["status"];
              let updatedTask: Task & { prevStatus?: Task["status"] };

              if (e.target.checked) {
                // Save current status inside the task
                newStatus = "done";
                updatedTask = {
                  ...task,
                  status: newStatus,
                  prevStatus: task.status,
                };
              } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                newStatus = (task as any).prevStatus || "to-do";
                updatedTask = {
                  ...task,
                  status: newStatus,
                  prevStatus: undefined,
                };
              }

              onUpdate(updatedTask);

              fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/task/update/${task.id}`,
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: newStatus }),
                }
              ).catch((err) => console.error("Error updating task:", err));
            }}
          />

          <h3 className="text-base 2xl:text-lg font-medium text-[#232360] break-words uppercase">
            {task.title}
          </h3>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between text-sm text-[#B94B4B] mt-2">
          {/* Assigned user */}
          <div className="flex items-center gap-2">
            <FaRegUser className="text-black" />
            <span>{task.assignedUser?.name || "Unassigned"}</span>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2">
            <FaClock className="text-black" />
            <span>
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <TaskForm
          taskId={task.id}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    </>
  );
}
