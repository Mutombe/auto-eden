import React, { useState } from "react";
import {
  Bot,
  Sparkles,
  Send,
  Loader2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { CircularProgress, Alert } from "@mui/material";
import api from "../../utils/api";

const VehicleAI = ({ vehicleId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [askingQuestion, setAskingQuestion] = useState(false);

  const fetchAnalysis = async () => {
    if (analysis) {
      setIsOpen(!isOpen);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/core/ai/vehicles/${vehicleId}/analyze/`);
      setAnalysis(response.data.analysis);
      setIsOpen(true);
    } catch (err) {
      if (err.response?.status === 503) {
        setError("AI features are currently unavailable");
      } else {
        setError("Failed to analyze vehicle");
      }
    } finally {
      setLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim() || askingQuestion) return;

    setAskingQuestion(true);
    setError(null);
    try {
      const response = await api.post(`/core/ai/vehicles/${vehicleId}/ask/`, {
        question: question.trim(),
      });
      setAnswer(response.data.response);
      setQuestion("");
    } catch (err) {
      if (err.response?.status === 503) {
        setError("AI features are currently unavailable");
      } else {
        setError("Failed to get answer");
      }
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <div className="border rounded-lg bg-gradient-to-r from-red-50 to-white">
      {/* Header Button */}
      <button
        onClick={fetchAnalysis}
        disabled={loading}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-red-50/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <span className="font-medium text-gray-900">AI Vehicle Analysis</span>
            <p className="text-xs text-gray-500">Get AI-powered insights about this vehicle</p>
          </div>
        </div>
        {loading ? (
          <CircularProgress size={20} />
        ) : isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Content */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-4">
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Analysis */}
          {analysis && (
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">AI Analysis</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {analysis}
              </div>
            </div>
          )}

          {/* Previous Answer */}
          {answer && (
            <div className="bg-white rounded-lg p-4 border shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-gray-700">AI Response</span>
              </div>
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {answer}
              </div>
            </div>
          )}

          {/* Ask a Question */}
          <div className="bg-white rounded-lg p-4 border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                Ask about this vehicle
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., Is this a reliable model? What's the fuel economy?"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={askingQuestion}
              />
              <button
                onClick={askQuestion}
                disabled={askingQuestion || !question.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {askingQuestion ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-400 text-center">
            Powered by Claude AI. Analysis is based on general knowledge and may not reflect
            this specific vehicle's condition.
          </p>
        </div>
      )}
    </div>
  );
};

export default VehicleAI;
