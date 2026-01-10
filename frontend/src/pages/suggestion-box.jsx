// src/pages/SuggestionsPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Lightbulb, Send, CheckCircle, AlertCircle,
  MessageSquare, ThumbsUp, Sparkles, Zap
} from "lucide-react";
import { SlLike } from "react-icons/sl";
import { CiMobile3 } from "react-icons/ci";


/**
 * Suggestions Page - User Feedback & Ideas
 * Allow users to submit suggestions for improving Auto Eden
 */
export default function SuggestionsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    suggestion: ""
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setStatus("success");
      setLoading(false);
      setFormData({ name: "", email: "", category: "", suggestion: "" });
    }, 1500);
  };

  const categories = [
    { value: "feature", label: "New Feature Request" },
    { value: "improvement", label: "Improvement to Existing Feature" },
    { value: "bug", label: "Bug Report" },
    { value: "ux", label: "User Experience" },
    { value: "other", label: "Other" }
  ];

  const recentIdeas = [
    {
      title: "Mobile App",
      votes: 156,
      status: "planned",
      icon: <CiMobile3 className="w-4 h-4" />
    },
    {
      title: "Price Comparison Tool",
      votes: 89,
      status: "considering",
      icon: <Zap className="w-4 h-4" />
    },
    {
      title: "Vehicle Financing Options",
      votes: 124,
      status: "in-progress",
      icon: <SlLike className="w-4 h-4" />
    }
  ];

  return (
    <main className="pacaembu-font min-h-screen bg-gray-50">
      {/* SEO Hidden Heading */}
      <h1 className="sr-only">
        Suggestion Box - Share Your Ideas to Improve Auto Eden Zimbabwe
      </h1>

      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 text-purple-300 mb-4">
              <Lightbulb className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wider">Suggestion Box</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Help Us Build a Better Auto Eden
            </h2>
            <p className="text-lg text-purple-200">
              Your ideas shape our roadmap. Share your suggestions and help us create 
              the best car marketplace in Zimbabwe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Suggestion Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Submit Your Idea
                </h3>

                {status === "success" && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-700">Thank you! We've received your suggestion.</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700">Something went wrong. Please try again.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name (Optional)
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Suggestion *
                    </label>
                    <textarea
                      id="suggestion"
                      required
                      rows={6}
                      value={formData.suggestion}
                      onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                      placeholder="Describe your idea in detail. What problem does it solve? How would it help users?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Suggestion
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Popular Ideas Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <SlLike className="w-5 h-5 text-purple-600" />
                  Popular Ideas
                </h3>
                <div className="space-y-4">
                  {recentIdeas.map((idea, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 flex-shrink-0">
                        {idea.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{idea.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">{idea.votes} votes</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            idea.status === 'planned' ? 'bg-blue-100 text-blue-700' :
                            idea.status === 'in-progress' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idea.status === 'planned' ? 'Planned' :
                             idea.status === 'in-progress' ? 'In Progress' : 'Considering'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-purple-50 rounded-xl p-5 border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2 text-sm">Tips for Great Suggestions</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Be specific about the problem</li>
                  <li>• Explain how it would help users</li>
                  <li>• Include examples if possible</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Suggestion Box - Auto Eden",
          "description": "Share your ideas to help improve Auto Eden, Zimbabwe's leading car marketplace",
          "url": "https://autoeden.co.zw/suggestions"
        })}
      </script>
    </main>
  );
}