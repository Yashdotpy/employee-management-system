import { z } from "zod";

const employeesSchema = (isEdit = false) =>
  z.object({
    firstName: z
      .string()
      .min(
        2,
        "First name must be at least 2 characters"
      ),

    lastName: z
      .string()
      .min(
        2,
        "Last name must be at least 2 characters"
      ),

    email: z
      .string()
      .email("Enter a valid email"),

    password: isEdit
      ? z.string().optional()
      : z
          .string()
          .min(
            6,
            "Password must be at least 6 characters"
          ),

    role: z
      .string()
      .min(1, "Role is required"),

    phone: z
      .string()
      .min(
        10,
        "Phone number must be 10 digits"
      )
      .max(15),

    department: z
      .string()
      .min(1, "Department is required"),

    salary: z.coerce
      .number()
      .positive(
        "Salary must be greater than 0"
      ),

    dateOfJoining: z
      .string()
      .min(
        1,
        "Joining date is required"
      ),
  });

export default employeesSchema;