import React from "react";
import { Car, Home, Search, ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  const popularLinks = [
    { path: "/marketplace", label: "Browse Vehicles", icon: Car },
    { path: "/search", label: "Search", icon: Search },
    { path: "/", label: "Home", icon: Home },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <p className="text-[180px] font-bold text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <Car className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Page Not Found
        </h1>

        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like this page took a wrong turn. The page you're looking for
          doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>

        {/* Popular Links */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-sm font-medium text-gray-500 mb-4">
            Popular Pages
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {popularLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <link.icon className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-red-600 transition-colors">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Search suggestion */}
        <p className="mt-8 text-sm text-gray-500">
          Looking for a specific vehicle?{" "}
          <Link to="/marketplace" className="text-red-600 hover:text-red-700">
            Browse our marketplace
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
