"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flower2, Eye, EyeOff, Check, X, Building2, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PASSWORD_MIN = 8;

const SignupPage = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"freelancer" | "admin">("freelancer");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const passwordChecks = {
    length: password.length >= PASSWORD_MIN,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const passwordValid = passwordChecks.length && passwordChecks.number;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "First name is required";
    if (!lastName.trim()) errs.lastName = "Last name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email format";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (phone.replace(/\D/g, "").length < 10) errs.phone = "Enter a valid 10-digit phone number";
    if (!password) errs.password = "Password is required";
    else if (!passwordValid) errs.password = "Password doesn't meet requirements";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            phone: phone.trim(),
            role,
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("already registered")) {
          setErrors({ email: "already_registered" });
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Supabase returns a user with no session for repeated signups (email already exists)
      if (data.user && !data.session && data.user.identities?.length === 0) {
        setErrors({ email: "already_registered" });
        return;
      }

      if (data.user) {
        toast.success("Account created! Please check your email to verify your account.");
        router.push("/");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ met, label }: { met: boolean; label: string }) => (
    <div className="flex items-center gap-1.5 text-xs">
      {met ? <Check className="w-3 h-3 text-success" /> : <X className="w-3 h-3 text-muted-foreground" />}
      <span className={met ? "text-success" : "text-muted-foreground"}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
            <Flower2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
          <p className="text-muted-foreground text-sm">Join Squad to get started</p>
        </div>

        {/* Role selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("freelancer")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === "freelancer"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <UserRound className="w-5 h-5" />
            <span className="text-xs font-semibold">I'm a Freelancer</span>
          </button>
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
              role === "admin"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40"
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs font-semibold">I'm a Studio Owner</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                maxLength={50}
                className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              maxLength={255}
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {errors.email && (
              errors.email === "already_registered" ? (
                <p className="text-[10px] text-destructive">
                  An account with this email already exists.{" "}
                  <Link href="/" className="text-primary font-medium hover:underline">Sign in instead</Link>
                </p>
              ) : (
                <p className="text-[10px] text-destructive">{errors.email}</p>
              )
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567"
              className="w-full px-3.5 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
            {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                maxLength={128}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-[10px] text-destructive">{errors.password}</p>}
            {password.length > 0 && (
              <div className="flex gap-3 mt-1.5">
                <PasswordCheck met={passwordChecks.length} label={`${PASSWORD_MIN}+ chars`} />
                <PasswordCheck met={passwordChecks.number} label="1 number" />
                <PasswordCheck met={passwordChecks.special} label="1 symbol" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-2"
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
