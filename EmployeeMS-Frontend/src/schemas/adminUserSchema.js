import { z } from "zod";

const adminUserSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "HR"], {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export default adminUserSchema;