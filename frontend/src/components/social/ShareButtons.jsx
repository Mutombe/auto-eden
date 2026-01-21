// src/components/social/ShareButtons.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Facebook,
  Twitter,
  Mail,
  Link2,
  Check,
  MessageCircle,
  X,
} from "lucide-react";

/**
 * Social Sharing Buttons Component
 * Provides share functionality for Facebook, Twitter/X, WhatsApp, Email, and Copy Link
 *
 * @param {string} url - The URL to share (defaults to current page)
 * @param {string} title - The title/headline to share
 * @param {string} description - Optional description for email/meta
 * @param {string} image - Optional image URL for rich previews
 * @param {string} variant - 'inline' | 'dropdown' | 'modal'
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
const ShareButtons = ({
  url,
  title,
  description = "",
  image = "",
  variant = "inline",
  size = "md",
}) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title || "Check this out on Auto Eden!");
  const encodedDescription = encodeURIComponent(description);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const shareLinks = [
    {
      name: "Facebook",
      icon: <Facebook className={iconSizes[size]} />,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "Twitter",
      icon: <Twitter className={iconSizes[size]} />,
      color: "bg-black hover:bg-gray-800",
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className={iconSizes[size]} />,
      color: "bg-[#25D366] hover:bg-[#20BD5A]",
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Email",
      icon: <Mail className={iconSizes[size]} />,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = (shareLink) => {
    if (shareLink.name === "Email") {
      window.location.href = shareLink.url;
    } else {
      window.open(shareLink.url, "_blank", "width=600,height=400,noopener,noreferrer");
    }
  };

  // Inline variant - horizontal row of buttons
  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 mr-1">Share:</span>
        {shareLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => handleShare(link)}
            className={`${sizeClasses[size]} ${link.color} text-white rounded-full flex items-center justify-center transition-colors`}
            title={`Share on ${link.name}`}
            aria-label={`Share on ${link.name}`}
          >
            {link.icon}
          </button>
        ))}
        <button
          onClick={handleCopyLink}
          className={`${sizeClasses[size]} ${
            copied ? "bg-green-500" : "bg-gray-200 hover:bg-gray-300"
          } ${copied ? "text-white" : "text-gray-600"} rounded-full flex items-center justify-center transition-colors`}
          title="Copy link"
          aria-label="Copy link"
        >
          {copied ? <Check className={iconSizes[size]} /> : <Link2 className={iconSizes[size]} />}
        </button>
      </div>
    );
  }

  // Dropdown variant - button that reveals options
  if (variant === "dropdown") {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${sizeClasses[size]} bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center justify-center transition-colors`}
          title="Share"
          aria-label="Share"
          aria-expanded={isOpen}
        >
          <Share2 className={iconSizes[size]} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-[180px]"
              >
                {shareLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => {
                      handleShare(link);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className={`${link.color} w-8 h-8 rounded-full flex items-center justify-center text-white`}>
                      {link.icon}
                    </span>
                    <span className="text-sm text-gray-700">{link.name}</span>
                  </button>
                ))}
                <div className="border-t border-gray-100 mt-1 pt-1">
                  <button
                    onClick={() => {
                      handleCopyLink();
                      setTimeout(() => setIsOpen(false), 1000);
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <span className={`${copied ? "bg-green-500" : "bg-gray-200"} w-8 h-8 rounded-full flex items-center justify-center ${copied ? "text-white" : "text-gray-600"}`}>
                      {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                    </span>
                    <span className="text-sm text-gray-700">
                      {copied ? "Copied!" : "Copy Link"}
                    </span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Modal variant - full share dialog
  if (variant === "modal") {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          aria-label="Share"
        >
          <Share2 className="w-4 h-4" />
          <span className="text-sm font-medium">Share</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setIsOpen(false)}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Share</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-gray-900 line-clamp-2">{title}</p>
                  {description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
                  )}
                </div>

                {/* Share buttons grid */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {shareLinks.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => handleShare(link)}
                      className="flex flex-col items-center gap-1.5"
                    >
                      <span className={`w-12 h-12 ${link.color} rounded-full flex items-center justify-center text-white`}>
                        {link.icon}
                      </span>
                      <span className="text-xs text-gray-600">{link.name}</span>
                    </button>
                  ))}
                </div>

                {/* Copy link */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 ${
                      copied
                        ? "bg-green-500 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    } rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return null;
};

export default ShareButtons;
