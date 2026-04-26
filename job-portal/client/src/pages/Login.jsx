import { useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "../assets/hero.png";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      if (isSignup) {
        if (!name.trim()) {
          throw new Error("Name is required");
        }
        if (!age) {
          throw new Error("Age is required");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }

        const parsedAge = Number(age);
        if (!Number.isInteger(parsedAge) || parsedAge < 18 || parsedAge > 120) {
          throw new Error("Please enter a valid age (18-120)");
        }
      }

      const endpoint = isSignup ? "/auth/register" : "/auth/login";
      const res = await api.post(endpoint, {
        email,
        password,
        ...(isSignup && { name: name.trim(), age: Number(age), role })
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user?.role || "user");
      localStorage.setItem("userId", res.data.user?._id || "");
      localStorage.setItem("userName", res.data.user?.name || "User");
      localStorage.setItem("userAge", res.data.user?.age || "");

      setSuccess(`Welcome ${res.data.user?.name || "User"}!`);
      setTimeout(() => {
        navigate(res.data.user?.role === "employer" ? "/admin" : "/jobs");
      }, 700);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignup((current) => !current);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-slate-50 grid lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden lg:flex overflow-hidden bg-slate-900 text-white">
        <img
          src={heroImage}
          alt="Professional workspace"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-slate-950/60" />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-lg bg-white text-slate-950 grid place-items-center font-bold">JF</span>
            <span className="text-2xl font-bold">JobFinder</span>
          </div>

          <div className="max-w-xl">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-cyan-200">Hiring made practical</p>
            <h1 className="text-5xl xl:text-6xl font-bold leading-tight">
              Find jobs, track applications, and manage hiring in one place.
            </h1>
            <div className="mt-10 grid grid-cols-3 gap-4">
              <div className="border border-white/20 bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold">3+</p>
                <p className="text-sm text-slate-200">Demo jobs</p>
              </div>
              <div className="border border-white/20 bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold">2</p>
                <p className="text-sm text-slate-200">Account roles</p>
              </div>
              <div className="border border-white/20 bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold">Live</p>
                <p className="text-sm text-slate-200">Mongo data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-lg bg-slate-900 text-white grid place-items-center font-bold">JF</span>
              <span className="text-2xl font-bold text-slate-900">JobFinder</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-7 sm:p-8 rounded-xl shadow-sm">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-slate-900">
                {isSignup ? "Create account" : "Welcome back"}
              </h2>
              <p className="mt-2 text-slate-600">
                {isSignup ? "Choose a role and start using the portal." : "Sign in to continue to your workspace."}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignup && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                    <input
                      type="text"
                      className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("user")}
                      className={`rounded-lg border p-3 text-left transition ${
                        role === "user" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="block font-semibold">Job seeker</span>
                      <span className="text-xs opacity-80">Apply to roles</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("employer")}
                      className={`rounded-lg border p-3 text-left transition ${
                        role === "employer" ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700"
                      }`}
                    >
                      <span className="block font-semibold">Employer</span>
                      <span className="text-xs opacity-80">Manage hiring</span>
                    </button>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                  <input
                    type="number"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    disabled={loading}
                    min="18"
                    max="120"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirm password</label>
                  <input
                    type="password"
                    className="w-full border border-slate-300 p-3 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Please wait..." : isSignup ? "Create account" : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {isSignup ? "Already have an account?" : "Do not have an account?"}
                <button
                  onClick={toggleMode}
                  className="ml-2 text-cyan-700 font-semibold hover:text-cyan-800"
                >
                  {isSignup ? "Login" : "Sign up"}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Demo employer: <span className="font-semibold text-slate-900">employer@jobportal.com</span> /{" "}
            <span className="font-semibold text-slate-900">password123</span>
          </div>
        </div>
      </section>
    </div>
  );
}
