import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  FormGroup,
  Typography,
  Divider,
} from "@mui/material";
import { X, Bell, Mail, MessageSquare, Smartphone } from "lucide-react";
import api from "../../utils/api";

const NotificationPreferences = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [preferences, setPreferences] = useState({
    email_vehicle_approved: true,
    email_new_bid: true,
    email_quote_ready: true,
    push_enabled: false,
    whatsapp_enabled: false,
  });

  useEffect(() => {
    if (open) {
      fetchPreferences();
    }
  }, [open]);

  const fetchPreferences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/core/profile/notification-preferences/");
      if (response.data) {
        setPreferences(response.data);
      }
    } catch (err) {
      // If preferences don't exist, use defaults
      console.log("Using default preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name) => (event) => {
    setPreferences({
      ...preferences,
      [name]: event.target.checked,
    });
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.put("/core/profile/notification-preferences/", preferences);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
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
          <Bell className="w-5 h-5 text-red-600" />
          <span className="font-bold">Notification Preferences</span>
        </div>
        <IconButton onClick={onClose} size="small">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Preferences saved successfully!
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <>
            <Typography
              variant="subtitle2"
              className="flex items-center gap-2 mb-2"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              <Mail className="w-4 h-4" /> Email Notifications
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.email_vehicle_approved}
                    onChange={handleChange("email_vehicle_approved")}
                    color="error"
                  />
                }
                label="Vehicle approval/rejection notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.email_new_bid}
                    onChange={handleChange("email_new_bid")}
                    color="error"
                  />
                }
                label="New bid notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.email_quote_ready}
                    onChange={handleChange("email_quote_ready")}
                    color="error"
                  />
                }
                label="Quote ready notifications"
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              className="flex items-center gap-2 mb-2"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              <Smartphone className="w-4 h-4" /> Push Notifications
            </Typography>
            <FormGroup sx={{ mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.push_enabled}
                    onChange={handleChange("push_enabled")}
                    color="error"
                  />
                }
                label="Enable browser push notifications"
              />
            </FormGroup>

            <Divider sx={{ my: 2 }} />

            <Typography
              variant="subtitle2"
              className="flex items-center gap-2 mb-2"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp Notifications
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={preferences.whatsapp_enabled}
                    onChange={handleChange("whatsapp_enabled")}
                    color="error"
                  />
                }
                label="Enable WhatsApp notifications"
              />
            </FormGroup>

            <Alert severity="info" sx={{ mt: 2 }}>
              WhatsApp notifications require a verified phone number in your profile.
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || loading}
          sx={{
            borderRadius: 2,
            bgcolor: "#e60000",
            "&:hover": { bgcolor: "#cc0000" },
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : "Save Preferences"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationPreferences;
