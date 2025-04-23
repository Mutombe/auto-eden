import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { deleteVehicle,   fetchPendingReview, 
    reviewVehicle,
    fetchAllVehicles, } from '../../redux/slices/vehicleSlice';
import { 
  CheckCircle, XCircle, Search, Sliders, 
  Car, DollarSign, Clock, AlertCircle 
} from 'lucide-react';
import { 
  Tabs, Tab, Chip, Button, 
  Dialog, TextField, Alert, Badge 
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { 
    pendingVehicles, 
    allVehicles,
    status, 
    error 
  } = useSelector((state) => state.vehicles);
  const [activeTab, setActiveTab] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    listingType: 'all',
    status: 'pending'
  });

  useEffect(() => {
    dispatch(fetchPendingReview());
    dispatch(fetchAllVehicles());
  }, [dispatch]);

  const handleReview = (action) => {
    dispatch(reviewVehicle({
      id: selectedVehicle.id,
      data: {
        status: action === 'approve' ? 'physically_verified' : 'rejected',
        rejection_reason: action === 'reject' ? rejectionReason : null
      }
    })).then(() => {
      setSelectedVehicle(null);
      setRejectionReason('');
    });
  };

  const columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80 
    },
    { 
      field: 'make', 
      headerName: 'Make', 
      width: 120 
    },
    { 
      field: 'model', 
      headerName: 'Model', 
      width: 150 
    },
    { 
      field: 'owner', 
      headerName: 'Owner', 
      width: 180,
      valueGetter: (params) => params.row.owner?.username || 'N/A'
    },
    { 
      field: 'listing_type', 
      headerName: 'Type', 
      width: 150,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={params.value === 'marketplace' ? 'primary' : 'secondary'}
          variant="outlined"
        />
      )
    },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 180,
      renderCell: (params) => {
        const statusMap = {
          pending: { color: 'default', label: 'Pending' },
          digitally_verified: { color: 'info', label: 'Digitally Verified' },
          physically_verified: { color: 'success', label: 'Verified' },
          rejected: { color: 'error', label: 'Rejected' }
        };
        const statusInfo = statusMap[params.value] || statusMap.pending;
        return <Chip color={statusInfo.color} label={statusInfo.label} />;
      }
    },
    { 
      field: 'price', 
      headerName: 'Price', 
      width: 150,
      valueGetter: (params) => 
        `$${params.row.price?.toLocaleString() || params.row.proposed_price?.toLocaleString()}`
    },
    { 
      field: 'actions', 
      headerName: 'Actions', 
      width: 250,
      renderCell: (params) => (
        <div className="flex gap-2">
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CheckCircle size={16} />}
            onClick={() => setSelectedVehicle(params.row)}
          >
            Approve
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<XCircle size={16} />}
            onClick={() => setSelectedVehicle(params.row)}
          >
            Reject
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => dispatch(deleteVehicle(params.row.id))}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Sliders className="text-gray-600" />
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            fullWidth
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            InputProps={{
              startAdornment: <Search className="w-4 h-4 mr-2 text-gray-400" />
            }}
          />
          
          <Select
            fullWidth
            label="Listing Type"
            value={filters.listingType}
            onChange={(e) => setFilters({...filters, listingType: e.target.value})}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="marketplace">Marketplace</MenuItem>
            <MenuItem value="instant_sale">Instant Sale</MenuItem>
          </Select>
          
          <Select
            fullWidth
            label="Status"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="digitally_verified">Digitally Verified</MenuItem>
            <MenuItem value="physically_verified">Verified</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
        <Tab label="Pending Review" icon={<Badge badgeContent={pendingVehicles?.length} color="primary" />} />
        <Tab label="All Vehicles" icon={<Badge badgeContent={allVehicles?.length} color="secondary" />} />
        <Tab label="Statistics" />
      </Tabs>

      {error && (
        <Alert severity="error" className="my-4">
          {error}
        </Alert>
      )}

      <div className="mt-4">
        {activeTab === 0 && (
          <div className="bg-white rounded-lg shadow-sm">
            <DataGrid
              rows={pendingVehicles}
              columns={columns}
              loading={status === 'loading'}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
            />
          </div>
        )}
        
        {activeTab === 1 && (
          <div className="bg-white rounded-lg shadow-sm">
            <DataGrid
              rows={allVehicles?.filter(vehicle => {
                const matchesSearch = filters.search === '' || 
                  `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(filters.search.toLowerCase());
                const matchesType = filters.listingType === 'all' || 
                  vehicle.listing_type === filters.listingType;
                const matchesStatus = filters.status === 'all' || 
                  vehicle.status === filters.status;
                return matchesSearch && matchesType && matchesStatus;
              })}
              columns={columns}
              loading={status === 'loading'}
              pageSize={10}
              rowsPerPageOptions={[10]}
              autoHeight
            />
          </div>
        )}
        
        {activeTab === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={<Car className="w-8 h-8" />}
              title="Total Vehicles"
              value={allVehicles?.length || 0}
              color="bg-blue-100 text-blue-600"
            />
            <StatCard 
              icon={<CheckCircle className="w-8 h-8" />}
              title="Verified"
              value={allVehicles?.filter(v => v.status === 'physically_verified').length || 0}
              color="bg-green-100 text-green-600"
            />
            <StatCard 
              icon={<AlertCircle className="w-8 h-8" />}
              title="Pending"
              value={pendingVehicles?.length || 0}
              color="bg-yellow-100 text-yellow-600"
            />
          </div>
        )}
      </div>

      <ReviewDialog 
        open={!!selectedVehicle}
        vehicle={selectedVehicle}
        rejectionReason={rejectionReason}
        onRejectionChange={setRejectionReason}
        onClose={() => setSelectedVehicle(null)}
        onApprove={() => handleReview('approve')}
        onReject={() => handleReview('reject')}
      />
    </div>
  );
}

const ReviewDialog = ({ 
  open, 
  vehicle, 
  rejectionReason, 
  onRejectionChange, 
  onClose, 
  onApprove, 
  onReject 
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">
        Review {vehicle?.make} {vehicle?.model}
      </h2>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Owner:</span>
          <span>{vehicle?.owner?.username}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <Chip 
            label={vehicle?.listing_type} 
            color={vehicle?.listing_type === 'marketplace' ? 'primary' : 'secondary'}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price:</span>
          <span className="font-semibold">
            ${vehicle?.price?.toLocaleString() || vehicle?.proposed_price?.toLocaleString()}
          </span>
        </div>
      </div>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Rejection Reason"
        value={rejectionReason}
        onChange={(e) => onRejectionChange(e.target.value)}
        placeholder="Provide reason for rejection (required)"
      />
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="error"
          onClick={onReject}
          disabled={!rejectionReason}
          startIcon={<XCircle size={16} />}
        >
          Reject
        </Button>
        <Button 
          variant="contained" 
          color="success"
          onClick={onApprove}
          startIcon={<CheckCircle size={16} />}
        >
          Approve
        </Button>
      </div>
    </div>
  </Dialog>
);

const StatCard = ({ icon, title, value, color }) => (
  <div className={`p-6 rounded-lg ${color} flex items-center gap-4`}>
    <div className="p-3 bg-white rounded-full">
      {icon}
    </div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  </div>
);