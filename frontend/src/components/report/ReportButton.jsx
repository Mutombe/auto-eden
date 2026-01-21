import React, { useState } from "react";
import { Flag } from "lucide-react";
import ReportModal from "./ReportModal";

const ReportButton = ({
  reportType,
  vehicleId,
  userId,
  vehicleInfo,
  userInfo,
  variant = "icon", // "icon" | "text" | "full"
  className = "",
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setModalOpen(true);
  };

  const renderButton = () => {
    switch (variant) {
      case "text":
        return (
          <button
            onClick={handleClick}
            className={`text-gray-500 hover:text-red-600 text-sm flex items-center gap-1 ${className}`}
          >
            <Flag className="w-3 h-3" />
            Report
          </button>
        );

      case "full":
        return (
          <button
            onClick={handleClick}
            className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors ${className}`}
          >
            <Flag className="w-4 h-4" />
            Report this {reportType || "listing"}
          </button>
        );

      case "icon":
      default:
        return (
          <button
            onClick={handleClick}
            className={`p-2 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors ${className}`}
            title="Report"
          >
            <Flag className="w-4 h-4" />
          </button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      <ReportModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportType={reportType}
        vehicleId={vehicleId}
        userId={userId}
        vehicleInfo={vehicleInfo}
        userInfo={userInfo}
      />
    </>
  );
};

export default ReportButton;
