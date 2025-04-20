// src/pages/DashboardPage.jsx
import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserVehicles, deleteVehicle, createVehicle, updateVehicle, toggleVisibility } from '../../redux/slices/vehicleSlice';
import { fetchUserBids } from '../../redux/slices/bidSlice';
import { Tab, Tabs, Button, TextField, Dialog, IconButton, Select, MenuItem } from '@mui/material';
import { Car, Plus, Edit, Trash, Eye, EyeOff } from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { userVehicles, status } = useSelector((state) => state.vehicles);
  const { items: bids } = useSelector((state) => state.bids);
  const [activeTab, setActiveTab] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    price: '',
    listingType: 'marketplace'
  });

  useEffect(() => {
    dispatch(fetchUserVehicles());
    dispatch(fetchUserBids());
  }, [dispatch]);

  const handleSubmit = () => {
    if (editVehicle) {
      dispatch(updateVehicle({ id: editVehicle.id, data: formData }));
    } else {
      dispatch(createVehicle(formData));
    }
    setShowAddModal(false);
    setEditVehicle(null);
  };

  const canEditDelete = (vehicle) => 
    vehicle.status === 'pending' || vehicle.status === 'rejected';

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
        <Tab label="My Cars" />
        <Tab label="My Bids" />
      </Tabs>

      {activeTab === 0 ? (
        <div className="mt-4">
          <Button 
            variant="contained" 
            startIcon={<Plus />}
            onClick={() => setShowAddModal(true)}
          >
            Add Car
          </Button>

          <div className="mt-4 space-y-4">
            {userVehicles?.map(vehicle => (
              <div key={vehicle.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </h3>
                    <div className="flex gap-2 mt-2">
                      <Chip 
                        label={vehicle.status}
                        color={
                          vehicle.status === 'verified' ? 'success' : 
                          vehicle.status === 'rejected' ? 'error' : 'default'
                        }
                      />
                      <Chip label={vehicle.listingType} variant="outlined" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canEditDelete(vehicle) && (
                      <>
                        <IconButton onClick={() => {
                          setEditVehicle(vehicle);
                          setFormData(vehicle);
                          setShowAddModal(true);
                        }}>
                          <Edit size={16} />
                        </IconButton>
                        <IconButton onClick={() => dispatch(deleteVehicle(vehicle.id))}>
                          <Trash size={16} />
                        </IconButton>
                      </>
                    )}
                    {vehicle.listingType === 'marketplace' && vehicle.status === 'verified' && (
                      <IconButton onClick={() => dispatch(toggleVisibility(vehicle.id))}>
                        {vehicle.is_visible ? <Eye /> : <EyeOff />}
                      </IconButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {bids.map(bid => (
            <div key={bid.id} className="p-4 border rounded-lg">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-medium">
                    ${bid.amount} on {bid.vehicle.make} {bid.vehicle.model}
                  </h4>
                  <Chip 
                    label={bid.status} 
                    color={bid.status === 'accepted' ? 'success' : 'default'}
                  />
                </div>
                <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAddModal || !!editVehicle} onClose={() => {
        setShowAddModal(false);
        setEditVehicle(null);
      }}>
        <div className="p-4 space-y-4 w-96">
          <h2 className="text-xl font-bold">
            {editVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          
          <TextField
            fullWidth
            label="Make"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
          />
          
          <TextField
            fullWidth
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          
          <Select
            fullWidth
            label="Listing Type"
            value={formData.listingType}
            onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
          >
            <MenuItem value="marketplace">Marketplace</MenuItem>
            <MenuItem value="instant_sale">Instant Sale</MenuItem>
          </Select>

          <Button 
            variant="contained" 
            fullWidth
            onClick={handleSubmit}
            disabled={status === 'loading'}
          >
            {editVehicle ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}