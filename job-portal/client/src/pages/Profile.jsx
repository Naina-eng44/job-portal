import { useEffect, useState } from "react";
import api from "../services/api";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    age: "",
    phone: "",
    location: "",
    bio: "",
    skills: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      setProfile(res.data);
      setForm({
        name: res.data.name || "",
        age: res.data.age || "",
        phone: res.data.phone || "",
        location: res.data.location || "",
        bio: res.data.bio || "",
        skills: (res.data.skills || []).join(", ")
      });
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await api.put("/auth/me", {
        ...form,
        skills: form.skills
      });

      setProfile(res.data);
      localStorage.setItem("userName", res.data.name || "User");
      localStorage.setItem("userAge", res.data.age || "");
      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[320px_1fr] gap-6">
          <div className="h-72 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Account settings</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-1">Profile</h1>
          <p className="text-slate-600 mt-2">Keep your account details useful for applications and hiring.</p>
        </div>

        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-slate-200 rounded-xl p-6 h-fit">
            <div className="h-16 w-16 rounded-xl bg-slate-900 text-white grid place-items-center text-xl font-bold">
              {(profile?.name || "U").slice(0, 2).toUpperCase()}
            </div>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">{profile?.name}</h2>
            <p className="text-slate-600">{profile?.email}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700 capitalize">
                {profile?.role}
              </span>
              {profile?.location && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {profile.location}
                </span>
              )}
            </div>
            {profile?.bio && <p className="mt-5 text-sm text-slate-600">{profile.bio}</p>}
          </aside>

          <section className="bg-white border border-slate-200 rounded-xl p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="120"
                    value={form.age}
                    onChange={(e) => handleChange("age", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="City or Remote"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Skills</label>
                <input
                  value={form.skills}
                  onChange={(e) => handleChange("skills", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="React, Node.js, MongoDB"
                />
                <p className="text-xs text-slate-500 mt-1">Separate skills with commas.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  rows="5"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="A short professional summary"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
