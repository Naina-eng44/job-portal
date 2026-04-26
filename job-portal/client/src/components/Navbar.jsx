import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    setUserName(localStorage.getItem("userName") || "User");
    setUserAge(localStorage.getItem("userAge") || "");
    setUserRole(localStorage.getItem("role"));
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    setToken("");
    navigate("/");
  };

  if (!token) {
    return null;
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md font-medium transition ${
      isActive
        ? "text-slate-900 bg-slate-100"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block px-4 py-2 transition ${
      isActive ? "bg-slate-100 text-slate-900" : "text-gray-600 hover:bg-gray-50 hover:text-slate-900"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="h-9 w-9 rounded-lg bg-slate-900 text-white grid place-items-center font-bold">JF</span>
            <span className="text-xl font-bold text-slate-900">JobFinder</span>
          </Link>

          <div className="hidden md:flex gap-2 items-center">
            <NavLink
              to="/jobs"
              className={linkClass}
            >
              Jobs
            </NavLink>
            <NavLink
              to="/applications"
              className={linkClass}
            >
              Applications
            </NavLink>
            {userRole === "employer" && (
              <NavLink
                to="/admin"
                className={linkClass}
              >
                Employer
              </NavLink>
            )}
            <NavLink to="/profile" className={linkClass}>
              Profile
            </NavLink>
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-200">
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {userRole || "user"}{userAge ? ` | Age ${userAge}` : ""}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            aria-label="Toggle navigation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <NavLink
              to="/jobs"
              className={mobileLinkClass}
            >
              Jobs
            </NavLink>
            <NavLink
              to="/applications"
              className={mobileLinkClass}
            >
              Applications
            </NavLink>
            {userRole === "employer" && (
              <NavLink
                to="/admin"
                className={mobileLinkClass}
              >
                Employer
              </NavLink>
            )}
            <NavLink to="/profile" className={mobileLinkClass}>
              Profile
            </NavLink>
            <div className="px-4 py-2 border-t border-gray-200 mt-2">
              <p className="text-sm font-semibold text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">
                {userRole || "user"}{userAge ? ` | Age ${userAge}` : ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 transition mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
