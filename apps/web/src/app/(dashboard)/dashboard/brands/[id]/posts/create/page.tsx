"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { BrandVisualSummary } from "@/components/brands/posts/brand-visual-summary";
import { ProductServicePicker } from "@/components/brands/posts/product-service-picker";
import { FourVariationGrid } from "@/components/brands/posts/four-variation-grid";
import { InteractiveImageEditor } from "@/components/brands/posts/interactive-image-editor";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Share2,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { BrandVisualProfile } from "@virlio/ai";

export default function CreateBrandPostPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;
  const { currentBrand } = useBrand();

  // Visual Profile & Settings State
  const [visualProfile, setVisualProfile] = useState<BrandVisualProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Form State
  const [sessionTitle, setSessionTitle] = useState("New Post Campaign");
  const [prompt, setPrompt] = useState("");
  const [campaignGoal, setCampaignGoal] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<"instagram_feed" | "linkedin" | "x" | "story">("instagram_feed");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("1:1");
  const [focusType, setFocusType] = useState<"product" | "service" | "general" | "campaign">("general");
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [selectedService, setSelectedService] = useState<string | undefined>();

  // Execution State
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result State
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<any | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<any | null>(null);
  const [variationVersions, setVariationVersions] = useState<any[]>([]);

  // 1. Fetch Brand Visual Profile
  useEffect(() => {
    async function loadBrandProfile() {
      if (!brandId) return;
      try {
        setLoadingProfile(true);
        const res = await fetch(`/api/v1/brands/${brandId}`);
        if (res.ok) {
          const json = await res.json();
          const brandData = json.data || json;
          const kbData = brandData.knowledge_base || {};
          const colors = kbData.identity?.colors || {
            primary: "#2563EB",
            secondary: "#1E40AF",
            accent: "#F59E0B",
            darkBackground: "#0F172A",
            lightBackground: "#F8FAFC",
          };

          const rawProducts = Array.isArray(kbData.products_services?.products)
            ? kbData.products_services.products
            : [];
          const rawServices = Array.isArray(kbData.products_services?.services)
            ? kbData.products_services.services
            : [];

          let detectedType: "product" | "service" | "hybrid" | "general" = "general";
          if (rawProducts.length > 0 && rawServices.length > 0) detectedType = "hybrid";
          else if (rawProducts.length > 0) detectedType = "product";
          else if (rawServices.length > 0) detectedType = "service";

          const profile: BrandVisualProfile = {
            brandId,
            brandName: brandData.name,
            industry: brandData.industry || "General",
            businessType: detectedType,
            colors: {
              primary: colors.primary || "#2563EB",
              secondary: colors.secondary || "#1E40AF",
              accent: colors.accent || "#F59E0B",
              darkBackground: colors.darkBackground || colors.dark_bg || "#0F172A",
              lightBackground: colors.lightBackground || colors.light_bg || "#F8FAFC",
              paletteUsageRule: "Use crisp solid colors with high contrast. NEVER use CSS gradients.",
            },
            typography: {
              fontFamily: kbData.identity?.typography?.fontFamily || "Inter",
              style: kbData.identity?.typography?.style || "Modern Sans",
            },
            logo: {
              url: brandData.logo_url || null,
              usageRule: "Place official brand logo in top-left with generous margin",
            },
            visualStyle: {
              stylePreset: kbData.identity?.brand_style || "Modern Minimalist",
              photographyStyle: "Studio lighting, clean solid backdrop, crisp shadows",
              compositionPreference: "Generous negative space, bold focal point",
              toneOfVoice: kbData.brand_voice?.tone || "Friendly & Informative",
              prohibitedStyles: ["gradients", "neon glow", "clutter"],
              prohibitedColors: [],
            },
            catalog: {
              hasProducts: rawProducts.length > 0,
              hasServices: rawServices.length > 0,
              products: rawProducts,
              services: rawServices,
              featuredOfferings: rawProducts.length > 0 ? rawProducts.slice(0, 3) : rawServices.slice(0, 3),
              usps: Array.isArray(kbData.products_services?.usps) ? kbData.products_services.usps : [],
              targetAudience: "Target Audience",
            },
          };

          setVisualProfile(profile);
          if (detectedType === "product") setFocusType("product");
          else if (detectedType === "service") setFocusType("service");
        }
      } catch (err) {
        console.error("Failed to load visual profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadBrandProfile();
  }, [brandId]);

  // 2. Fetch Version History when a variation is selected
  useEffect(() => {
    async function loadVersionHistory() {
      if (!selectedVariation?.id) return;
      try {
        const res = await fetch(`/api/v1/brands/${brandId}/posts/variations/${selectedVariation.id}/history`);
        if (res.ok) {
          const json = await res.json();
          setVariationVersions(json.data?.versions || []);
        }
      } catch (err) {
        console.error("Failed to load version history:", err);
      }
    }
    loadVersionHistory();
  }, [brandId, selectedVariation?.id]);

  // 3. Handle Generation Submit (Stage 1 + Stage 2)
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      setError(null);

      // Step 3a: Create Session
      const sessionRes = await fetch(`/api/v1/brands/${brandId}/posts/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: sessionTitle.trim() || "Brand Post Campaign",
          focus_type: focusType,
          selected_product: selectedProduct || null,
          selected_service: selectedService || null,
          target_platform: targetPlatform,
          aspect_ratio: aspectRatio,
        }),
      });

      const sessionJson = await sessionRes.json();
      if (!sessionRes.ok) {
        throw new Error(sessionJson.error || "Failed to initialize post session");
      }

      const sessionId = sessionJson.data.id;
      setActiveSessionId(sessionId);

      // Step 3b: Generate 4 Variations with Auto Image Synthesis
      const genRes = await fetch(`/api/v1/brands/${brandId}/posts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          user_prompt: prompt.trim(),
          campaign_goal: campaignGoal.trim() || null,
          target_platform: targetPlatform,
          aspect_ratio: aspectRatio,
          selected_product: selectedProduct || null,
          selected_service: selectedService || null,
          auto_synthesize_images: true,
        }),
      });

      const genJson = await genRes.json();
      if (!genRes.ok) {
        throw new Error(genJson.error || "Failed to generate post variations");
      }

      const rawVariations = genJson.data.variations || [];
      const variations = rawVariations.map((v: any) => {
        const synth = genJson.data.synthesizedImages?.find((s: any) => s.variationId === v.id);
        if (synth && !v.active_version) {
          return {
            ...v,
            active_version: {
              id: synth.versionId,
              version_number: synth.versionNumber,
              image_url: synth.imageUrl,
              thumbnail_url: synth.thumbnailUrl,
              aspect_ratio: aspectRatio,
            },
          };
        }
        return v;
      });

      const finalResult = { ...genJson.data, variations };
      setGenerationResult(finalResult);
      if (variations.length > 0) {
        setSelectedVariation(variations[0]);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation");
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Handle Edit Submitted from Interactive Editor
  const handleEditSubmitted = (newVersion: any) => {
    if (!selectedVariation) return;

    // Update active version in current variation
    const updatedVar = {
      ...selectedVariation,
      active_version: {
        id: newVersion.versionId,
        version_number: newVersion.versionNumber,
        image_url: newVersion.imageUrl,
        aspect_ratio: aspectRatio,
        edit_instruction: newVersion.editInstruction,
        created_at: new Date().toISOString(),
      },
    };

    setSelectedVariation(updatedVar);

    // Update inside variations list
    if (generationResult?.variations) {
      const updatedList = generationResult.variations.map((v: any) =>
        v.id === selectedVariation.id ? updatedVar : v
      );
      setGenerationResult({ ...generationResult, variations: updatedList });
    }

    // Refresh version list
    setVariationVersions((prev) => [
      ...prev,
      {
        id: newVersion.versionId,
        version_number: newVersion.versionNumber,
        image_url: newVersion.imageUrl,
        edit_instruction: newVersion.editInstruction,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  // 5. Handle Approval Toggle
  const handleApproveToggle = async (variationId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/v1/brands/${brandId}/posts/variations/${variationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: approved }),
      });

      if (res.ok) {
        if (selectedVariation?.id === variationId) {
          setSelectedVariation({ ...selectedVariation, is_approved: approved });
        }
        if (generationResult?.variations) {
          const updatedList = generationResult.variations.map((v: any) =>
            v.id === variationId ? { ...v, is_approved: approved } : v
          );
          setGenerationResult({ ...generationResult, variations: updatedList });
        }
      }
    } catch (err) {
      console.error("Failed to toggle approval:", err);
    }
  };

  if (loadingProfile) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-gray-500">Loading Brand Visual Profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/brands/${brandId}/posts`}
            className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition-all shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Brand Post Studio</h1>
            <p className="text-xs text-gray-500">
              Generate 4 distinct creative post concepts with multi-turn visual editing.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Visual Identity Summary */}
      {visualProfile && <BrandVisualSummary profile={visualProfile} />}

      {/* Main Workspace Grid: Controls + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Parameters & Prompt Setup */}
        <div className="lg:col-span-4 space-y-5">
          <div className="virlio-card bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                Campaign Setup
              </h2>
              <p className="text-[11px] text-gray-500">
                Configure your post focus, target platform, and creative goal.
              </p>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Campaign Title */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Campaign / Session Name (Optional)
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Q3 Summer Launch (or leave blank)"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Product / Service Picker */}
              {visualProfile && (
                <ProductServicePicker
                  profile={visualProfile}
                  focusType={focusType}
                  onFocusTypeChange={setFocusType}
                  selectedProduct={selectedProduct}
                  onSelectProduct={setSelectedProduct}
                  selectedService={selectedService}
                  onSelectService={setSelectedService}
                />
              )}

              {/* Platform & Aspect Ratio */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Platform
                  </label>
                  <select
                    value={targetPlatform}
                    onChange={(e: any) => setTargetPlatform(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="instagram_feed">Instagram Feed</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X / Twitter</option>
                    <option value="story">Stories (9:16)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Aspect Ratio
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e: any) => setAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="4:5">4:5 Portrait</option>
                    <option value="9:16">9:16 Story</option>
                    <option value="16:9">16:9 Landscape</option>
                  </select>
                </div>
              </div>

              {/* Creative Prompt */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Creative Direction / Theme (Optional)
                </label>
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Optional: Describe a specific theme, or leave blank to let Virlio auto-synthesize concepts from your verified brand profile..."
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              {/* Campaign Goal (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Campaign Goal (Optional)
                </label>
                <input
                  type="text"
                  value={campaignGoal}
                  onChange={(e) => setCampaignGoal(e.target.value)}
                  placeholder="e.g. Drive 25% flash sale signups"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Diverging 4 Creative Concepts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{prompt.trim() ? "Generate 4 Post Variations" : "Auto-Generate 4 Branded Posts (1-Click)"}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Area: 4 Variations Comparison & Interactive Studio */}
        <div className="lg:col-span-8 space-y-6">
          {generationResult?.variations ? (
            <>
              {/* 4 Variations Comparison Grid */}
              <FourVariationGrid
                variations={generationResult.variations}
                selectedVariationId={selectedVariation?.id}
                onSelectVariation={(v) => setSelectedVariation(v)}
                onApproveVariation={(id, approved) => handleApproveToggle(id, approved)}
                isSynthesizing={isGenerating}
              />

              {/* Interactive Version Studio for Selected Concept */}
              {selectedVariation && (
                <InteractiveImageEditor
                  brandId={brandId}
                  variation={selectedVariation}
                  versions={variationVersions}
                  onSelectVersion={(v) =>
                    setSelectedVariation({
                      ...selectedVariation,
                      active_version: {
                        id: v.id,
                        version_number: v.version_number,
                        image_url: v.image_url,
                        aspect_ratio: aspectRatio,
                        edit_instruction: v.edit_instruction,
                        created_at: v.created_at,
                      },
                    })
                  }
                  onApproveToggle={(approved) => handleApproveToggle(selectedVariation.id, approved)}
                  onEditSubmitted={handleEditSubmitted}
                />
              )}
            </>
          ) : (
            <div className="virlio-card bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-sm font-bold text-gray-900">
                  Ready to Generate 4 Distinct Concepts
                </h3>
                <p className="text-xs text-gray-500">
                  Enter your post direction on the left. Virlio will synthesize Product Hero, Lifestyle, Editorial, and Bold Social concepts sized for your brand.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
