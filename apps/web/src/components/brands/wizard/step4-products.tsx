"use client";

import React, { useState } from "react";
import { Step4ProductsServices } from "@/lib/validations/brand-wizard";
import { Package, Sparkles, Tag, Plus, X, Award, Globe, Download, CheckCircle2 } from "lucide-react";

interface Step4Props {
  data: Step4ProductsServices;
  onChange: (updated: Partial<Step4ProductsServices>) => void;
  brandContext: Record<string, any>;
  errors?: Record<string, string>;
}

const PRICE_RANGES = ["Budget / Affordable", "Mid-Range", "Premium / High-End", "Luxury", "Enterprise Tier"];

export function Step4ProductsComponent({ data, onChange, brandContext, errors = {} }: Step4Props) {
  const [productInput, setProductInput] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [uspInput, setUspInput] = useState("");
  const [competitorInput, setCompetitorInput] = useState("");
  const [storefrontUrlInput, setStorefrontUrlInput] = useState("");
  
  const [generatingUsps, setGeneratingUsps] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Primary Products with Comma Splitting (Max 50)
  const handleAddProductsWithCommaSplit = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const current = data.products || [];
    if (current.length >= 50) return;

    const newItems = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newItems.length > 0) {
      const updated = Array.from(new Set([...current, ...newItems])).slice(0, 50);
      onChange({ products: updated });
    }
    setProductInput("");
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      handleAddProductsWithCommaSplit(val);
    } else {
      setProductInput(val);
    }
  };

  const removeProduct = (item: string) => {
    onChange({ products: (data.products || []).filter((p) => p !== item) });
  };

  // 2. Crawl & Fetch Products from URL (Shopify / E-commerce store crawler)
  const handleFetchProductsFromUrl = async () => {
    if (!storefrontUrlInput.trim()) return;
    setFetchingProducts(true);
    setFetchMessage(null);

    try {
      const res = await fetch("/api/v1/brands/fetch-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: storefrontUrlInput.trim() }),
      });

      const json = await res.json();
      if (res.ok && json.data?.products && Array.isArray(json.data.products)) {
        const fetchedList = json.data.products;
        if (fetchedList.length > 0) {
          const current = data.products || [];
          const merged = Array.from(new Set([...current, ...fetchedList])).slice(0, 50);
          onChange({ products: merged });
          setFetchMessage({
            type: "success",
            text: json.message || `Successfully fetched ${fetchedList.length} products!`,
          });
        } else {
          setFetchMessage({
            type: "error",
            text: json.message || "No products found at URL. Try pasting comma-separated product names.",
          });
        }
      } else {
        setFetchMessage({
          type: "error",
          text: json.message || "Failed to fetch products from URL.",
        });
      }
    } catch (err: any) {
      setFetchMessage({ type: "error", text: err.message || "Network error fetching products." });
    } finally {
      setFetchingProducts(false);
    }
  };

  // 3. Primary Services with Comma Splitting (Max 10)
  const handleAddServicesWithCommaSplit = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const current = data.services || [];
    if (current.length >= 10) return;

    const newItems = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newItems.length > 0) {
      const updated = Array.from(new Set([...current, ...newItems])).slice(0, 10);
      onChange({ services: updated });
    }
    setServiceInput("");
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      handleAddServicesWithCommaSplit(val);
    } else {
      setServiceInput(val);
    }
  };

  const removeService = (item: string) => {
    onChange({ services: (data.services || []).filter((s) => s !== item) });
  };

  // 4. USPs with Comma Splitting (Max 25)
  const handleAddUspWithCommaSplit = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const current = data.usps || [];
    if (current.length >= 25) return;

    const newUsps = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newUsps.length > 0) {
      const updated = Array.from(new Set([...current, ...newUsps])).slice(0, 25);
      onChange({ usps: updated });
    }
    setUspInput("");
  };

  const handleUspInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      handleAddUspWithCommaSplit(val);
    } else {
      setUspInput(val);
    }
  };

  const removeUsp = (item: string) => {
    onChange({ usps: (data.usps || []).filter((u) => u !== item) });
  };

  const handleGenerateUspsWithAI = async () => {
    const current = data.usps || [];
    if (current.length >= 25) return;

    setGeneratingUsps(true);
    try {
      const res = await fetch("/api/v1/brands/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 4,
          field: "usps",
          currentValue: current.join(", "),
          brandContext,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.suggestion) {
        const rawUsps = json.data.suggestion;
        const newUsps = rawUsps
          .split(/[,;]/)
          .map((s: string) => s.replace(/^\d+\.\s*/, "").replace(/^(and|or|including|with)\s+/i, "").trim())
          .filter((s: string) => s.length >= 2 && s.length <= 40);

        if (newUsps.length > 0) {
          const updated = Array.from(new Set([...current, ...newUsps])).slice(0, 25);
          onChange({ usps: updated });
        }
      }
    } catch (err) {
      console.error("Failed to generate USPs with AI", err);
    } finally {
      setGeneratingUsps(false);
    }
  };

  // 5. Main Competitors with Comma Splitting (Max 10)
  const handleAddCompetitorsWithCommaSplit = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const current = data.competitors || [];
    if (current.length >= 10) return;

    const newItems = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newItems.length > 0) {
      const updated = Array.from(new Set([...current, ...newItems])).slice(0, 10);
      onChange({ competitors: updated });
    }
    setCompetitorInput("");
  };

  const handleCompetitorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      handleAddCompetitorsWithCommaSplit(val);
    } else {
      setCompetitorInput(val);
    }
  };

  const removeCompetitor = (item: string) => {
    onChange({ competitors: (data.competitors || []).filter((c) => c !== item) });
  };

  const currentProductCount = (data.products || []).length;
  const currentServiceCount = (data.services || []).length;
  const currentUspCount = (data.usps || []).length;
  const currentCompetitorCount = (data.competitors || []).length;

  const isMaxProducts = currentProductCount >= 50;
  const isMaxServices = currentServiceCount >= 10;
  const isMaxUsps = currentUspCount >= 25;
  const isMaxCompetitors = currentCompetitorCount >= 10;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Step 4: Offerings & Competitive Edge
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          List what you offer, fetch products automatically from your URL, and set your unique selling points.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Price Range Category
        </label>
        <select
          value={data.price_range}
          onChange={(e) => onChange({ price_range: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
        >
          {PRICE_RANGES.map((pr) => (
            <option key={pr} value={pr}>
              {pr}
            </option>
          ))}
        </select>
      </div>

      {/* Fetch Products from Storefront URL Component */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-blue-600" />
            Fetch Products from Storefront URL
          </label>
          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
            Experimental (Beta)
          </span>
        </div>

        <p className="text-[11px] text-gray-600">
          Crawls public Shopify storefront endpoints (e.g. <code className="bg-white px-1 py-0.5 rounded border border-gray-200 text-gray-800">/products.json</code>) and Schema.org metadata.
          <span className="text-gray-500 font-normal"> Note: Experimental feature — may not extract items on client-rendered React/Next SPA apps or protected stores.</span>
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={storefrontUrlInput}
            onChange={(e) => setStorefrontUrlInput(e.target.value)}
            placeholder="e.g. https://www.teezyon.com/products"
            className="flex-1 px-3.5 py-2.5 text-xs bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="button"
            onClick={handleFetchProductsFromUrl}
            disabled={fetchingProducts || !storefrontUrlInput.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Download className={`w-3.5 h-3.5 ${fetchingProducts ? "animate-spin" : ""}`} />
            {fetchingProducts ? "Crawling Products..." : "Fetch Products"}
          </button>
        </div>

        {fetchMessage && (
          <p className={`text-xs font-medium ${fetchMessage.type === "success" ? "text-emerald-700 font-semibold flex items-center gap-1" : "text-red-600"}`}>
            {fetchMessage.type === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            {fetchMessage.text}
          </p>
        )}
      </div>

      {/* Unique Selling Points (USPs) Chips Area with AI Tag Generator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-600" />
            Unique Selling Points (USPs) *
            <span className={`text-xs font-normal ${isMaxUsps ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
              ({currentUspCount} / 25 max)
            </span>
          </label>
          <button
            type="button"
            onClick={handleGenerateUspsWithAI}
            disabled={generatingUsps || isMaxUsps}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingUsps ? "animate-spin" : ""}`} />
            {generatingUsps ? "Generating USPs..." : isMaxUsps ? "Max USPs Reached" : "Generate USPs with AI"}
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={uspInput}
            onChange={handleUspInputChange}
            disabled={isMaxUsps}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUspWithCommaSplit(uspInput);
              }
            }}
            placeholder={isMaxUsps ? "Maximum 25 USPs reached" : "Type USP chips (comma separated, e.g. 24/7 Support, Eco-Friendly, Free Delivery) and press Enter"}
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => handleAddUspWithCommaSplit(uspInput)}
            disabled={isMaxUsps || !uspInput.trim()}
            className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(data.usps || []).map((usp) => (
            <span
              key={usp}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200"
            >
              {usp}
              <button type="button" onClick={() => removeUsp(usp)} className="text-emerald-600 hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Primary Products with Comma Splitting (Max 50) */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center justify-between">
            <span>Primary Products</span>
            <span className={`text-xs font-normal ${isMaxProducts ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
              ({currentProductCount} / 50 max)
            </span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={productInput}
              onChange={handleProductInputChange}
              disabled={isMaxProducts}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddProductsWithCommaSplit(productInput);
                }
              }}
              placeholder={isMaxProducts ? "Maximum 50 products reached" : "e.g. Mobile App, Espresso Coffee (comma separated)"}
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => handleAddProductsWithCommaSplit(productInput)}
              disabled={isMaxProducts || !productInput.trim()}
              className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(data.products || []).map((p) => (
              <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                {p}
                <button type="button" onClick={() => removeProduct(p)} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Primary Services with Comma Splitting (Max 10) */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center justify-between">
            <span>Primary Services</span>
            <span className={`text-xs font-normal ${isMaxServices ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
              ({currentServiceCount} / 10 max)
            </span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={serviceInput}
              onChange={handleServiceInputChange}
              disabled={isMaxServices}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddServicesWithCommaSplit(serviceInput);
                }
              }}
              placeholder={isMaxServices ? "Maximum 10 services reached" : "e.g. Branding Design, SEO Strategy (comma separated)"}
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100"
            />
            <button
              type="button"
              onClick={() => handleAddServicesWithCommaSplit(serviceInput)}
              disabled={isMaxServices || !serviceInput.trim()}
              className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(data.services || []).map((s) => (
              <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                {s}
                <button type="button" onClick={() => removeService(s)} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Competitors with Comma Splitting (Max 10) */}
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center justify-between">
          <span>Main Competitors</span>
          <span className={`text-xs font-normal ${isMaxCompetitors ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
            ({currentCompetitorCount} / 10 max)
          </span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={competitorInput}
            onChange={handleCompetitorInputChange}
            disabled={isMaxCompetitors}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCompetitorsWithCommaSplit(competitorInput);
              }
            }}
            placeholder={isMaxCompetitors ? "Maximum 10 competitors reached" : "e.g. Competitor Brand A, Competitor B (comma separated)"}
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100"
          />
          <button
            type="button"
            onClick={() => handleAddCompetitorsWithCommaSplit(competitorInput)}
            disabled={isMaxCompetitors || !competitorInput.trim()}
            className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(data.competitors || []).map((c) => (
            <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
              {c}
              <button type="button" onClick={() => removeCompetitor(c)} className="hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
