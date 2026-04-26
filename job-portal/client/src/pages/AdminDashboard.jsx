import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const emptyForm = {
  title: "",
  company: "",
  location: "Remote",
  salary: "",
  jobType: "Full-time",
  description: ""
};

const statusClasses = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700"
};

export default function AdminDashboard() {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchData();
  }, []);

  const myJobs = useMemo(() => {
    return jobs.filter((job) => job.createdBy?._id === userId || job.createdBy === userId);
  }, [jobs, userId]);

  const stats = useMemo(() => {
    return {
      jobs: myJobs.length,
      applications: apps.length,
      pending: apps.filter((app) => app.status === "pending").length,
      approved: apps.filter((app) => app.status === "approved").length
    };
  }, [apps, myJobs]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([api.get("/jobs"), api.get("/applications")]);
      setJobs(jobsRes.data);
      setApps(appsRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId("");
  };

  const submitJob = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.title.trim() || !form.company.trim()) {
        throw new Error("Title and company are required");
      }

      const payload = {
        ...form,
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim() || "Remote"
      };

      if (editingId) {
        const res = await api.put(`/jobs/${editingId}`, payload);
        setJobs((prev) => prev.map((job) => (job._id === editingId ? res.data : job)));
      } else {
        const res = await api.post("/jobs", payload);
        setJobs((prev) => [res.data, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const editJob = (job) => {
    setEditingId(job._id);
    setForm({
      title: job.title || "",
      company: job.company || "",
      location: job.location || "Remote",
      salary: job.salary || "",
      jobType: job.jobType || "Full-time",
      description: job.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJob = async (id) => {
    if (!confirm("Delete this job? Applications for this job may become unavailable.")) {
      return;
    }

    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((job) => job._id !== id));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete job");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/applications/${id}/status`, { status });
      setApps((prev) => prev.map((app) => (app._id === id ? res.data : app)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[380px_1fr] gap-6">
          <div className="h-96 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
            <div className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Employer workspace</p>
          <h1 className="text-4xl font-bold text-slate-900 mt-1">Hiring Dashboard</h1>
          <p className="text-slate-600 mt-2">Create jobs, review applicants, and update hiring decisions.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[
            ["My jobs", stats.jobs],
            ["Applications", stats.applications],
            ["Pending", stats.pending],
            ["Approved", stats.approved]
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          <section className="bg-white border border-slate-200 rounded-xl p-5 h-fit">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? "Edit job" : "Create job"}
            </h2>
            <form onSubmit={submitJob} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company</label>
                <input
                  value={form.company}
                  onChange={(e) => handleChange("company", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                  <input
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => handleChange("jobType", e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Salary</label>
                <input
                  value={form.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="8-12 LPA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows="4"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Role responsibilities and requirements"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingId ? "Update job" : "Post job"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <div className="space-y-6">
            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-900">My jobs</h2>
                <span className="text-sm text-slate-500">{myJobs.length} posted</span>
              </div>

              {myJobs.length === 0 ? (
                <p className="text-slate-600 py-8 text-center border border-dashed border-slate-300 rounded-lg">
                  No jobs posted from this account yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {myJobs.map((job) => (
                    <div key={job._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{job.title}</p>
                          <p className="text-sm text-slate-600">
                            {job.company} | {job.location || "Remote"} | {job.jobType}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => editJob(job)}
                            className="px-3 py-2 rounded-md border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteJob(job._id)}
                            className="px-3 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-slate-900">Recent applicants</h2>
                <a href="/applications" className="text-sm font-semibold text-cyan-700 hover:text-cyan-800">
                  View all
                </a>
              </div>

              {apps.length === 0 ? (
                <p className="text-slate-600 py-8 text-center border border-dashed border-slate-300 rounded-lg">
                  No applications yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {apps.slice(0, 6).map((app) => (
                    <div key={app._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{app.userId?.name || "Applicant"}</p>
                          <p className="text-sm text-slate-600">
                            {app.jobId?.title || "Removed job"} | {app.userId?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusClasses[app.status]}`}>
                            {app.status}
                          </span>
                          <button
                            onClick={() => updateStatus(app._id, "approved")}
                            className="px-3 py-2 text-sm rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(app._id, "rejected")}
                            className="px-3 py-2 text-sm rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
