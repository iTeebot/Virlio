"use client";

import React, { useState } from "react";
import { FormInput } from "@/components/ui/form-input";
import { X, CheckCircle2, Loader2, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { ConsultationRequestPayload } from "@/types/pricing";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
}

export function ConsultationModal({ isOpen, onClose, initialService }: ConsultationModalProps) {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("Software / SaaS");
  const [currentWebsite, setCurrentWebsite] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>(
    initialService ? [initialService] : ["Website Development"]
  );
  const [preferredTimeline, setPreferredTimeline] = useState<ConsultationRequestPayload["preferredTimeline"]>("1 Month");
  const [budgetRange, setBudgetRange] = useState("$1,000 - $5,000");
  const [country, setCountry] = useState("Pakistan");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const availableServices = [
    "Website Development",
    "Custom Web Applications",
    "Mobile App (iOS & Android)",
    "AI Agents & Chatbots",
    "Workflow & Business Automation",
    "CRM System",
    "ERP & Internal Dashboards",
    "Booking & Appointment System",
    "Online Ordering & POS",
    "API & Cloud Integration",
    "SEO & Performance Audit",
    "UI/UX Design & Branding",
  ];

  const handleServiceToggle = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!businessName.trim() || !contactName.trim() || !contactEmail.trim()) {
      setError("Please complete all required business and contact fields.");
      return;
    }

    if (selectedServices.length === 0) {
      setError("Please select at least one service requirement.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Lead Dispatched to Teebot Engineers</span>
            </span>

            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Consultation Request Received!
            </h2>
            <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong className="text-gray-900">{contactName}</strong>. A Teebot Senior Software Architect will review your digital requirements for <strong className="text-gray-900">{businessName}</strong> and send an expert proposal within 24 hours.
            </p>

            <div className="pt-6">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors"
              >
                <span>Return to Virlio Workspace</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Teebot Professional Implementation</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Request Professional Consultation
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Tell us about your business. Teebot&apos;s engineering team will review your digital needs and construct a tailored implementation plan.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="businessName"
                  label="Business Name"
                  required
                  placeholder="Acme SaaS Inc."
                  value={businessName}
                  onChange={setBusinessName}
                  disabled={isSubmitting}
                />

                <div>
                  <label htmlFor="industry" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Industry / Vertical
                  </label>
                  <select
                    id="industry"
                    disabled={isSubmitting}
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Software / SaaS">Software / SaaS</option>
                    <option value="Restaurants & Hospitality">Restaurants & Hospitality</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Finance & Crypto">Finance & Crypto</option>
                    <option value="Healthcare & Medical">Healthcare & Medical</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="currentWebsite"
                  label="Current Website (If applicable)"
                  type="url"
                  placeholder="https://example.com"
                  value={currentWebsite}
                  onChange={setCurrentWebsite}
                  disabled={isSubmitting}
                />

                <div>
                  <label htmlFor="country" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Country / Region (Payment Gateway)
                  </label>
                  <select
                    id="country"
                    disabled={isSubmitting}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Pakistan">Pakistan (Easypaisa / JazzCash / Bank Transfer)</option>
                    <option value="UAE">UAE (Ziina / Apple Pay / AED)</option>
                    <option value="Global">Global / International (Stripe / PayPal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Requested Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableServices.map((service) => {
                    const isSelected = selectedServices.includes(service);
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleServiceToggle(service)}
                        className={`px-3 py-2 text-xs font-medium rounded-xl border text-left transition-all ${
                          isSelected
                            ? "bg-blue-50 border-blue-600 text-blue-700 font-semibold"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {service}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  id="contactName"
                  label="Contact Name"
                  required
                  placeholder="Jane Smith"
                  value={contactName}
                  onChange={setContactName}
                  disabled={isSubmitting}
                />

                <FormInput
                  id="contactEmail"
                  label="Business Email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  value={contactEmail}
                  onChange={setContactEmail}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredTimeline" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Target Timeline
                  </label>
                  <select
                    id="preferredTimeline"
                    disabled={isSubmitting}
                    value={preferredTimeline}
                    onChange={(e) => setPreferredTimeline(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Immediate (< 2 weeks)">Immediate (&lt; 2 weeks)</option>
                    <option value="1 Month">1 Month</option>
                    <option value="1-3 Months">1 - 3 Months</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="budgetRange" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Estimated Budget (Optional)
                  </label>
                  <select
                    id="budgetRange"
                    disabled={isSubmitting}
                    value={budgetRange}
                    onChange={(e) => setBudgetRange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Under $1,000">Under $1,000</option>
                    <option value="$1,000 - $5,000">$1,000 - $5,000</option>
                    <option value="$5,000 - $15,000">$5,000 - $15,000</option>
                    <option value="$15,000+">$15,000+</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Free Teebot Consultation</span>
                      <ArrowRight className="w-4 h-4 text-blue-200" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
