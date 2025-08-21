"use client";

import { ReactNode } from "react";
import { MdClose } from "react-icons/md";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 min-h-screen">
      <div>
        <div className="w-full relative p-4">
          <button
            type="button"
            onClick={onClose}
            className="absolute -top-4 right-4 text-[var(--text)]"
          >
            <MdClose size={20} />
          </button>

          {children}
        </div>
      </div>
    </div>
  );
}
