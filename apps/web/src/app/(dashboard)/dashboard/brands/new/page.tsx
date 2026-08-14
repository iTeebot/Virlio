"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Step1BasicInfoComponent } from "@/components/brands/wizard/step1-basic-info";
import { Step2IdentityComponent } from "@/components/brands/wizard/step2-identity";
import { Step3AudienceComponent } from "@/components/brands/wizard/step3-audience";
import { Step4ProductsComponent } from "@/components/brands/wizard/step4-products";
import { Step5VoiceComponent } from "@/components/brands/wizard/step5-voice";
import { Step6SocialComponent } from "@/components/brands/wizard/step6-social";
import { Step7VerificationComponent } from "@/components/brands/wizard/step7-verification";
import { Step8ReportComponent } from "@/components/brands/wizard/step8-report";
import { Step9ReviewComponent } from "@/components/brands/wizard/step9-review";
import {
  step1BasicInfoSchema,
  step2BrandIdentitySchema,
  step3TargetAudienceSchema,
  step4ProductsServicesSchema,
  step5BrandVoiceSchema,
  step6SocialPresenceSchema,
  step7VerificationEvidenceSchema,
} from "@/lib/validations/brand-wizard";
import { ArrowLeft, ArrowRight, Save, CheckCircle2, AlertCircle, Trash2, RotateCcw, AlertTriangle, ShieldCheck, X } from "lucide-react";
import { z } from "zod";

const INITIAL_WIZARD_DATA = {
  step1: {
    name: "",
    slug: "",
    industry: "",
    sub_industry: "",
    short_description: "",
    country: "",
    state_province: "",
    city: "",
    founded_year: undefined,
    employee_size: "",
    business_type: "",
  },
  step2: {
    logo_url: "",
    banner_url: "",
    icon_url: "",
    guidelines_pdf_url: "",
    primary_color: "#2563EB",
    secondary_color: "#1E40AF",
    accent_color: "#3B82F6",
    dark_bg_color: "#0F172A",
    light_bg_color: "#F8FAFC",
    custom_colors: [],
    palette_image_url: "",
    typography: "Inter",
    brand_style: "Modern",
    brand_personality: [],
  },
  step3: {
    target_age_groups: [],
    target_countries: [],
    target_languages: [],
    audience_interests: [],
    audience_description: "",
    customer_type: "",
    income_segment: "",
  },
  step4: {
    products: [],
    services: [],
    featured_products: [],
    best_seller: "",
    price_range: "",
    competitive_advantages: "",
    usps: [],
    competitors: [],
    things_customers_love: "",
    things_customers_ask: [],
  },
  step5: {
    brand_tone: "",
    communication_style: "",
    mission: "",
    vision: "",
    tagline: "",
    words_we_love: [],
    words_we_avoid: [],
    topics_to_avoid: [],
    humor_allowed: true,
    political_content: false,
    religious_content: false,
    sensitive_topics: false,
    cta_style: "",
    preferred_meme_style: "",
    preferred_caption_length: "",
    preferred_hashtag_style: "",
  },
  step6: {
    website: "",
    facebook: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    youtube: "",
    pinterest: "",
    threads: "",
    x: "",
    whatsapp_business: "",
    google_business: "",
    business_email: "",
    business_phone: "",
    email_verified: false,
  },
  step7: {
    storefront_photos: [],
    business_photos: [],
    business_card_url: "",
    catalog_url: "",
    menu_url: "",
    invoice_url: "",
    tax_registration_url: "",
    company_registration_url: "",
    dns_txt_record: "",
    meta_tag: "",
  },
};

const STEP_TITLES = [
  "Basic Info",
  "Brand Identity",
  "Audience",
  "Products",
  "Brand Voice",
  "Social Presence",
  "Verification",
  "AI Analysis",
  "Review & Submit",
];

