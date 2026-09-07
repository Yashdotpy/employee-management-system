import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import AuthLayout from "../../layouts/AuthLayout";
import { Card, Input, Button } from "../../components/common";

import registerSchema from "../../schemas/registerSchema";
import authService from "../../services/authServices";

function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...registerData } = data;

      await authService.register(registerData);

      toast.success("Registration successful!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data || "Registration failed.");
    }
  };

  return (
    <AuthLayout>
      <Card>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Create Account
          </h1>
          <p className="mt-2 text-slate-500">
            Register to access Employee Management System
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Full Name"
            required
            placeholder="Enter your full name"
            {...register("fullName")}
            error={errors.fullName?.message}
          />

          <Input
            label="Email"
            type="email"
            required
            placeholder="Enter your email"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="Create a password"
            {...register("password")}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            required
            placeholder="Confirm your password"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          <Button type="submit" loading={isSubmitting}>
            Register
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}

export default Register;