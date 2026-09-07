import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import employeesSchema from "../../schemas/employeesSchema";

import {
  Input,
  Button,
  Select,
} from "../common";

function EmployeeForm({
  defaultValues,
  onSubmit,
  loading = false,
  isEdit = false,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      employeesSchema(isEdit)
    ),
    defaultValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >

      {/* Name */}

      <div className="grid gap-6 md:grid-cols-2">

        <Input
          label="First Name"
          required
          {...register("firstName")}
          error={errors.firstName?.message}
        />

        <Input
          label="Last Name"
          required
          {...register("lastName")}
          error={errors.lastName?.message}
        />

      </div>

      {/* Email */}

      <Input
        label="Email"
        type="email"
        required
        {...register("email")}
        error={errors.email?.message}
      />

      {/* Password - Create Only */}

      {!isEdit && (
        <Input
          label="Password"
          type="password"
          required
          {...register("password")}
          error={errors.password?.message}
        />
      )}

      {/* Role */}

      <Select
        label="Role"
        required
        {...register("role")}
        error={errors.role?.message}
        options={[
          {
            label: "Employee",
            value: "Employee",
          },
          {
            label: "HR",
            value: "HR",
          },
          {
            label: "Admin",
            value: "Admin",
          },
        ]}
      />

      {/* Phone */}

      <Input
        label="Phone"
        required
        {...register("phone")}
        error={errors.phone?.message}
      />

      {/* Department */}

      <Select
        label="Department"
        required
        {...register("department")}
        error={errors.department?.message}
        options={[
          {
            label: "Human Resource",
            value: "Human Resource",
          },
          {
            label: "Software Development",
            value: "Software Development",
          },
          {
            label: "IT",
            value: "IT",
          },
          {
            label: "Finance",
            value: "Finance",
          },
          {
            label: "Marketing",
            value: "Marketing",
          },
        ]}
      />

      {/* Salary */}

      <Input
        label="Salary"
        type="number"
        required
        {...register("salary")}
        error={errors.salary?.message}
      />

      {/* Joining Date */}

      <Input
        label="Joining Date"
        type="date"
        required
        {...register("dateOfJoining")}
        error={errors.dateOfJoining?.message}
      />

      {/* Submit */}

      <div className="flex justify-end">

        <Button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : isEdit
              ? "Update Employee"
              : "Save Employee"}
        </Button>

      </div>

    </form>
  );
}

export default EmployeeForm;