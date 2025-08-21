"use client";

import { useState, useEffect } from "react";
import { FaSave, FaTimes, FaChevronDown, FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task } from "@/types/task";

interface User {
  id: string | number;
  name: string;
}

interface UpdateFormProps {
  taskId: string;
  onSubmit: (updatedTask: Partial<Task>) => void;
  onCancel: () => void;
  refreshTasks?: () => void;
}

// =============================
// Assigned To Dropdown
// =============================
function AssignedToField({
  users,
  loadingUsers,
  formData,
  setFormData,
}: {
  users: User[];
  loadingUsers: boolean;
  formData: any;
  setFormData: (val: any) => void;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  // Prefill when editing
  useEffect(() => {
    if (formData.assignedTo) {
      const user = users.find((u) => u.id.toString() === formData.assignedTo);
      if (user) setSearch(user.name);
    }
  }, [formData.assignedTo, users]);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string | number, name: string) => {
    setFormData({ ...formData, assignedTo: id });
    setSearch(name);
    setOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-800 mb-1">
        Assigned To
      </label>

      <div
        className="flex items-center border border-gray-300 rounded-md bg-white"
        onClick={() => setOpen(!open)}
      >
        <FaSearch className="ml-3 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          placeholder="Search user..."
          className="flex-1 p-2 pl-2 outline-none bg-white text-gray-800"
        />
        <FaChevronDown
          className={`mr-3 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {open && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto shadow-md">
          {loadingUsers ? (
            <div className="p-2 text-gray-500">Loading...</div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                onClick={() => handleSelect(u.id, u.name)}
                className="p-2 cursor-pointer hover:bg-purple-100"
              >
                {u.name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================
// Update Form Component
// =============================
export default function UpdateForm({
  taskId,
  onSubmit,
  onCancel,
  refreshTasks,
}: UpdateFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "normal",
    status: "to-do",
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/getAll`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // Fetch task data for edit
  useEffect(() => {
    if (!taskId) return;
    const fetchTask = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/task/get/${taskId}`
        );
        if (!res.ok) throw new Error("Failed to fetch task");
        const data: Task = await res.json();

        setFormData({
          title: data.title || "",
          description: data.description || "",
          assignedTo: data.assignedUser?.id?.toString() || "",
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          priority: data.priority || "normal",
          status: data.status || "to-do",
        });
        setSelectedDate(data.dueDate ? new Date(data.dueDate) : null);
      } catch (err) {
        console.error("Error fetching task:", err);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      dueDate: date ? date.toISOString().split("T")[0] : "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        userId: formData.assignedTo,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/task/update/${taskId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const updatedTask = await res.json();

      onSubmit(updatedTask);
      refreshTasks?.();
      onCancel();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md border border-gray-200 mx-auto space-y-6 max-h-screen overflow-y-auto"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Task Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
            required
          />
        </div>

        <AssignedToField
          users={users}
          loadingUsers={loadingUsers}
          formData={formData}
          setFormData={setFormData}
        />

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Due Date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
            placeholderText="Select due date"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Priority
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          >
            <option value="to-do">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="need-review">Need Review</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Task Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-md hover:brightness-110"
        >
          {submitting ? "Updating..." : <><FaSave className="mr-2" /> Update Task</>}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-500 text-white border border-gray-500 rounded-md hover:brightness-110"
        >
          <FaTimes className="mr-2" /> Cancel
        </button>
      </div>
    </form>
  );
}
