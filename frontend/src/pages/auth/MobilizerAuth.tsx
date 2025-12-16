import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { toast } from "sonner";
import { Users, ArrowLeft } from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

const MobilizerAuth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const { login } = useAuth();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);
    try {
      // Validate inputs
      if (!loginData.email || !loginData.password) {
        const errorMsg = "Please enter both email and password";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
        setIsLoading(false);
        return;
      }

      const payload = {
        email: loginData.email,
        password: loginData.password,
      };

      const response = await api.post(`/auth/login`, payload);
      console.debug("Login response:", response);

      if (response.data?.success) {
        toast.success("Login successful!");
        login(response.data.user, response.data.token);
        console.log(response.data.user.role)
        if (response.data.user.role === "admin") {
          navigate("/dashboard")
        } else if (response.data.user.role === "mobilizer") {
          navigate("/mobilizer")
        } else {
          navigate("/volunteer")
        }

      } else {
        const errorMsg = response.data?.message || "Login failed";
        setErrors({ general: errorMsg });
        toast.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "An error occurred during login";
      setErrors({ general: errorMsg });
      toast.error(errorMsg);
      console.error("Login error response:", error?.response ?? error);
    } finally {
      setIsLoading(false);
    }

  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-mobilizer-primary/5 via-background to-mobilizer-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-mobilizer-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-mobilizer-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-mobilizer-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Mobilizer Portal</CardTitle>
            <CardDescription>NAMYO Africa Mobilizer Access</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="mobilizer@namyo.org"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  required
                  className="focus-visible:ring-mobilizer-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="focus-visible:ring-mobilizer-primary"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-500 hover:bg-mobilizer-secondary" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              {errors.general && (
                <p className="text-destructive text-sm text-center">{errors.general}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobilizerAuth;
