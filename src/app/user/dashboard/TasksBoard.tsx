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
import { MdDelete } from "react-icons/md";

interface User {
  id: number;
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
  onStatusChange: (id: number, newStatus: BackendStatus) => Promise<void>;
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

export default function TasksBoard({ refreshTrigger }: { refreshTrigger?: number }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
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

  const handleDelete = async (taskId: number) => {
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

  const changeStatus = async (taskId: number, newStatus: BackendStatus) => {
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
    const taskId = Number(result.draggableId);

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

  const getRandomColor = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  return (
    <div className="space-y-10 p-6 min-h-screen">
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
          <div className="flex items-center">
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
          </div>

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
      <Modal isOpen={isFormOpen && !editingTaskId} onClose={() => setIsFormOpen(false)}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {columns.map((col) => {
            const columnTasks = tasks.filter((task) => {
              if (col.id === "need-review") {
                const today = new Date().toISOString().split("T")[0];
                const taskDate = task.dueDate
                  ? new Date(task.dueDate).toISOString().split("T")[0]
                  : null;

                return (
                  task.status === col.id &&
                  taskDate !== null &&
                  taskDate < today
                );
              }
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
                    className={`kanban-column flex flex-col rounded-2xl p-4 border-2 transition shadow-sm ${
                      snapshot.isDraggingOver
                        ? "bg-purple-100 border-purple-400"
                        : "bg-white/70 border-purple-200"
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

                                <div className="flex items-center gap-1">
                                  <FaRegEdit
                                    className="cursor-pointer text-blue-500 hover:text-blue-700"
                                    onClick={() => {
                                      setEditingTaskId(task.id);
                                      setIsFormOpen(true);
                                    }}
                                  />
                                  <MdDelete
                                    className="cursor-pointer text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(task.id)}
                                  />
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

                              <div className="flex items-center gap-1">
                                <BiSolidWatch className="text-gray-500 font-xl" />
                                <span className="text-red-500">
                                  {task.dueDate &&
                                    new Date(
                                      task.dueDate
                                    ).toLocaleDateString("en-US", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                </span>
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