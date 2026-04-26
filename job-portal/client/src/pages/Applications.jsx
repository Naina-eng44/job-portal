import { useEffect, useState } from "react";
import api from "../services/api";

const statusClasses = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200"
};

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applications");
      setApps(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await api.patch(`/applications/${id}/status`, { status });
      setApps((prev) => prev.map((app) => (app._id === id ? res.data : app)));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 bg-white border border-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
            {role === "employer" ? "Candidate pipeline" : "Application tracker"}
          </p>
          <h1 className="text-4xl font-bold text-slate-900 mt-1">
            {role === "employer" ? "Applications to Your Jobs" : "My Applications"}
          </h1>
          <p className="text-slate-600 mt-2">
            {apps.length} application{apps.length === 1 ? "" : "s"} currently tracked.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button onClick={fetchApplications} className="ml-4 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {apps.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
            <p className="text-xl font-semibold text-slate-900">
              {role === "employer" ? "No applicants yet" : "You have not applied to any jobs yet"}
            </p>
            <a
              href={role === "employer" ? "/admin" : "/jobs"}
              className="inline-block mt-5 bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold"
            >
              {role === "employer" ? "Manage jobs" : "Browse jobs"}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <article key={app._id} className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {app.jobId?.title || "Removed job"}
                    </h2>
                    <p className="text-cyan-700 font-semibold">{app.jobId?.company || "Company unavailable"}</p>
                    {role === "employer" && (
                      <p className="text-sm text-slate-600 mt-2">
                        Applicant: <span className="font-semibold">{app.userId?.name}</span> ({app.userId?.email})
                      </p>
                    )}
                    <p className="text-sm text-slate-500 mt-2">
                      Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-3">
                    <span
                      className={`border px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                        statusClasses[app.status] || "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {app.status || "pending"}
                    </span>

                    {role === "employer" && (
                      <div className="flex gap-2">
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
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
