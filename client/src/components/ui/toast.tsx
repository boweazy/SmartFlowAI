import React from "react";

export function Toast({ message }: { message: string }) {
  return (
    <div className="bg-gray-800 text-white px-4 py-2 rounded shadow-md">
      {message}
    </div>
  );
}
