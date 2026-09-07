import { forwardRef } from "react";

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      required = false,
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

        <select
          ref={ref}
          className={`w-full rounded-lg border border-gray-300 px-4 py-3 outline-none
          focus:border-blue-500 focus:ring-2 focus:ring-blue-300
          ${className}`}
          {...props}
        >
          <option value="">
            Select
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;