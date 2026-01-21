import React, { useState, useEffect } from "react";
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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Typography,
  Chip,
} from "@mui/material";
import { X, Settings, Save, Download } from "lucide-react";
import api from "../../utils/api";

const AVAILABLE_COLUMNS = {
  vehicles: [
    { key: 'id', label: 'ID' },
    { key: 'make', label: 'Make' },
    { key: 'model', label: 'Model' },
    { key: 'year', label: 'Year' },
    { key: 'vin', label: 'VIN' },
    { key: 'mileage', label: 'Mileage' },
    { key: 'price', label: 'Price' },
    { key: 'proposed_price', label: 'Proposed Price' },
    { key: 'listing_type', label: 'Listing Type' },
    { key: 'verification_state', label: 'Status' },
    { key: 'fuel_type', label: 'Fuel Type' },
    { key: 'transmission', label: 'Transmission' },
    { key: 'body_type', label: 'Body Type' },
    { key: 'location', label: 'Location' },
    { key: 'owner__username', label: 'Owner' },
    { key: 'created_at', label: 'Created At' },
  ],
  bids: [
    { key: 'id', label: 'ID' },
    { key: 'vehicle__make', label: 'Vehicle Make' },
    { key: 'vehicle__model', label: 'Vehicle Model' },
    { key: 'vehicle__year', label: 'Vehicle Year' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'bidder__username', label: 'Bidder' },
    { key: 'message', label: 'Message' },
    { key: 'created_at', label: 'Created At' },
  ],
};

const ExportConfigModal = ({ open, onClose, exportType = 'vehicles', onExport }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [configurations, setConfigurations] = useState([]);

  const [configName, setConfigName] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isDefault, setIsDefault] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);

  const columns = AVAILABLE_COLUMNS[exportType] || AVAILABLE_COLUMNS.vehicles;

  useEffect(() => {
    if (open) {
      fetchConfigurations();
      // Select all columns by default
      setSelectedColumns(columns.map(c => c.key));
    }
  }, [open, exportType]);

  const fetchConfigurations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/core/export-configurations/");
      setConfigurations(response.data.filter(c => c.export_type === exportType));
    } catch (err) {
      console.log("No saved configurations");
    } finally {
      setLoading(false);
    }
  };

  const handleColumnToggle = (key) => {
    setSelectedColumns(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(columns.map(c => c.key));
  };

  const handleDeselectAll = () => {
    setSelectedColumns([]);
  };

  const handleSaveConfiguration = async () => {
    if (!configName.trim()) {
      setError("Please enter a configuration name");
      return;
    }
    if (selectedColumns.length === 0) {
      setError("Please select at least one column");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await api.post("/core/export-configurations/", {
        name: configName,
        columns: selectedColumns,
        export_type: exportType,
        is_default: isDefault,
      });
      setSuccess(true);
      setConfigName("");
      fetchConfigurations();
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError("Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleLoadConfiguration = (config) => {
    setSelectedColumns(config.columns);
    setConfigName(config.name);
    setIsDefault(config.is_default);
    setSelectedConfigId(config.id);
  };

  const handleDeleteConfiguration = async (configId) => {
    try {
      await api.delete(`/core/export-configurations/${configId}/`);
      fetchConfigurations();
      if (selectedConfigId === configId) {
        setSelectedConfigId(null);
        setConfigName("");
        setSelectedColumns(columns.map(c => c.key));
      }
    } catch (err) {
      setError("Failed to delete configuration");
    }
  };

  const handleExport = (format) => {
    if (selectedColumns.length === 0) {
      setError("Please select at least one column");
      return;
    }
    onExport?.(format, selectedColumns, selectedConfigId);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-red-600" />
          <span className="font-bold">Export Configuration</span>
        </div>
        <IconButton onClick={onClose} size="small">
          <X className="w-5 h-5" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Configuration saved successfully!
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <CircularProgress />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Saved Configurations */}
            {configurations.length > 0 && (
              <div>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Saved Configurations
                </Typography>
                <div className="flex flex-wrap gap-2">
                  {configurations.map((config) => (
                    <Chip
                      key={config.id}
                      label={config.name}
                      onClick={() => handleLoadConfiguration(config)}
                      onDelete={() => handleDeleteConfiguration(config.id)}
                      color={selectedConfigId === config.id ? "primary" : "default"}
                      variant={selectedConfigId === config.id ? "filled" : "outlined"}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Column Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Select Columns to Export
                </Typography>
                <div className="flex gap-2">
                  <Button size="small" onClick={handleSelectAll}>
                    Select All
                  </Button>
                  <Button size="small" onClick={handleDeselectAll}>
                    Deselect All
                  </Button>
                </div>
              </div>
              <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {columns.map((column) => (
                  <FormControlLabel
                    key={column.key}
                    control={
                      <Checkbox
                        checked={selectedColumns.includes(column.key)}
                        onChange={() => handleColumnToggle(column.key)}
                        color="error"
                        size="small"
                      />
                    }
                    label={column.label}
                    sx={{ width: '50%', mr: 0 }}
                  />
                ))}
              </FormGroup>
            </div>

            {/* Save Configuration */}
            <div className="border-t pt-4">
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Save This Configuration
              </Typography>
              <div className="flex gap-2 items-end">
                <TextField
                  size="small"
                  label="Configuration Name"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  sx={{ flex: 1 }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      color="error"
                      size="small"
                    />
                  }
                  label="Default"
                />
                <Button
                  variant="outlined"
                  onClick={handleSaveConfiguration}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} /> : <Save className="w-4 h-4" />}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'space-between' }}>
        <div className="text-sm text-gray-500">
          {selectedColumns.length} of {columns.length} columns selected
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={() => handleExport('csv')}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            startIcon={<Download className="w-4 h-4" />}
          >
            CSV
          </Button>
          <Button
            onClick={() => handleExport('excel')}
            variant="outlined"
            sx={{ borderRadius: 2 }}
            startIcon={<Download className="w-4 h-4" />}
          >
            Excel
          </Button>
          <Button
            onClick={() => handleExport('pdf')}
            variant="contained"
            sx={{
              borderRadius: 2,
              bgcolor: "#e60000",
              "&:hover": { bgcolor: "#cc0000" },
            }}
            startIcon={<Download className="w-4 h-4" />}
          >
            PDF
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
};

export default ExportConfigModal;
