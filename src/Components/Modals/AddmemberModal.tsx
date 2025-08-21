import { useState } from "react";
import { FaSave, FaTimes } from "react-icons/fa";
import { addUser, AddUserPayload } from "@/utils/addUser";

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddMemberModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: AddUserPayload = { name, phone, designation };

    try {
      await addUser(payload);
      setName("");
      setPhone("");
      setDesignation("");
      onUserAdded();
      onClose();
    } catch (err: unknown) {
      console.error("Add user error:", err);
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="w-[300px] md:w-[350px] lg:w-[400px] bg-white border border-gray-200 rounded-lg  p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Add Team Member
      </h2>

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />

        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />

        <input
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Designation"
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-[#581a99] text-white rounded-md hover:bg-blue-700 transition disabled:opacity-70"
          >
            <FaSave className="mr-2" /> {loading ? "Adding..." : "Add"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center px-4 py-2 bg-red text-white border border-gray-300 rounded-md hover:bg-gray-200 transition"
          >
            <FaTimes className="mr-2" /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
