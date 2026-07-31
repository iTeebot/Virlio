"use client";

import { useState, useRef, useEffect, ChangeEvent, DragEvent, KeyboardEvent, ClipboardEvent as ReactClipboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  Tag as TagIcon,
  Globe,
  FileText,
  Eye,
  Info,
  Check,
  Plus,
  X,
  Clipboard,
} from "lucide-react";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";
import { validateCategoryContent } from "@/lib/utils/explicit-content-filter";

interface AnalysisResult {
  template: {
    id: string;
    title: string;
    slug: string;
    category: string;
    subcategory: string;
    cloudinary_secure_url: string;
    quality_score: number;
    risk_score: number;
    duplicate_score: number;
    ocr_text?: string;
  };
  analysis: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    tags: string[];
    qualityScore: number;
    riskScore: number;
    duplicateScore: number;
    confidenceScore: number;
    ocrText: string;
    safetyClassification: string;
    moderationDecision: string;
    reasoning: string;
  };
  moderationStatus: string;
  processingStatus: string;
  isDuplicate: boolean;
  cloudinaryUrl: string;
  cloudinaryPath: string;
  contributorUsername: string;
}

interface CategoryOption {
  id: string;
  slug: string;
  name: string;
  isCustom?: boolean;
}

const COUNTRY_OPTIONS = [
  { code: "Global", name: "Global (Worldwide Usable)" },
  { code: "US", name: "United States (US)" },
  { code: "GB", name: "United Kingdom (UK)" },
  { code: "CA", name: "Canada (CA)" },
  { code: "AU", name: "Australia (AU)" },
  { code: "DE", name: "Germany (DE)" },
  { code: "FR", name: "France (FR)" },
  { code: "IN", name: "India (IN)" },
  { code: "JP", name: "Japan (JP)" },
  { code: "BR", name: "Brazil (BR)" },
  { code: "ES", name: "Spain (ES)" },
  { code: "IT", name: "Italy (IT)" },
  { code: "NL", name: "Netherlands (NL)" },
  { code: "AE", name: "United Arab Emirates (UAE)" },
  { code: "SG", name: "Singapore (SG)" },
  { code: "MX", name: "Mexico (MX)" },
  { code: "ZA", name: "South Africa (ZA)" },
  { code: "KR", name: "South Korea (KR)" },
  { code: "SE", name: "Sweden (SE)" },
  { code: "CH", name: "Switzerland (CH)" },
  { code: "NZ", name: "New Zealand (NZ)" },
  { code: "PH", name: "Philippines (PH)" },
  { code: "PK", name: "Pakistan (PK)" },
  { code: "NG", name: "Nigeria (NG)" },
  { code: "ID", name: "Indonesia (ID)" },
];

