"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { FaPlus, FaCheckCircle, FaUserCircle, FaRegEdit } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { BiSolidWatch } from "react-icons/bi";
import Modal from "@/Components/Modals/Modal";
import TaskForm from "@/Components/Modals/TaskForm";
import AddMemberModal from "@/Components/Modals/AddmemberModal";
import { COLORS } from "@/constants/Data";
import { Task } from "@/types/task";
import { MdDelete, MdOutlineWatchLater } from "react-icons/md";
import { Pencil, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
}

type BackendStatus = "to-do" | "in-progress" | "need-review" | "done";

const statusLabels: Record<BackendStatus, string> = {
  "to-do": "To Do",
  "in-progress": "In Progress",
  "need-review": "Need Review",
  done: "Done",
};

const statusOrder: BackendStatus[] = [
  "to-do",
  "in-progress",
  "need-review",
  "done",
];

const statusColors: Record<BackendStatus, string> = {
  "to-do": "text-gray-400",
  "in-progress": "text-red-500",
  "need-review": "text-yellow-500",
  done: "text-green-500",
};

function StatusIcon({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (id: string, newStatus: BackendStatus) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    const currentIndex = statusOrder.indexOf(task.status as BackendStatus);
    const nextStatus =
      statusOrder[(currentIndex + 1) % statusOrder.length] || "to-do";

    try {
      await onStatusChange(task.id, nextStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} className="mr-2">
      {loading ? (
        <ImSpinner2 className="animate-spin text-purple-500 text-lg" />
      ) : (
        <FaCheckCircle
          className={`${statusColors[task.status as BackendStatus]} text-lg`}
        />
      )}
    </button>
  );
}

export default function TasksBoard({
  refreshTrigger,
}: {
  refreshTrigger?: number;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [visibleCounts, setVisibleCounts] = useState<
    Record<BackendStatus, number>
  >({
    "to-do": 4,
    "in-progress": 4,
    "need-review": 4,
    done: 4,
  });

  const handleDelete = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/task/delete/${taskId}`,
          { method: "DELETE" }
        );
        fetchTasks();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const changeStatus = async (taskId: string, newStatus: BackendStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/update/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating status:", error);
      fetchTasks();
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const newStatus = result.destination.droppableId as BackendStatus;
    const taskId = result.draggableId;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/update/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error("Error updating task status:", error);
      fetchTasks();
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/getAll`);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data: Task[] = await res.json();
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getAll`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const columns = [
    { id: "to-do", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "need-review", title: "Need Review" },
    { id: "done", title: "Done" },
  ];

  const handleLoadMore = (colId: BackendStatus) => {
    setVisibleCounts((prev) => ({
      ...prev,
      [colId]: prev[colId] + 4,
    }));
  };

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-700";
      case "normal":
        return "bg-blue-100 text-blue-700";
      case "high":
        return "bg-yellow-100 text-yellow-700";
      case "urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  return (
    <div className="space-y-10 p-6 min-h-screen board-background">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-purple-700">
            {currentDate.toLocaleString("en-US", { month: "long" })}
          </span>
          <span className="font-medium text-gray-600">
            Today is {formattedDate}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* <div className="flex items-center">
            {loading ? (
              <div className="h-6 w-6 animate-spin border-4 border-purple-500 border-r-transparent rounded-full"></div>
            ) : (
              users.map((user, index) => (
                <div key={user.id} className="group relative">
                  <div
                    className="w-9 h-9 border rounded-full flex items-center justify-center -ml-2 shadow-md text-white font-bold"
                    style={{
                      backgroundColor: COLORS[index] || getRandomColor(),
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 -top-8 left-1/2 transform -translate-x-1/2">
                    {user.name}
                  </div>
                </div>
              ))
            )}
          </div> */}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center px-4 py-2 border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-100 transition"
            >
              <FaPlus className="mr-2" /> Add Members
            </button>
            <button
              onClick={() => {
                setEditingTaskId(null);
                setIsFormOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <FaPlus className="mr-2" /> New Task
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isFormOpen && !editingTaskId}
        onClose={() => setIsFormOpen(false)}
      >
        <TaskForm
          onCancel={() => setIsFormOpen(false)}
          onSubmit={(newTask) => {
            setTasks((prev) => [...prev, newTask as Task]);
            setIsFormOpen(false);
          }}
          refreshTasks={fetchTasks}
        />
      </Modal>

      <Modal
        isOpen={isFormOpen && !!editingTaskId}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTaskId(null);
        }}
      >
        <TaskForm
          task={tasks.find((t) => t.id === editingTaskId) || undefined}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTaskId(null);
          }}
          onSubmit={() => {
            fetchTasks();
            setIsFormOpen(false);
            setEditingTaskId(null);
          }}
          refreshTasks={fetchTasks}
        />
      </Modal>

      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)}>
        <AddMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onUserAdded={fetchUsers}
        />
      </Modal>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 ">
          {columns.map((col) => {
            const columnTasks = tasks.filter((task) => {
              console.log(col.id);
              // if (col.id === "need-review") {
              //   const today = new Date().toISOString().split("T")[0];
              //   const taskDate = task.dueDate
              //     ? new Date(task.dueDate).toISOString().split("T")[0]
              //     : null;

              //   return (
              //     task.status === col.id &&
              //     taskDate !== null &&
              //     taskDate < today
              //   );
              // }
              return task.status === col.id;
            });

            const visibleTasks = columnTasks.slice(
              0,
              visibleCounts[col.id as BackendStatus]
            );

            return (
              <Droppable key={col.id} droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    className={`kanban-column flex flex-col rounded-lg p-4 border-2 transition   ${
                      snapshot.isDraggingOver
                        ? "bg-purple-100 "
                        : "bg-white/70 "
                    }`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-black">
                        {col.title}
                      </h2>
                      <button
                        className="text-black hover:text-black text-1xl"
                        onClick={() => setIsFormOpen(true)}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    {visibleTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={String(task.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-4 rounded-xl p-3 bg-white shadow ${
                              snapshot.isDragging ? "opacity-80" : ""
                            }`}
                            style={
                              index === 1
                                ? {
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.15) 0px 2px 8px",
                                  } // second card
                                : {}
                            }
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <StatusIcon
                                    task={task}
                                    onStatusChange={changeStatus}
                                  />
                                  <span className="font-medium text-red">
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between group mr-1">
                                  {/* Status badge */}
                                  {col.id !== "done" && (
                                    <span
                                      className={`px-2 mx-2 py-1 rounded-lg text-xs font-medium ${getStatusStyle(
                                        task.priority
                                      )}`}
                                    >
                                      {task.priority}
                                    </span>
                                  )}

                                  {/* Edit/Delete (hidden until hover) */}
                                  <div className="flex items-center gap-2 opacity-100 ">
                                    <Pencil
                                      className="w-4 h-4 cursor-pointer text-blue-500 hover:text-blue-700"
                                      onClick={() => {
                                        setEditingTaskId(task.id);
                                        setIsFormOpen(true);
                                      }}
                                    />
                                    <Trash2
                                      className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                                      onClick={() => handleDelete(task.id)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <FaUserCircle className="text-gray-500 font-xl" />
                                <span className="text-red-500">
                                  {task.assignedUser?.name
                                    ? task.assignedUser.name
                                        .charAt(0)
                                        .toUpperCase() +
                                      task.assignedUser.name
                                        .slice(1)
                                        .toLowerCase()
                                    : "Unassigned"}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 mr-1">
                                <MdOutlineWatchLater className="text-gray-500 font-xl" />

                                {task.dueDate &&
                                  (() => {
                                    const due = new Date(task.dueDate);
                                    const today = new Date();

                                    // normalize (ignore time part)
                                    const dueDate = new Date(
                                      due.getFullYear(),
                                      due.getMonth(),
                                      due.getDate()
                                    );
                                    const currentDate = new Date(
                                      today.getFullYear(),
                                      today.getMonth(),
                                      today.getDate()
                                    );

                                    let bgClass = "bg-gray-200 text-gray-700"; // default
                                    if (dueDate < currentDate) {
                                      bgClass = "bg-red-100 text-red-600"; // overdue
                                    } else if (
                                      dueDate.getTime() ===
                                      currentDate.getTime()
                                    ) {
                                      bgClass = "bg-yellow-100 text-yellow-700"; // today
                                    } else {
                                      bgClass = "bg-green-100 text-green-700"; // upcoming
                                    }

                                    return (
                                      <span
                                        className={`px-2 py-1 rounded-md text-xs font-medium ${col.id === "done"? "bg-green-100 text-green-700" :bgClass}`}
                                      >
                                        {due.toLocaleDateString("en-US", {
                                          day: "numeric",
                                          month: "short",
                                        })}
                                      </span>
                                    );
                                  })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}

                    {visibleCounts[col.id as BackendStatus] <
                      columnTasks.length && (
                      <button
                        onClick={() => handleLoadMore(col.id as BackendStatus)}
                        className="w-full mt-2 px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        Load More
                      </button>
                    )}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
