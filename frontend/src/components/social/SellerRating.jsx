import React from "react";
import { Star, ShieldCheck, Award, Zap, BadgeCheck } from "lucide-react";
import { Tooltip } from "@mui/material";

const BADGE_CONFIG = {
  verified: { icon: ShieldCheck, color: "#3b82f6", label: "Verified Seller" },
  top_rated: { icon: Star, color: "#f59e0b", label: "Top Rated" },
  quick_responder: { icon: Zap, color: "#10b981", label: "Quick Responder" },
  trusted: { icon: BadgeCheck, color: "#8b5cf6", label: "Trusted Seller" },
  super_seller: { icon: Award, color: "#ef4444", label: "Super Seller" },
  premium: { icon: Award, color: "#f59e0b", label: "Premium Partner" },
};

const SellerRating = ({
  rating = 0,
  reviewCount = 0,
  badges = [],
  size = "default", // "small" | "default" | "large"
  showBadges = true,
  showReviewCount = true,
  onClick,
}) => {
  const sizeConfig = {
    small: { star: "w-3 h-3", text: "text-xs", badge: "w-4 h-4" },
    default: { star: "w-4 h-4", text: "text-sm", badge: "w-5 h-5" },
    large: { star: "w-5 h-5", text: "text-base", badge: "w-6 h-6" },
  };

  const config = sizeConfig[size];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div
      className={`flex items-center gap-2 ${onClick ? "cursor-pointer hover:opacity-80" : ""}`}
      onClick={onClick}
    >
      {/* Stars */}
      <div className="flex items-center">
        {/* Full stars */}
        {[...Array(fullStars)].map((_, i) => (
          <Star
            key={`full-${i}`}
            className={`${config.star} text-yellow-400 fill-yellow-400`}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${config.star} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${config.star} text-yellow-400 fill-yellow-400`} />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${config.star} text-gray-300`} />
        ))}
      </div>

      {/* Rating number */}
      <span className={`${config.text} font-medium text-gray-700`}>
        {rating.toFixed(1)}
      </span>

      {/* Review count */}
      {showReviewCount && reviewCount > 0 && (
        <span className={`${config.text} text-gray-500`}>
          ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
        </span>
      )}

      {/* Badges */}
      {showBadges && badges.length > 0 && (
        <div className="flex items-center gap-1 ml-2">
          {badges.slice(0, 3).map((badge) => {
            const badgeConfig = BADGE_CONFIG[badge.badge_type];
            if (!badgeConfig) return null;

            const BadgeIcon = badgeConfig.icon;
            return (
              <Tooltip key={badge.badge_type} title={badgeConfig.label} arrow>
                <div
                  className={`p-1 rounded-full`}
                  style={{ backgroundColor: `${badgeConfig.color}15` }}
                >
                  <BadgeIcon
                    className={config.badge}
                    style={{ color: badgeConfig.color }}
                  />
                </div>
              </Tooltip>
            );
          })}
          {badges.length > 3 && (
            <span className={`${config.text} text-gray-500`}>
              +{badges.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerRating;