export default function TemplateUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Categories & Dynamic options
  const [categoriesList, setCategoriesList] = useState<CategoryOption[]>(
    PREDEFINED_CATEGORIES.map((c) => ({ id: c.id, slug: c.slug, name: c.name }))
  );
  const [selectedCategorySelect, setSelectedCategorySelect] = useState<string>("viral-trends");
  const [customCategoryInput, setCustomCategoryInput] = useState<string>("");
  const [categoryWarning, setCategoryWarning] = useState<string | null>(null);

  // Form hints & Defaults
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [country, setCountry] = useState("Global");
  const [language, setLanguage] = useState("any");

  // Tag Chips State
  const [tagsList, setTagsList] = useState<string[]>(["viral", "marketing", "trending"]);
  const [tagInputText, setTagInputText] = useState<string>("");

  const [originalSource, setOriginalSource] = useState("");
  const [license, setLicense] = useState("Standard Community License");

  // Workflow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const steps = [
    "Validating Binary Image & Safety Filters",
    "Uploading Asset",
    "Running AI Vision Analysis",
    "OCR & Safety Moderation",
    "Checking Duplicate Hashes",
    "Finalizing Database Record",
  ];

  useEffect(() => {
    fetch("/api/v1/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.categories) {
          setCategoriesList(json.data.categories);
        }
      })
      .catch(() => null);
  }, []);

  // Global Clipboard Ctrl+V / Cmd+V paste listener for images
  useEffect(() => {
    const handleClipboardPaste = (e: ClipboardEvent) => {
      // Ignore if focus is in a text input or textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }

      if (!e.clipboardData || !e.clipboardData.files || e.clipboardData.files.length === 0) {
        return;
      }
      const files = Array.from(e.clipboardData.files);
      const imageFile = files.find((f) => f.type.startsWith("image/"));
      if (imageFile) {
        e.preventDefault();
        handleFileSelect(imageFile);
      }
    };

    window.addEventListener("paste", handleClipboardPaste);
    return () => window.removeEventListener("paste", handleClipboardPaste);
  }, []);

  const handleCustomCategoryChange = (val: string) => {
    setCustomCategoryInput(val);
    setCategoryWarning(null);
    setError(null);

    if (val.trim()) {
      const check = validateCategoryContent(val);
      if (check.isExplicit) {
        setCategoryWarning("Explicit or adult words are strictly prohibited in global category names.");
      }
    }
  };

  // Process single or comma/newline separated tag input
  const processAndAddTags = (inputStr: string) => {
    if (!inputStr) return;
    const tokens = inputStr
      .split(/[,;\n]+/)
      .map((t) => t.trim().replace(/^#/, "").toLowerCase())
      .filter((t) => t.length > 0);

    if (tokens.length === 0) return;

    setTagsList((prev) => {
      const nextList = [...prev];
      for (const token of tokens) {
        if (!nextList.includes(token) && nextList.length < 25) {
          nextList.push(token);
        }
      }
      return nextList;
    });

    setTagInputText("");
  };

  const handleTagInputChange = (val: string) => {
    if (val.includes(",") || val.includes(";") || val.includes("\n")) {
      processAndAddTags(val);
    } else {
      setTagInputText(val);
    }
  };

  const handleTagPaste = (e: ReactClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData("text");
    if (pastedText && (pastedText.includes(",") || pastedText.includes(";") || pastedText.includes("\n"))) {
      e.preventDefault();
      e.stopPropagation();
      processAndAddTags(pastedText);
    }
  };

  const handleAddSingleTag = () => {
    if (tagInputText.trim()) {
      processAndAddTags(tagInputText);
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTagsList(tagsList.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddSingleTag();
    }
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Client-side image type check
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file format. Only JPEG, PNG, WEBP, and AVIF images are accepted.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds the 10MB limit.");
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setError(null);
    setResult(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError("Please select or paste an image file to upload.");
      return;
    }

    const activeCategory =
      selectedCategorySelect === "__custom__" ? customCategoryInput.trim() : selectedCategorySelect;

    if (!activeCategory) {
      setError("Please select or enter a category name.");
      return;
    }

    // Verify explicit content filters client-side
    const categoryCheck = validateCategoryContent(activeCategory);
    if (categoryCheck.isExplicit) {
      setError(categoryCheck.reason || "Category contains inappropriate or adult-restricted language.");
      return;
    }

    if (subcategory) {
      const subCheck = validateCategoryContent(subcategory);
      if (subCheck.isExplicit) {
        setError(subCheck.reason || "Subcategory contains inappropriate or adult-restricted language.");
        return;
      }
    }

    setError(null);
    setIsProcessing(true);
    setCurrentStep(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    formData.append("category", activeCategory);
    if (subcategory) formData.append("subcategory", subcategory);
    if (country) formData.append("country", country);
    if (language) formData.append("language", language);
    if (tagsList.length > 0) formData.append("tags", tagsList.join(","));
    if (originalSource) formData.append("originalSource", originalSource);
    if (license) formData.append("license", license);

    // Simulate stepper progress during server request
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    try {
      const res = await fetch("/api/v1/templates/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(stepInterval);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Upload failed");
      }

      setCurrentStep(steps.length - 1);
      setResult(json.data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "An error occurred during template analysis.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-2 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Upload Meme Template</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a viral meme format for AI moderation, brand categorization, and creator availability.
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Strict Content Moderation Active</span>
        </div>
      </div>

      {/* Main Upload Content */}
      {result ? (
        /* Final Result View */
        <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Analysis Complete
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Permanent attribution: Uploaded by <span className="font-semibold text-slate-900">@{result.contributorUsername}</span>
              </p>
            </div>

            <div>
              {result.processingStatus === "APPROVED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  APPROVED & PUBLIC
                </span>
              )}
              {result.processingStatus === "NEEDS_REVIEW" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  NEEDS REVIEW
                </span>
              )}
              {result.processingStatus === "DUPLICATE" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  <Copy className="w-4 h-4 text-purple-600" />
                  DUPLICATE DETECTED
                </span>
              )}
              {result.processingStatus === "REJECTED" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  REJECTED
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Preview & Cloudinary Path */}
            <div className="space-y-4">
              <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center p-3">
                <img
                  src={result.cloudinaryUrl}
                  alt={result.analysis.title}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg space-y-1">
                <span className="text-xs font-semibold text-slate-600 block">Cloudinary Storage Path:</span>
                <code className="text-xs text-slate-800 font-mono break-all">{result.cloudinaryPath}</code>
              </div> */}
            </div>

            {/* Extracted Metadata & Scores */}
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{result.analysis.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{result.analysis.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">Global Category</span>
                  <p className="text-sm font-semibold text-slate-900">{result.analysis.category}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">Subcategory</span>
                  <p className="text-sm font-semibold text-slate-900">{result.analysis.subcategory || "General"}</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">Quality Score</span>
                  <p className="text-sm font-bold text-blue-600">{result.analysis.qualityScore} / 100</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  <span className="text-xs text-slate-500">Safety Risk Score</span>
                  <p className="text-sm font-bold text-emerald-600">{result.analysis.riskScore} / 100</p>
                </div>
              </div>

              {/* Tags Chips Display */}
              {result.analysis.tags && result.analysis.tags.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-1.5">AI Index Tags:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.analysis.tags.map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* OCR Text */}
              {result.analysis.ocrText && (
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg">
                  <span className="text-xs font-semibold text-slate-600 block mb-1">OCR Extracted Text:</span>
                  <p className="text-xs text-slate-700 italic font-mono">"{result.analysis.ocrText}"</p>
                </div>
              )}

              {/* AI Reasoning Notice */}
              <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg text-xs text-blue-900 space-y-1">
                <span className="font-semibold block">AI Decision Notes:</span>
                <p>{result.analysis.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={clearFile}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium text-sm rounded-lg hover:bg-slate-100 transition"
            >
              Upload Another Template
            </button>

            <Link
              href="/dashboard/templates"
              className="w-full sm:w-auto px-5 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Go to Templates Workspace
            </Link>
          </div>
        </div>
      ) : (
        /* Upload Form View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Drag, Drop & Paste */}
          <div className="lg:col-span-1 space-y-4">
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[320px] relative ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : previewUrl
                  ? "border-slate-300 bg-white"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={onFileInputChange}
                className="hidden"
              />

              {previewUrl ? (
                <div className="space-y-4 w-full">
                  <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 p-2 flex items-center justify-center">
                    <img src={previewUrl} alt="Upload preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="text-xs text-slate-500">
                    <p className="font-semibold text-slate-800">{selectedFile?.name}</p>
                    <p>{(selectedFile?.size || 0) / 1024 < 1024 ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` : `${((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB`}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                  >
                    Remove or Choose Different Image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Click to upload, drag & drop</p>
                    <p className="text-xs font-medium text-blue-600 mt-1 flex items-center justify-center gap-1">
                      <Clipboard className="w-3.5 h-3.5" />
                      or press <kbd className="px-1.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded text-[11px]">Ctrl + V</kbd> to paste image
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1.5">JPEG, PNG, WEBP, or AVIF (max 10MB)</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-lg flex items-start gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Platform Policy Terms Note */}
            <div className="bg-slate-100 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Brand & Creator Guidelines</span>
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>Approved templates become publicly available to all Virlio brand marketers & creators.</li>
                <li>Your contributor account receives permanent attribution (<span className="font-mono">Uploaded by @username</span>).</li>
                <li>Custom categories become global options across Virlio after explicit content safety checks.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Hints Form & Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                Meme Format & Brand Attributes
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Meme Title (Optional Hint)</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Drake Disapproves / Approves (Brand Edition)"
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Selection or Custom Dynamic Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Category Selection</label>
                  <select
                    value={selectedCategorySelect}
                    onChange={(e) => setSelectedCategorySelect(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name} {cat.isCustom ? "(Community)" : ""}
                      </option>
                    ))}
                    <option value="__custom__">+ Create New Global Category</option>
                  </select>
                </div>
              </div>

              {/* Custom Category Input (If Selected) */}
              {selectedCategorySelect === "__custom__" && (
                <div className="bg-blue-50/60 border border-blue-200 p-3.5 rounded-lg space-y-2">
                  <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                    Enter New Global Category Name
                  </label>
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => handleCustomCategoryChange(e.target.value)}
                    placeholder="e.g. Creator Economy, Web3 Memes, AI Startups"
                    className="w-full text-xs p-2.5 border border-blue-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <p className="text-[11px] text-blue-700">
                    New categories are indexed globally across Virlio for all brands and creators. Adult terms are strictly filtered.
                  </p>
                  {categoryWarning && (
                    <div className="text-xs text-rose-700 font-semibold bg-rose-100 border border-rose-300 p-2 rounded flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{categoryWarning}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Subcategory</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. B2B Marketing, SaaS Ads, Product Hunt, Viral Reactions"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Interactive Tag Chips Component */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-blue-600" />
                    Interactive Tags (Chips)
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">{tagsList.length} tags</span>
                </label>

                {/* Chips Container */}
                <div className="p-2.5 border border-slate-300 rounded-lg bg-slate-50 flex flex-wrap items-center gap-2 min-h-[44px]">
                  {tagsList.map((t, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white shadow-sm"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="p-0.5 rounded-full hover:bg-blue-700 transition"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </span>
                  ))}

                  <input
                    type="text"
                    value={tagInputText}
                    onChange={(e) => handleTagInputChange(e.target.value)}
                    onPaste={handleTagPaste}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tagsList.length === 0 ? "Paste comma-separated tags or type and press Enter..." : "Add or paste tags..."}
                    className="flex-1 bg-transparent text-xs p-1 text-slate-900 focus:outline-none min-w-[160px]"
                  />

                  {tagInputText.trim() && (
                    <button
                      type="button"
                      onClick={handleAddSingleTag}
                      className="px-2.5 py-1 text-xs font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    >
                      + Add
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  Tip: Paste comma-separated tags (e.g. <span className="font-mono text-slate-700">future, technology, sci-fi...</span>) to instantly generate individual chips!
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Meme Description & Usage Context</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Explain how brands or creators use this template format (e.g. comparing old legacy software vs modern SaaS platform)..."
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Advanced Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {/* Country Dropdown Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Target Country Relevance</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {COUNTRY_OPTIONS.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Input defaulting to "any" */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Language</label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="any, en, es, fr..."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">License</label>
                  <input
                    type="text"
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
                  />
                </div>
              </div>

              {/* Submit CTA or Processing Stepper */}
              {isProcessing ? (
                <div className="border-t border-slate-200 pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    <span className="text-sm font-bold text-slate-900">
                      Processing Pipeline: {steps[currentStep]}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {steps.map((stepName, index) => {
                      const isDone = index < currentStep;
                      const isCurrent = index === currentStep;

                      return (
                        <div key={index} className="flex items-center gap-3 text-xs">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : isCurrent ? (
                            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                          <span className={isDone ? "text-emerald-700 font-semibold" : isCurrent ? "text-blue-700 font-bold" : "text-slate-400"}>
                            {stepName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!selectedFile || (selectedCategorySelect === "__custom__" && (!customCategoryInput.trim() || !!categoryWarning))}
                    className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition shadow-sm flex items-center gap-2 ${
                      selectedFile && (selectedCategorySelect !== "__custom__" || (customCategoryInput.trim() && !categoryWarning))
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-slate-300 cursor-not-allowed text-slate-500"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Analyze & Upload Template
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
