import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ErrorPage = ({
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try again.",
  errorCode = null,
  showRetry = true,
  showHome = true,
  showBack = true,
  showContact = true,
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        {errorCode && (
          <p className="text-6xl font-bold text-gray-200 mb-2">{errorCode}</p>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>

        <p className="text-gray-600 mb-8">{message}</p>

        <div className="flex flex-wrap gap-3 justify-center">
          {showBack && (
            <button
              onClick={handleGoBack}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          )}

          {showRetry && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}

          {showHome && (
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4" />
              Go Home
            </button>
          )}
        </div>

        {showContact && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3">
              If this problem persists, please contact our support team
            </p>
            <a
              href="mailto:support@autoeden.co.zw"
              className="inline-flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Mail className="w-4 h-4" />
              support@autoeden.co.zw
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