export default function CreateBrandWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState(INITIAL_WIZARD_DATA);
  const [draftDetected, setDraftDetected] = useState<any>(null);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  const sanitizeDraftData = (rawDraft: any) => {
    if (!rawDraft?.step_data) return rawDraft;
    const stepData = { ...rawDraft.step_data };
    if (stepData.step6 && stepData.step6.business_email === "contact@virlio.com") {
      stepData.step6 = { ...stepData.step6, business_email: "" };
    }
    if (stepData.step5 && stepData.step5.tagline === "Empowering Your Digital Presence.") {
      stepData.step5 = { ...stepData.step5, tagline: "" };
    }
    if (stepData.step5 && stepData.step5.mission === "To empower businesses and creators with innovative AI-driven viral marketing software.") {
      stepData.step5 = { ...stepData.step5, mission: "" };
    }
    if (stepData.step5 && stepData.step5.vision === "To become the global standard for brand creation and meme marketing.") {
      stepData.step5 = { ...stepData.step5, vision: "" };
    }
    return { ...rawDraft, step_data: stepData };
  };

  // Load existing creation draft on mount
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch("/api/v1/brands/draft");
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.step_data && json.data.step_data.step1?.name) {
            const cleanDraft = sanitizeDraftData(json.data);
            setDraftDetected(cleanDraft);
            setShowDraftModal(true);
          }
        }
      } catch (err) {
        console.error("Draft load error", err);
      }
    }
    loadDraft();
  }, []);

  // Browser refresh/close protection (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !submitting) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes in your brand setup. Do you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, submitting]);

  // Validation function per step
  const validateStep = useCallback((stepNum: number, data: typeof INITIAL_WIZARD_DATA): { isValid: boolean; errors: Record<string, string> } => {
    const errors: Record<string, string> = {};

    try {
      if (stepNum === 1) {
        step1BasicInfoSchema.parse(data.step1);
      } else if (stepNum === 2) {
        step2BrandIdentitySchema.parse(data.step2);
      } else if (stepNum === 3) {
        step3TargetAudienceSchema.parse(data.step3);
      } else if (stepNum === 4) {
        step4ProductsServicesSchema.parse(data.step4);
      } else if (stepNum === 5) {
        step5BrandVoiceSchema.parse(data.step5);
      } else if (stepNum === 6) {
        step6SocialPresenceSchema.parse(data.step6);
      } else if (stepNum === 7) {
        step7VerificationEvidenceSchema.parse(data.step7);
      }
      return { isValid: true, errors: {} };
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        err.issues.forEach((issue) => {
          const pathKey = issue.path[issue.path.length - 1] as string;
          errors[pathKey] = issue.message;
        });
      }
      return { isValid: false, errors };
    }
  }, []);

  // Compute live validation state for current step
  const currentStepValidation = useMemo(() => {
    return validateStep(currentStep, wizardData);
  }, [currentStep, wizardData, validateStep]);

  // Auto-save draft API caller
  const autoSaveDraft = async (step: number, data: typeof INITIAL_WIZARD_DATA) => {
    setSaveStatus("saving");
    try {
      await fetch("/api/v1/brands/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_step: step, step_data: data }),
      });
      setSaveStatus("saved");
      setIsDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setSaveStatus("idle");
    }
  };

  const updateStepData = (stepKey: keyof typeof INITIAL_WIZARD_DATA, updated: any) => {
    setIsDirty(true);
    setWizardData((prev) => {
      const next = {
        ...prev,
        [stepKey]: { ...prev[stepKey], ...updated },
      };
      autoSaveDraft(currentStep, next);
      return next;
    });
  };

  // Continue draft handler
  const handleContinueDraft = () => {
    if (draftDetected && draftDetected.step_data) {
      const sanitized = sanitizeDraftData(draftDetected);
      setWizardData((prev) => ({
        ...prev,
        ...sanitized.step_data,
      }));
      setCurrentStep(sanitized.current_step || 1);
    }
    setShowDraftModal(false);
  };

  // Discard draft permanently
  const handleDiscardDraft = async () => {
    try {
      await fetch("/api/v1/brands/draft", { method: "DELETE" });
    } catch (err) {
      console.error(err);
    }
    setWizardData(INITIAL_WIZARD_DATA);
    setCurrentStep(1);
    setDraftDetected(null);
    setShowDraftModal(false);
    setShowDiscardModal(false);
    setIsDirty(false);
  };

  const handleNext = () => {
    const val = validateStep(currentStep, wizardData);
    if (!val.isValid) {
      setFieldErrors(val.errors);
      // Focus first invalid element if present
      const firstKey = Object.keys(val.errors)[0];
      if (firstKey) {
        const el = document.getElementById(`field-${firstKey}`);
        if (el) el.focus();
      }
      return;
    }

    setFieldErrors({});
    const next = Math.min(currentStep + 1, 9);
    setCurrentStep(next);
    autoSaveDraft(next, wizardData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setFieldErrors({});
    const prev = Math.max(currentStep - 1, 1);
    setCurrentStep(prev);
    autoSaveDraft(prev, wizardData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleJumpToStep = (stepNum: number) => {
    // Cannot skip forward if preceding steps are invalid
    if (stepNum > currentStep) {
      for (let s = 1; s < stepNum; s++) {
        const check = validateStep(s, wizardData);
        if (!check.isValid) {
          setCurrentStep(s);
          setFieldErrors(check.errors);
          return;
        }
      }
    }
    setFieldErrors({});
    setCurrentStep(stepNum);
    autoSaveDraft(stepNum, wizardData);
  };

  const handleSubmitFinal = async () => {
    setSubmitting(true);
    setFieldErrors({});
    try {
      const res = await fetch("/api/v1/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(wizardData),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setIsDirty(false);
        router.push(`/dashboard/brands/${json.data.id}`);
      } else {
        setFieldErrors({ general: json.message || "Failed to create brand. Please verify form inputs." });
      }
    } catch (err: any) {
      setFieldErrors({ general: err.message || "Connection error" });
    } finally {
      setSubmitting(false);
    }
  };

  const fullBrandContext = useMemo(() => ({
    ...wizardData.step1,
    ...wizardData.step2,
    ...wizardData.step3,
    ...wizardData.step4,
    ...wizardData.step5,
  }), [wizardData]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Resume Draft Detection Modal */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Unfinished Brand Draft</h3>
                <p className="text-xs text-gray-500">You have an incomplete brand setup in progress.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1 text-gray-700">
              <p><strong className="text-gray-900">Brand Name:</strong> {draftDetected?.step_data?.step1?.name || "Unnamed Brand"}</p>
              <p><strong className="text-gray-900">Saved Step:</strong> Step {draftDetected?.current_step || 1} of 9 ({STEP_TITLES[(draftDetected?.current_step || 1) - 1]})</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
              >
                Discard Draft
              </button>
              <button
                type="button"
                onClick={handleContinueDraft}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
              >
                Continue Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard Confirmation Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-gray-900">Discard Brand Setup?</h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              This action will permanently delete your draft and all entered brand information. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs"
              >
                Confirm Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Header Progress Container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Step {currentStep} of 9
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight mt-0.5">
              {STEP_TITLES[currentStep - 1]}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {saveStatus === "saving" && (
              <span className="text-xs text-gray-500 animate-pulse flex items-center gap-1">
                <Save className="w-3.5 h-3.5" /> Auto-saving draft...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Progress Saved
              </span>
            )}
            <button
              type="button"
              onClick={() => setShowDiscardModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Discard Draft
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/brands")}
              className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              Save & Exit
            </button>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-9 gap-1.5">
          {STEP_TITLES.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <button
                key={stepNum}
                type="button"
                onClick={() => handleJumpToStep(stepNum)}
                className={`h-2.5 rounded-full transition-all ${
                  isCurrent
                    ? "bg-blue-600 ring-2 ring-blue-500/20"
                    : isCompleted
                    ? "bg-emerald-500"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
                title={`Step ${stepNum}: ${title}`}
              />
            );
          })}
        </div>
      </div>

      {fieldErrors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{fieldErrors.general}</span>
        </div>
      )}

      {/* Step Components Render Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {currentStep === 1 && (
          <Step1BasicInfoComponent
            data={wizardData.step1}
            onChange={(updated) => updateStepData("step1", updated)}
            errors={fieldErrors}
          />
        )}

        {currentStep === 2 && (
          <Step2IdentityComponent
            data={wizardData.step2}
            onChange={(updated) => updateStepData("step2", updated)}
            brandContext={fullBrandContext}
            errors={fieldErrors}
          />
        )}

        {currentStep === 3 && (
          <Step3AudienceComponent
            data={wizardData.step3}
            onChange={(updated) => updateStepData("step3", updated)}
            brandContext={fullBrandContext}
          />
        )}

        {currentStep === 4 && (
          <Step4ProductsComponent
            data={wizardData.step4}
            onChange={(updated) => updateStepData("step4", updated)}
            brandContext={fullBrandContext}
          />
        )}

        {currentStep === 5 && (
          <Step5VoiceComponent
            data={wizardData.step5}
            onChange={(updated) => updateStepData("step5", updated)}
            brandContext={fullBrandContext}
          />
        )}

        {currentStep === 6 && (
          <Step6SocialComponent
            data={wizardData.step6}
            onChange={(updated) => updateStepData("step6", updated)}
          />
        )}

        {currentStep === 7 && (
          <Step7VerificationComponent
            data={wizardData.step7}
            onChange={(updated) => updateStepData("step7", updated)}
            brandContext={fullBrandContext}
            socialData={{ ...wizardData.step6 }}
          />
        )}

        {currentStep === 8 && (
          <Step8ReportComponent fullWizardData={wizardData} />
        )}

        {currentStep === 9 && (
          <Step9ReviewComponent
            fullWizardData={wizardData}
            onJumpToStep={(step) => handleJumpToStep(step)}
          />
        )}
      </div>

      {/* Required Verifications Checklist Banner on Final Review */}
      {currentStep >= 8 && (
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Actions Required Before Submission
            </h4>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
              Boolean((wizardData.step6 as any).email_verified) && (!Boolean(wizardData.step6.website && wizardData.step6.website.trim().length > 3) || Boolean(wizardData.step7.dns_txt_record || wizardData.step7.meta_tag))
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}>
              {Boolean((wizardData.step6 as any).email_verified) && (!Boolean(wizardData.step6.website && wizardData.step6.website.trim().length > 3) || Boolean(wizardData.step7.dns_txt_record || wizardData.step7.meta_tag))
                ? "Ready to Submit"
                : "Actions Pending"}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="flex items-center gap-2 font-semibold text-gray-800">
                {Boolean((wizardData.step6 as any).email_verified) ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                Verify Business Contact Email ({wizardData.step6.business_email || "Required"})
              </span>
              {!Boolean((wizardData.step6 as any).email_verified) && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(6)}
                  className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  Verify Email
                </button>
              )}
            </div>

            {Boolean(wizardData.step6.website && wizardData.step6.website.trim().length > 3) && (
              <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                <span className="flex items-center gap-2 font-semibold text-gray-800">
                  {Boolean(wizardData.step7.dns_txt_record || wizardData.step7.meta_tag) ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  Verify Website Ownership ({wizardData.step6.website})
                </span>
                {!Boolean(wizardData.step7.dns_txt_record || wizardData.step7.meta_tag) && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(7)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100"
                  >
                    Verify Domain
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Wizard Controls */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < 9 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentStepValidation.isValid}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitFinal}
            disabled={
              submitting ||
              !Boolean((wizardData.step6 as any).email_verified) ||
              (Boolean(wizardData.step6.website && wizardData.step6.website.trim().length > 3) &&
                !Boolean(wizardData.step7.dns_txt_record || wizardData.step7.meta_tag))
            }
            className="inline-flex items-center gap-2 px-8 py-3 text-base font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <CheckCircle2 className="w-5 h-5" />
            {submitting ? "Submitting Brand..." : "Complete & Submit Brand"}
          </button>
        )}
      </div>
    </div>
  );
}
