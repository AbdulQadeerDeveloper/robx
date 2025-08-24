import { useState, useEffect } from "react";
import { FaSave, FaTimes, FaChevronDown, FaSearch } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Task } from "@/types/task";

interface User {
  id: string | number;
  name: string;
}

interface TaskFormProps {
  task?: Task;
  onSubmit: (updatedTask: Partial<Task>) => void;
  onCancel: () => void;
  refreshTasks?: () => void;
}

function AssignedToField({
  users,
  loadingUsers,
  formData,
  setFormData,
  initialUser,
  initialId,
}: {
  users: User[];
  loadingUsers: boolean;
  formData: any;
  setFormData: (val: any) => void;
  initialUser?: string;
  initialId?: string | number;
}) {
  const [search, setSearch] = useState(initialUser || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (initialId) {
      setFormData({ ...formData, assignedTo: initialId });
    }
  }, [initialId]);

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
          className={`mr-3 text-gray-500 transition-transform ${open ? "rotate-180" : ""
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

export default function TaskForm({
  task,
  onSubmit,
  onCancel,
  refreshTasks,
}: TaskFormProps) {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        description: task.description || "",
        assignedTo: task.assignedUser?.id?.toString() || "",
        dueDate: task.dueDate ? task.dueDate.split("T")[0] : "",
        priority: task.priority || "normal",
        status: task.status || "to-do",
      });
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

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

      let updatedTask: Task;
      if (task?.id) {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/task/update/${task.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        updatedTask = await res.json();
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/task/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        updatedTask = await res.json();
      }

      onSubmit(updatedTask);
      refreshTasks?.();
      onCancel();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
     <form
        onSubmit={handleSubmit}
        className="w-[95%] sm:w-[450px] md:w-[600px] h-auto max-h-[90vh] md:h-[550px] 
        p-6 bg-white rounded-lg shadow-lg border border-gray-200 overflow-y-auto"
      >
      <h2 className="text-xl font-semibold text-gray-800">
        {task ? "Edit Task" : "Create New Task"}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-2">
        <div>
          <label className="block text-sm font-medium text-gray-800 ">
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
          initialUser={task?.assignedUser?.name || ""}
          initialId={task?.assignedUser?.id?.toString() || ""}
        />

        <div className="">
          <label className="block text-sm font-medium text-gray-800 ">
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

      <div className="mt-4 mb-4">
        <label className="block text-sm font-medium text-gray-800 mb-1">
          Task Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800"
          rows={4}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-md hover:brightness-110"
        >
          {submitting ? "Saving..." : <><FaSave className="mr-2" /> Save Task</>}
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
