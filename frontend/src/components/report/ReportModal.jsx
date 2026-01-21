import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { Flag, AlertTriangle, X } from "lucide-react";
import api from "../../utils/api";

const REPORT_TYPES = [
  { value: "vehicle", label: "Vehicle Listing Issue" },
  { value: "user", label: "User Behavior" },
  { value: "scam", label: "Potential Scam" },
  { value: "content", label: "Inappropriate Content" },
];

const REPORT_REASONS = {
  vehicle: [
    "Misleading information",
    "Incorrect price",
    "Vehicle already sold",
    "Duplicate listing",
    "Fraudulent listing",
    "Other",
  ],
  user: [
    "Harassment",
    "Spam messages",
    "Suspicious activity",
    "Impersonation",
    "Other",
  ],
  scam: [
    "Fake vehicle",
    "Payment fraud",
    "Identity theft attempt",
    "Phishing",
    "Other",
  ],
  content: [
    "Inappropriate images",
    "Offensive language",
    "Copyright violation",
    "Other",
  ],
};

const ReportModal = ({
  open,
  onClose,
  reportType = null,
  vehicleId = null,
  userId = null,
  vehicleInfo = null,
  userInfo = null,
}) => {
  const [type, setType] = useState(reportType || "vehicle");
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason for your report");
      return;
    }

    const finalReason = reason === "Other" ? customReason : reason;
    if (!finalReason) {
      setError("Please provide a reason for your report");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const reportData = {
        type,
        reason: `${finalReason}${additionalInfo ? `\n\nAdditional details: ${additionalInfo}` : ""}`,
        reporter_email: email || null,
      };

      if (vehicleId) {
        reportData.reported_vehicle = vehicleId;
      }
      if (userId) {
        reportData.reported_user = userId;
      }

      await api.post("/core/reports/", reportData);
      setSuccess(true);

      // Reset form after successful submission
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason("");
        setCustomReason("");
        setAdditionalInfo("");
        setEmail("");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-5 h-5 text-red-600" />
          <span>Submit a Report</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          disabled={loading}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </DialogTitle>

      <DialogContent>
        {success ? (
          <Box className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-green-600" />
            </div>
            <Typography variant="h6" className="mb-2">
              Report Submitted
            </Typography>
            <Typography color="textSecondary">
              Thank you for helping keep Auto Eden safe. We will review your
              report shortly.
            </Typography>
          </Box>
        ) : (
          <div className="space-y-4 mt-2">
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Report context */}
            {vehicleInfo && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="caption" color="textSecondary">
                  Reporting vehicle:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {vehicleInfo.make} {vehicleInfo.model} ({vehicleInfo.year})
                </Typography>
              </div>
            )}

            {userInfo && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <Typography variant="caption" color="textSecondary">
                  Reporting user:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {userInfo.username}
                </Typography>
              </div>
            )}

            {/* Report type */}
            {!reportType && (
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={type}
                  label="Report Type"
                  onChange={(e) => {
                    setType(e.target.value);
                    setReason("");
                  }}
                >
                  {REPORT_TYPES.map((rt) => (
                    <MenuItem key={rt.value} value={rt.value}>
                      {rt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Reason selection */}
            <FormControl fullWidth>
              <InputLabel>Reason</InputLabel>
              <Select
                value={reason}
                label="Reason"
                onChange={(e) => setReason(e.target.value)}
              >
                {REPORT_REASONS[type]?.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Custom reason input */}
            {reason === "Other" && (
              <TextField
                fullWidth
                label="Please specify"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                required
              />
            )}

            {/* Additional details */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Additional Details (optional)"
              placeholder="Provide any additional information that might help us investigate..."
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
            />

            {/* Email for follow-up */}
            <TextField
              fullWidth
              type="email"
              label="Your Email (optional)"
              placeholder="For follow-up if needed"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Leave blank to submit anonymously"
            />

            <Alert severity="info" className="mt-4">
              All reports are reviewed by our team within 24-48 hours. False or
              malicious reports may result in account suspension.
            </Alert>
          </div>
        )}
      </DialogContent>

      {!success && (
        <DialogActions className="px-6 pb-4">
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="error"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Flag className="w-4 h-4" />}
          >
            {loading ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportModal;
