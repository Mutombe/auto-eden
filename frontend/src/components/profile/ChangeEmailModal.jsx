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
import { X, Eye, EyeOff, Mail } from "lucide-react";
import { changeEmail, clearEmailChangeStatus } from "../../redux/slices/authSlice";

const ChangeEmailModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { user, emailChangeStatus, emailChangeError } = useSelector(
    (state) => state.auth
  );

  const [formData, setFormData] = useState({
    new_email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFormData({
        new_email: "",
        password: "",
      });
      setErrors({});
      dispatch(clearEmailChangeStatus());
    }
  }, [open, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.new_email) {
      newErrors.new_email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.new_email)) {
      newErrors.new_email = "Please enter a valid email";
    } else if (formData.new_email === user?.email) {
      newErrors.new_email = "New email must be different from current email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required to confirm this change";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await dispatch(changeEmail(formData));
    if (changeEmail.fulfilled.match(result)) {
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
          <Mail className="w-5 h-5 text-red-600" />
          <span className="font-bold">Change Email</span>
        </div>
        <IconButton onClick={onClose} size="small">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {emailChangeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {emailChangeError.detail ||
                emailChangeError.new_email?.[0] ||
                emailChangeError.password?.[0] ||
                "Failed to change email"}
            </Alert>
          )}

          {emailChangeStatus === "succeeded" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Email changed successfully!
            </Alert>
          )}

          <Alert severity="info" sx={{ mb: 2 }}>
            Current email: <strong>{user?.email}</strong>
          </Alert>

          <TextField
            fullWidth
            label="New Email Address"
            name="new_email"
            type="email"
            value={formData.new_email}
            onChange={handleChange}
            error={!!errors.new_email}
            helperText={errors.new_email}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Confirm with Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password || "Enter your password to confirm this change"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
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
            disabled={emailChangeStatus === "loading"}
            sx={{
              borderRadius: 2,
              bgcolor: "#e60000",
              "&:hover": { bgcolor: "#cc0000" },
            }}
          >
            {emailChangeStatus === "loading" ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Change Email"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChangeEmailModal;
