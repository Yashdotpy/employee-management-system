import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      required = false,
      type = "text",
      className = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className="mb-5">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}

            {required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}

        <input
          ref={ref}
          type={type}
          className={`w-full rounded-lg border px-4 py-3 outline-none transition
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-300"
              : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-300"
          }
          ${className}`}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;