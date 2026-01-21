// src/components/ai/ChatWidget.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendMessage,
  addUserMessage,
  toggleChat,
  closeChat,
  clearChat,
  checkAIStatus,
} from "../../redux/slices/aiSlice";
import {
  MessageSquare,
  X,
  Send,
  Trash2,
  Bot,
  User,
  Loader2,
  Sparkles,
  MinusCircle,
} from "lucide-react";
import { IconButton, TextField } from "@mui/material";

// Format timestamp
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Message component
const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  const isError = message.isError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`flex items-start gap-2 max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? "bg-red-600" : "bg-gray-800"
          }`}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Bot className="w-4 h-4 text-white" />
          )}
        </div>

        {/* Message Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isUser
              ? "bg-red-600 text-white rounded-tr-sm"
              : isError
              ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
              : "bg-gray-100 text-gray-800 rounded-tl-sm"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p
            className={`text-xs mt-1 ${
              isUser ? "text-white/70" : "text-gray-400"
            }`}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Typing indicator
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-start gap-2 mb-3"
  >
    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  </motion.div>
);

// Main Chat Widget
const ChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, loading, isOpen, isEnabled, vehicleContext } = useSelector(
    (state) => state.ai
  );
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Check AI status on mount
  useEffect(() => {
    dispatch(checkAIStatus());
  }, [dispatch]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    dispatch(addUserMessage(userMessage));

    // Send to AI
    dispatch(
      sendMessage({
        message: userMessage,
        context: vehicleContext,
      })
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    dispatch(clearChat());
  };

  // Don't render if AI is disabled by admin
  if (!isEnabled) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(toggleChat())}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors group"
            aria-label="Open AI Chat"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col ${
              isMinimized ? "w-80 h-14" : "w-96 h-[500px]"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Auto Eden AI</h3>
                  {!isMinimized && (
                    <p className="text-xs text-white/80">
                      {loading ? "Typing..." : "Ask me anything about cars"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && messages.length > 0 && (
                  <IconButton
                    size="small"
                    onClick={handleClear}
                    sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={() => setIsMinimized(!isMinimized)}
                  sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  <MinusCircle className="w-4 h-4" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => dispatch(closeChat())}
                  sx={{ color: "white", opacity: 0.8, "&:hover": { opacity: 1 } }}
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </IconButton>
              </div>
            </div>

            {/* Chat Content */}
            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Bot className="w-8 h-8 text-red-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-2">
                        Welcome to Auto Eden AI
                      </h4>
                      <p className="text-sm text-gray-500 mb-4">
                        I'm here to help you find the perfect vehicle, answer questions about listings, and assist with your car buying journey.
                      </p>
                      <div className="space-y-2 w-full">
                        {[
                          "What makes a good used car?",
                          "How do I check vehicle history?",
                          "Tips for negotiating car prices",
                        ].map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setInput(suggestion);
                              inputRef.current?.focus();
                            }}
                            className="w-full text-left text-sm px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                      ))}
                      {loading && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Vehicle Context Banner */}
                {vehicleContext && (
                  <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 text-sm text-blue-700">
                    Discussing: {vehicleContext.make} {vehicleContext.model} ({vehicleContext.year})
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <TextField
                      inputRef={inputRef}
                      fullWidth
                      multiline
                      maxRows={3}
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loading}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&.Mui-focused fieldset": {
                            borderColor: "#dc2626",
                          },
                        },
                      }}
                    />
                    <IconButton
                      onClick={handleSend}
                      disabled={!input.trim() || loading}
                      sx={{
                        bgcolor: "#dc2626",
                        color: "white",
                        "&:hover": { bgcolor: "#b91c1c" },
                        "&:disabled": { bgcolor: "#e5e7eb", color: "#9ca3af" },
                      }}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </IconButton>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    Powered by Claude AI
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
