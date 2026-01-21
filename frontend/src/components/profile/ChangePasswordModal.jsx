import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { X, Eye, EyeOff, Lock } from "lucide-react";
import {
  changePassword,
  clearPasswordChangeStatus,
} from "../../redux/slices/authSlice";

const ChangePasswordModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { passwordChangeStatus, passwordChangeError } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setErrors({});
      dispatch(clearPasswordChangeStatus());
    }
  }, [open, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters";
    }

    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(changePassword(formData));
    if (changePassword.fulfilled.match(result)) {
      onClose();
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const toggleShowPassword = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-red-600" />
          <span className="font-bold">Change Password</span>
        </div>
        <IconButton onClick={onClose} size="small">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {passwordChangeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordChangeError.detail ||
                passwordChangeError.current_password?.[0] ||
                "Failed to change password"}
            </Alert>
          )}

          {passwordChangeStatus === "succeeded" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Password changed successfully!
            </Alert>
          )}

          <TextField
            fullWidth
            label="Current Password"
            name="current_password"
            type={showPasswords.current ? "text" : "password"}
            value={formData.current_password}
            onChange={handleChange}
            error={!!errors.current_password}
            helperText={errors.current_password}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword("current")}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="New Password"
            name="new_password"
            type={showPasswords.new ? "text" : "password"}
            value={formData.new_password}
            onChange={handleChange}
            error={!!errors.new_password}
            helperText={errors.new_password}
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword("new")}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirm_password"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirm_password}
            onChange={handleChange}
            error={!!errors.confirm_password}
            helperText={errors.confirm_password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => toggleShowPassword("confirm")}
                    edge="end"
                    size="small"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={passwordChangeStatus === "loading"}
            sx={{
              borderRadius: 2,
              bgcolor: "#e60000",
              "&:hover": { bgcolor: "#cc0000" },
            }}
          >
            {passwordChangeStatus === "loading" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangePasswordModal;
