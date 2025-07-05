import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Chip,
  Badge,
  IconButton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import {
  Shield,
  Award,
  TrendingUp,
  Clock,
  Gauge,
  Map,
  Tag,
  DollarSign,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { formatMediaUrl } from './../../utils/image';
const VehicleCard = ({ vehicle, viewMode = "grid", onClick }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const cardContent = (
    <motion.div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
        viewMode === "list" ? "flex flex-col md:flex-row" : ""
      }`}
      whileHover={{ y: -5 }}
    >
      <div className={`relative ${viewMode === "list" ? "md:w-1/3" : ""}`}>
        <img
          src={formatMediaUrl(vehicle.images?.[0]?.image)}
          alt={`${vehicle.make} ${vehicle.model}`}
          className={`w-full object-cover ${
            viewMode === "list"
              ? "h-56 md:h-full md:rounded-l-xl"
              : "h-52 rounded-t-xl"
          }`}
          onError={(e) => {
            e.target.src = "/placeholder-car.jpg";
          }}
          loading={viewMode === "list" ? "eager" : "lazy"}
          fetchpriority={viewMode === "list" ? "high" : "auto"}
        />

        {/* Featured Badge */}
        {vehicle.featured && (
          <div className="absolute top-4 left-0 bg-yellow-500 text-white px-3 py-1 rounded-r-full shadow-md flex items-center">
            <Award className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Featured</span>
          </div>
        )}

        {/* Chips and badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Chip
            label={
              vehicle.listing_type === "instant_sale" ? "Buy Now" : "Auction"
            }
            color={
              vehicle.listing_type === "instant_sale" ? "success" : "primary"
            }
            size="small"
            sx={{
              backgroundColor:
                vehicle.listing_type === "instant_sale" ? "#059669" : "#1d4ed8",
              color: "white",
              fontWeight: 600,
              fontSize: "0.7rem",
            }}
          />

          {vehicle.is_physically_verified && (
            <Chip
              icon={<Shield className="w-3 h-3 text-green-700" />}
              label="Verified"
              size="small"
              sx={{
                backgroundColor: "rgba(240, 253, 244, 0.9)",
                color: "#15803d",
                fontWeight: 600,
                fontSize: "0.7rem",
                "& .MuiChip-icon": {
                  color: "#15803d",
                },
              }}
            />
          )}
        </div>
      </div>

      <div
        className={`p-4 flex flex-col ${viewMode === "list" ? "md:w-2/3" : ""}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-gray-600">
              {vehicle.year} • {vehicle.mileage?.toLocaleString() || "0"} km
            </p>
          </div>
          <Badge
            badgeContent={vehicle.bid_count || 0}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                backgroundColor: "#dc2626",
                color: "white",
              },
            }}
          >
            <TrendingUp className="text-gray-400 w-5 h-5" />
          </Badge>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Tag className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{vehicle.body_type || "Sedan"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Map className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{vehicle.location || "Unknown"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Gauge className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{vehicle.transmission || "Automatic"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-1.5 text-gray-500" />
            <span>{vehicle.fuel_type || "Petrol"}</span>
          </div>
        </div>

        <div className="mt-auto pt-2 flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-red-600">
              ${vehicle.price?.toLocaleString()}
            </span>
            {vehicle.discount_price && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${vehicle.discount_price?.toLocaleString()}
              </span>
            )}
          </div>

          {vehicle.listing_type === "marketplace" &&
          isAuthenticated &&
          user?.id !== vehicle.owner?.id ? (
            <Button
              variant="contained"
              size={viewMode === "grid" ? "medium" : "large"}
              onClick={onClick}
              sx={{
                backgroundColor: "#dc2626",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              }}
              className="!rounded-lg !font-medium"
            >
              Place Bid
            </Button>
          ) : (
            <Button
              variant="outlined"
              size={viewMode === "grid" ? "medium" : "large"}
              component={Link}
              to={`/vehicles/${vehicle.id}`}
              sx={{
                color: "#dc2626",
                borderColor: "#dc2626",
                "&:hover": {
                  borderColor: "#b91c1c",
                  backgroundColor: "rgba(220, 38, 38, 0.04)",
                },
              }}
              className="!rounded-lg !font-medium"
            >
              View Details
            </Button>
          )}
        </div>

        <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
          <div className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            <span>
              Posted {new Date(vehicle.created_at).toLocaleDateString()}
            </span>
          </div>
          {vehicle.ending_soon && (
            <div className="flex items-center text-red-500">
              <span className="animate-pulse mr-1">●</span>
              <span>Ending soon</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return isMobile && viewMode === "list" ? (
    <div className="mb-4">{cardContent}</div>
  ) : (
    cardContent
  );
};

export default VehicleCard;
