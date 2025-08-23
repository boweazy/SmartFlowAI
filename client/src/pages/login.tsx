import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Bot } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome back to SmartFlow AI!",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await register(data);
      toast({
        title: "Account created",
        description: "Welcome to SmartFlow AI!",
      });
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-dark-900">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isRegistering ? "Create your account" : "Welcome to SmartFlow AI"}
          </h2>
          <p className="mt-2 text-dark-400">
            {isRegistering ? "Join the future of social media automation" : "Sign in to your account"}
          </p>
        </div>

        <Card className="bg-dark-800 border-dark-700">
          <CardHeader>
            <CardTitle className="text-white text-center">
              {isRegistering ? "Sign Up" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isRegistering ? (
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4" data-testid="form-register">
                <div>
                  <Label htmlFor="register-name" className="text-white">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    {...registerForm.register("name")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your full name"
                    data-testid="input-name"
                  />
                  {registerForm.formState.errors.name && (
                    <p className="form-error">{registerForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-email" className="text-white">Email address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    {...registerForm.register("email")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                    data-testid="input-email"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="form-error">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-password" className="text-white">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    {...registerForm.register("password")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Create a password"
                    data-testid="input-password"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="form-error">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="register-confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="register-confirm-password"
                    type="password"
                    {...registerForm.register("confirmPassword")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Confirm your password"
                    data-testid="input-confirm-password"
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="form-error">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  data-testid="button-register"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4" data-testid="form-login">
                <div>
                  <Label htmlFor="login-email" className="text-white">Email address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    {...loginForm.register("email")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your email"
                    data-testid="input-email"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="form-error">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    {...loginForm.register("password")}
                    className="mt-1 bg-dark-700 border-dark-600 text-white focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your password"
                    data-testid="input-password"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="form-error">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Checkbox 
                      id="remember-me"
                      {...loginForm.register("rememberMe")}
                      className="border-dark-600"
                    />
                    <Label htmlFor="remember-me" className="ml-2 text-dark-300">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary-500 hover:text-primary-400"
                    data-testid="link-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <div className="loading-spinner mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-primary-500 hover:text-primary-400"
                data-testid="link-toggle-form"
              >
                {isRegistering
                  ? "Already have an account? Sign in"
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
