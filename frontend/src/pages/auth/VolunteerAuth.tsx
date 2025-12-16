import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { Heart, ArrowLeft, ArrowRight, Eye, EyeOff, CalendarIcon, Check, Sparkles, User, Mail, Phone, Lock, MapPin } from "lucide-react";
import { format, setMonth, setYear } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

// Year options for DOB (last 100 years)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];



const VolunteerAuth = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup");
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();


  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    date_of_birth: undefined as Date | undefined,
    address: "",

  });

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
        // Route based on user role
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);


    try {
      // Build payload from signupData
      const payload = {
        firstname: signupData.firstname,
        lastname: signupData.lastname,
        username: signupData.username,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        gender: signupData.gender,
        date_of_birth: signupData.date_of_birth ? signupData.date_of_birth.toISOString() : undefined,
        address: signupData.address,

      };

      const response = await api.post(`/auth/register`, payload);
      // console.log("Response from backend:", response.data);

      if (response.data?.success) {
        // If backend returns user and token you can store them here

        toast.success("Application submitted!");
        // navigate after a short delay or let the UI show success screen (we show success screen)
      } else {
        setErrors({ general: response.data?.message || "Signup failed" });
      }
    } catch (error: any) {
      setErrors({ general: error?.response?.data?.message || "An error occurred during signup" });
      console.error("Signup error response:", error?.response ?? error);
    } finally {
      setIsLoading(false);
    }


    setTimeout(() => {
      setIsLoading(false);

    }, 1500);
  };

  const toggleTag = (array: string[], item: string, setter: (arr: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-white/5" style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0)', backgroundSize: '50px 50px' }} />
            </div>
            <div className="relative">
              <div className="mx-auto w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">NAMYO Africa</h1>
              <p className="text-white/80 text-sm mt-1">Volunteer Portal</p>
            </div>
          </div>

          {/* Tab Toggle */}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setActiveTab("login"); setErrors({}); }}
              className={cn(
                "flex-1 py-4 text-center font-medium transition-colors relative",
                activeTab === "login"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Login
              {activeTab === "login" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setErrors({}); }}
              className={cn(
                "flex-1 py-4 text-center font-medium transition-colors relative",
                activeTab === "signup"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Sign Up
              {activeTab === "signup" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          <CardContent className="p-6">
            {/* Login Form */}
            {errors.general && (
              <p className="text-red-500 text-sm mt-2">{errors.general}</p>
            )}
            {activeTab === "login" && (

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="pl-10 rounded-xl border-border focus-visible:ring-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="pl-10 pr-10 rounded-xl border-border focus-visible:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white py-6 text-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <>
                {errors.general && (
                  <p className="text-red-500 text-sm mt-2">{errors.general}</p>
                )}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstname">First Name</Label>
                      <Input
                        id="firstname"
                        placeholder="John"
                        value={signupData.firstname}
                        onChange={(e) => setSignupData({ ...signupData, firstname: e.target.value })}
                        className={cn("rounded-xl", errors.firstname && "border-destructive")}
                      />
                      {errors.firstname && <p className="text-xs text-destructive">{errors.firstname}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastname">Last Name</Label>
                      <Input
                        id="lastname"
                        placeholder="Doe"
                        value={signupData.lastname}
                        onChange={(e) => setSignupData({ ...signupData, lastname: e.target.value })}
                        className={cn("rounded-xl", errors.lastname && "border-destructive")}
                      />
                      {errors.lastname && <p className="text-xs text-destructive">{errors.lastname}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        placeholder="johndoe"
                        value={signupData.username}
                        onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
                        className={cn("pl-10 rounded-xl", errors.username && "border-destructive")}
                      />
                    </div>
                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        className={cn("pl-10 rounded-xl", errors.email && "border-destructive")}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+234 800 000 0000"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                        className={cn("pl-10 rounded-xl", errors.phone && "border-destructive")}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        className={cn("pl-10 pr-10 rounded-xl", errors.password && "border-destructive")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={signupData.gender}
                        onValueChange={(value) => setSignupData({ ...signupData, gender: value })}
                      >
                        <SelectTrigger className={cn("rounded-xl", errors.gender && "border-destructive")}>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className="bg-card">
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal rounded-xl",
                              !signupData.date_of_birth && "text-muted-foreground",
                              errors.date_of_birth && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {signupData.date_of_birth ? format(signupData.date_of_birth, "PP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-card" align="start">
                          <div className="flex gap-2 p-3 border-b">
                            <Select
                              value={signupData.date_of_birth ? String(signupData.date_of_birth.getMonth()) : undefined}
                              onValueChange={(value) => {
                                const date = signupData.date_of_birth || new Date();
                                setSignupData({ ...signupData, date_of_birth: setMonth(date, parseInt(value)) });
                              }}
                            >
                              <SelectTrigger className="w-[110px] h-8 text-xs">
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent className="bg-card max-h-[200px]">
                                {months.map((month, index) => (
                                  <SelectItem key={month} value={String(index)} className="text-xs">
                                    {month}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={signupData.date_of_birth ? String(signupData.date_of_birth.getFullYear()) : undefined}
                              onValueChange={(value) => {
                                const date = signupData.date_of_birth || new Date();
                                setSignupData({ ...signupData, date_of_birth: setYear(date, parseInt(value)) });
                              }}
                            >
                              <SelectTrigger className="w-[80px] h-8 text-xs">
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent className="bg-card max-h-[200px]">
                                {years.map((year) => (
                                  <SelectItem key={year} value={String(year)} className="text-xs">
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Calendar
                            mode="single"
                            selected={signupData.date_of_birth}
                            onSelect={(date) => setSignupData({ ...signupData, date_of_birth: date })}
                            month={signupData.date_of_birth || new Date()}
                            onMonthChange={(date) => setSignupData({ ...signupData, date_of_birth: date })}
                            disabled={(date) => date > new Date() || date < new Date("1920-01-01")}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="City, Country"
                        value={signupData.address}
                        onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                        className={cn("pl-10 rounded-xl", errors.address && "border-destructive")}
                      />
                    </div>
                    {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white py-6 text-lg mt-6"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>

                  <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setActiveTab("login")}
                      className="text-primary font-medium hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </form>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By signing up, you agree to NAMYO Africa's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default VolunteerAuth;
