import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const jobTypes = ["", "Full-time", "Part-time", "Contract"];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState({});
  const [filters, setFilters] = useState({ search: "", location: "", jobType: "" });
  const [selectedJob, setSelectedJob] = useState(null);
  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchPageData();
  }, []);

  const appliedByJobId = useMemo(() => {
    return applications.reduce((acc, app) => {
      const id = app.jobId?._id || app.jobId;
      if (id) {
        acc[id] = app;
      }
      return acc;
    }, {});
  }, [applications]);

  const fetchPageData = async () => {
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get("/jobs"),
        role === "user" ? api.get("/applications") : Promise.resolve({ data: [] })
      ]);

      setJobs(jobsRes.data);
      setApplications(appsRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const apply = async (jobId) => {
    try {
      setApplying((prev) => ({ ...prev, [jobId]: true }));
      const res = await api.post(`/applications/${jobId}`);
      setApplications((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to apply for this job");
    } finally {
      setApplying((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const filteredJobs = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const location = filters.location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search) ||
        job.company?.toLowerCase().includes(search) ||
        job.description?.toLowerCase().includes(search);

      const matchesLocation = !location || job.location?.toLowerCase().includes(location);
      const matchesType = !filters.jobType || job.jobType === filters.jobType;

      return matchesSearch && matchesLocation && matchesType;
    });
  }, [filters, jobs]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse mb-6" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-64 bg-white border border-slate-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Job marketplace</p>
            <h1 className="text-4xl font-bold text-slate-900 mt-1">Available Jobs</h1>
            <p className="text-slate-600 mt-2">
              Explore {filteredJobs.length} of {jobs.length} opportunities.
            </p>
          </div>
          {role === "employer" && (
            <a
              href="/admin"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-700"
            >
              Manage jobs
            </a>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="grid md:grid-cols-[1.5fr_1fr_180px] gap-3">
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Search title, company, or keyword"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <input
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
            />
            <select
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              value={filters.jobType}
              onChange={(e) => setFilters((prev) => ({ ...prev, jobType: e.target.value }))}
            >
              {jobTypes.map((type) => (
                <option key={type || "all"} value={type}>
                  {type || "All types"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
            <button onClick={fetchPageData} className="ml-4 font-semibold underline">
              Retry
            </button>
          </div>
        )}

        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
            <p className="text-xl font-semibold text-slate-900">No jobs match your filters</p>
            <p className="text-slate-600 mt-2">Clear search or try a different location.</p>
            <button
              onClick={() => setFilters({ search: "", location: "", jobType: "" })}
              className="mt-5 bg-slate-900 text-white px-5 py-2 rounded-lg font-semibold"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => {
              const application = appliedByJobId[job._id];

              return (
                <article
                  key={job._id}
                  className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition flex flex-col"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{job.title}</h2>
                      <p className="text-cyan-700 font-semibold mt-1">{job.company}</p>
                    </div>
                    <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {job.jobType || "Full-time"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500">Location</p>
                      <p className="font-semibold text-slate-900">{job.location || "Remote"}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-slate-500">Salary</p>
                      <p className="font-semibold text-slate-900">{job.salary || "Competitive"}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm mt-5 flex-1">
                    {job.description || "A promising opportunity with a growing team."}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="w-full border border-slate-300 text-slate-700 py-2 rounded-lg hover:bg-slate-50 font-semibold transition"
                    >
                      Details
                    </button>
                    {role === "employer" ? (
                      <a
                        href="/admin"
                        className="block text-center w-full bg-slate-900 text-white py-2 rounded-lg font-semibold hover:bg-slate-700"
                      >
                        Manage
                      </a>
                    ) : application ? (
                      <button
                        disabled
                        className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-2 rounded-lg font-semibold"
                      >
                        Applied - {application.status}
                      </button>
                    ) : (
                      <button
                        onClick={() => apply(job._id)}
                        disabled={applying[job._id]}
                        className="w-full bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-700 font-semibold transition disabled:opacity-50"
                      >
                        {applying[job._id] ? "Applying..." : "Apply Now"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">
                    {selectedJob.company}
                  </p>
                  <h2 className="text-3xl font-bold text-slate-900 mt-1">{selectedJob.title}</h2>
                  <p className="text-slate-600 mt-2">
                    Posted by {selectedJob.createdBy?.name || "Employer"}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="h-9 w-9 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                  aria-label="Close details"
                >
                  X
                </button>
              </div>

              <div className="p-6">
                <div className="grid sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Location</p>
                    <p className="font-semibold text-slate-900">{selectedJob.location || "Remote"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Salary</p>
                    <p className="font-semibold text-slate-900">{selectedJob.salary || "Competitive"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-semibold text-slate-900">{selectedJob.jobType || "Full-time"}</p>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 mb-2">About the role</h3>
                <p className="text-slate-600 leading-relaxed">
                  {selectedJob.description || "A promising opportunity with a growing team."}
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  {role === "user" && !appliedByJobId[selectedJob._id] && (
                    <button
                      onClick={() => apply(selectedJob._id)}
                      disabled={applying[selectedJob._id]}
                      className="bg-slate-900 text-white px-5 py-3 rounded-lg font-semibold hover:bg-slate-700 disabled:opacity-50"
                    >
                      {applying[selectedJob._id] ? "Applying..." : "Apply now"}
                    </button>
                  )}
                  {appliedByJobId[selectedJob._id] && (
                    <span className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-3 font-semibold text-emerald-700">
                      Applied - {appliedByJobId[selectedJob._id].status}
                    </span>
                  )}
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="border border-slate-300 text-slate-700 px-5 py-3 rounded-lg font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
