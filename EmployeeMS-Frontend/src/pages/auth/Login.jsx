import { Link } from "react-router-dom";
import authService from "../../services/authServices";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "../../layouts/AuthLayout";
import { Card, Input, Button } from "../../components/common";
import loginSchema from "../../schemas/loginSchema";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const { login } = useAuth();

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data);

      login(response);

      toast.success("Login Successful!");

      if (response.role === "Employee") {
        navigate("/employee-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error(
        error.response?.data ||
        "Invalid email or password."
      );
    }
  };

  return (
    <AuthLayout>
      <Card>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Employee Management
          </h1>

          <p className="mt-2 text-slate-500">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            required
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            required
            {...register("password")}
            error={errors.password?.message}
          />

          <Button
            type="submit"
            loading={isSubmitting}
          >
            Login
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default Login;