"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useBrand } from "@/components/dashboard/brand-context";
import { toast } from "@/components/ui/toast";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  ArrowLeft,
  Save,
  Play,
  Zap,
  Sparkles,
  Layers,
  FileText,
  Lock,
  Sliders,
  CheckCircle2,
  Loader2,
  Share2,
  Camera,
  Globe,
  Settings,
  X,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Settings2,
  HelpCircle,
  AlertCircle,
} from "lucide-react";

// ==========================================
// CUSTOM COMPACT REACT FLOW NODE COMPONENTS
// ==========================================

function TriggerNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
      }`}
    >
      <div className="px-2.5 py-1.5 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-[10px] font-black uppercase tracking-wider">Trigger</span>
        </div>
        <span className="px-1.5 py-0.2 bg-blue-700 text-[8px] font-extrabold rounded uppercase">Active</span>
      </div>

      <div className="p-2.5 space-y-1">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{data.label || "Meme Published"}</span>
        </h4>
        <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">
          {data.description || "Fires automatically whenever a meme is published."}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
}

function FacebookNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-blue-600 !border-2 !border-white"
      />

      <div className="px-2.5 py-1.5 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-1.5 py-0.2 bg-emerald-500 text-[8px] font-extrabold rounded uppercase">Live</span>
      </div>

      <div className="p-2.5 space-y-1.5">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">Post to Facebook</span>
        </h4>
        <div className="text-[9px] text-gray-500 space-y-0.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 font-mono">
          <div className="truncate">Caption: {data.captionType || "Meme Desc"}</div>
          <div className="truncate">Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
}

function CameraNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-pink-600 ring-2 ring-pink-500/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-pink-600 !border-2 !border-white"
      />

      <div className="px-2.5 py-1.5 bg-pink-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-1.5 py-0.2 bg-emerald-500 text-[8px] font-extrabold rounded uppercase">Live</span>
      </div>

      <div className="p-2.5 space-y-1.5">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <Camera className="w-3.5 h-3.5 text-pink-600 shrink-0" />
          <span className="truncate">Post to Instagram</span>
        </h4>
        <div className="text-[9px] text-gray-500 space-y-0.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 font-mono">
          <div className="truncate">Caption: {data.captionType || "Meme Desc"}</div>
          <div className="truncate">Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-pink-600 !border-2 !border-white"
      />
    </div>
  );
}

function ThreadsNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-slate-900 ring-2 ring-slate-800/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-slate-900 !border-2 !border-white"
      />

      <div className="px-2.5 py-1.5 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-1.5 py-0.2 bg-emerald-500 text-[8px] font-extrabold rounded uppercase">Live</span>
      </div>

      <div className="p-2.5 space-y-1.5">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <Globe className="w-3.5 h-3.5 text-slate-800 shrink-0" />
          <span className="truncate">Post to Threads</span>
        </h4>
        <div className="text-[9px] text-gray-500 space-y-0.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 font-mono">
          <div className="truncate">Caption: {data.captionType || "Meme Desc"}</div>
          <div className="truncate">Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-slate-900 !border-2 !border-white"
      />
    </div>
  );
}

function TikTokNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-black ring-2 ring-gray-900/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-black !border-2 !border-white"
      />

      <div className="px-2.5 py-1.5 bg-black text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span className="text-[10px] font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-1.5 py-0.2 bg-emerald-500 text-[8px] font-extrabold rounded uppercase">Live</span>
      </div>

      <div className="p-2.5 space-y-1.5">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <Share2 className="w-3.5 h-3.5 text-black shrink-0" />
          <span className="truncate">Post to TikTok</span>
        </h4>
        <div className="text-[9px] text-gray-500 space-y-0.5 bg-gray-50 p-1.5 rounded-lg border border-gray-100 font-mono">
          <div className="truncate">Caption: {data.captionType || "Meme Desc"}</div>
          <div className="truncate">Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-black !border-2 !border-white"
      />
    </div>
  );
}

function ArticleNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-white border-2 rounded-xl shadow-xs overflow-hidden select-none transition-all ${
        selected ? "border-amber-500 ring-2 ring-amber-500/20" : "border-amber-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white"
      />

      <div className="px-2.5 py-1.5 bg-amber-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-wider">AI Content</span>
        </div>
        <span className="px-1.5 py-0.2 bg-amber-700 text-[8px] font-extrabold rounded uppercase">Soon</span>
      </div>

      <div className="p-2.5 space-y-1">
        <h4 className="text-[11px] font-bold text-gray-900 flex items-center gap-1">
          <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="truncate">Generate Article</span>
        </h4>
        <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">
          Converts meme into full SEO blog article with headings.
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2.5 !h-2.5 !bg-amber-500 !border-2 !border-white"
      />
    </div>
  );
}

function LockedActionNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-52 bg-gray-50 border-2 border-dashed rounded-xl shadow-xs overflow-hidden select-none opacity-80 transition-all ${
        selected ? "border-gray-500 ring-2 ring-gray-400/20" : "border-gray-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2.5 !h-2.5 !bg-gray-400 !border-2 !border-white"
      />

      <div className="px-2.5 py-1 bg-gray-200 text-gray-700 flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-wider truncate">{data.category || "Action"}</span>
        <span className="px-1 py-0.2 bg-gray-300 text-gray-800 text-[8px] font-extrabold rounded flex items-center gap-0.5">
          <Lock className="w-2 h-2" /> Soon
        </span>
      </div>

      <div className="p-2.5 space-y-0.5">
        <h4 className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
          <Lock className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="truncate">{data.label}</span>
        </h4>
        <p className="text-[9px] text-gray-400 truncate">Available in future Virlio release.</p>
      </div>
    </div>
  );
}

const ALL_ACTION_NODES = [
  { id: "facebook", label: "Post to Facebook", implemented: true, category: "Social" },
  { id: "instagram", label: "Post to Instagram", implemented: true, category: "Social" },
  { id: "threads", label: "Post to Threads", implemented: true, category: "Social" },
  { id: "tiktok", label: "Post to TikTok", implemented: true, category: "Social" },
  { id: "x", label: "Post to X (Twitter)", implemented: false, category: "Social" },
  { id: "linkedin", label: "Post to LinkedIn", implemented: false, category: "Social" },
  { id: "reddit", label: "Post to Reddit", implemented: false, category: "Social" },
  { id: "pinterest", label: "Post to Pinterest", implemented: false, category: "Social" },
  { id: "youtube", label: "Post to YouTube", implemented: false, category: "Social" },
  { id: "medium", label: "Publish Medium Article", implemented: false, category: "Publishing" },
  { id: "devto", label: "Publish Dev.to Post", implemented: false, category: "Publishing" },
];

export default function BrandAutomationCanvasPage() {
  const params = useParams();
  const brandId = params.id as string;
  const automationId = params.automationId as string;
  const { currentBrand } = useBrand();

  const [automation, setAutomation] = useState<any>(null);
  const [automationName, setAutomationName] = useState("");
  const [automationDescription, setAutomationDescription] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectedPages, setConnectedPages] = useState<any[]>([]);

  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNodeComponent,
      facebookNode: FacebookNodeComponent,
      instagramNode: CameraNodeComponent,
      threadsNode: ThreadsNodeComponent,
      tiktokNode: TikTokNodeComponent,
      articleNode: ArticleNodeComponent,
      lockedNode: LockedActionNodeComponent,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Delete node helper function
  const handleDeleteSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === "triggerNode") return;

    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    toast.success(`Removed node "${selectedNode.data?.label || selectedNode.type}"`, "Workflow Editor");
    setSelectedNode(null);
  }, [selectedNode, setNodes, setEdges]);

  // Global Keydown Listener for Linux/Windows Delete & Backspace keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedNode &&
        selectedNode.type !== "triggerNode" &&
        !(
          document.activeElement instanceof HTMLInputElement ||
          document.activeElement instanceof HTMLTextAreaElement ||
          document.activeElement instanceof HTMLSelectElement
        )
      ) {
        handleDeleteSelectedNode();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, handleDeleteSelectedNode]);

  // Load automation details & connected social accounts
  useEffect(() => {
    async function loadEditor() {
      if (!brandId || !automationId) return;
      setLoading(true);
      try {
        const [autoRes, socialRes] = await Promise.all([
          fetch(`/api/v1/brands/${brandId}/automations/${automationId}`),
          fetch(`/api/v1/brands/${brandId}/socials`),
        ]);

        if (autoRes.ok) {
          const json = await autoRes.json();
          setAutomation(json.data);
          setAutomationName(json.data.name || "");
          setAutomationDescription(json.data.description || "");
          if (json.data.graphData) {
            setNodes(json.data.graphData.nodes || []);
            setEdges(json.data.graphData.edges || []);
          }
        }

        if (socialRes.ok) {
          const socialJson = await socialRes.json();
          setConnectedPages(socialJson.data || []);
        }
      } catch (err) {
        console.error("Failed to load automation graph:", err);
      } finally {
        setLoading(false);
      }
    }

    loadEditor();
  }, [brandId, automationId, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#2563eb", strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSaveGraph = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const graphData = {
        nodes,
        edges,
        viewport: { x: 0, y: 0, zoom: 1 },
      };

      const res = await fetch(`/api/v1/brands/${brandId}/automations/${automationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: automationName || automation?.name,
          description: automationDescription || automation?.description,
          is_enabled: automation?.is_enabled,
          graphData,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setAutomation(json.data);
        }
        setSaveSuccess(true);
        toast.success("Workflow name and graph saved!", "Saved");
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        toast.error("Failed to save workflow graph.", "Error");
      }
    } catch {
      toast.error("Network error saving workflow graph.", "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddNodeToCanvas = (type: string, item?: any) => {
    const newNodeId = `node-${type}-${Date.now().toString().slice(-4)}`;
    let newNode: Node;

    if (type === "facebookNode") {
      newNode = {
        id: newNodeId,
        type: "facebookNode",
        position: { x: 400, y: 150 + nodes.length * 40 },
        data: {
          label: "Post to Facebook",
          captionType: "use_meme_description",
          tagsType: "use_meme_tags",
          imageType: "generated_meme",
          visibility: "public",
        },
      };
    } else if (type === "instagramNode") {
      newNode = {
        id: newNodeId,
        type: "instagramNode",
        position: { x: 400, y: 150 + nodes.length * 40 },
        data: {
          label: "Post to Instagram",
          captionType: "use_meme_description",
          tagsType: "use_meme_tags",
          imageType: "generated_meme",
          visibility: "public",
        },
      };
    } else if (type === "threadsNode") {
      newNode = {
        id: newNodeId,
        type: "threadsNode",
        position: { x: 400, y: 150 + nodes.length * 40 },
        data: {
          label: "Post to Threads",
          captionType: "use_meme_description",
          tagsType: "use_meme_tags",
          imageType: "generated_meme",
          visibility: "public",
        },
      };
    } else if (type === "tiktokNode") {
      newNode = {
        id: newNodeId,
        type: "tiktokNode",
        position: { x: 400, y: 150 + nodes.length * 40 },
        data: {
          label: "Post to TikTok",
          captionType: "use_meme_description",
          tagsType: "use_meme_tags",
          imageType: "generated_meme",
          visibility: "public",
        },
      };
    } else if (type === "articleNode") {
      newNode = {
        id: newNodeId,
        type: "articleNode",
        position: { x: 400, y: 300 },
        data: {
          label: "Generate Article",
          length: "Medium",
          tone: "Professional",
          seoKeyword: "Viral Meme Marketing",
        },
      };
    } else {
      newNode = {
        id: newNodeId,
        type: "lockedNode",
        position: { x: 400, y: 200 + nodes.length * 40 },
        data: {
          label: item?.label || "Locked Node",
          category: item?.category || "Action",
        },
      };
    }

    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
    toast.success(`Added ${newNode.data.label} to canvas`, "Workflow Editor");
  };

  if (!currentBrand) return null;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-gray-50 text-gray-900 select-none overflow-hidden -m-6">
      {/* TOP TOOLBAR */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 shadow-2xs z-20">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/brands/${brandId}/automations`}
            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <input
                  type="text"
                  value={automationName}
                  onChange={(e) => setAutomationName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setIsEditingName(false);
                  }}
                  autoFocus
                  className="px-2 py-0.5 bg-gray-50 border border-blue-500 rounded-lg text-sm font-bold text-gray-900 focus:outline-hidden"
                />
              ) : (
                <div
                  className="flex items-center gap-1.5 group cursor-pointer"
                  onClick={() => setIsEditingName(true)}
                  title="Click to rename workflow"
                >
                  <h1 className="text-sm font-bold text-gray-900 truncate max-w-xs group-hover:text-blue-600 transition-colors">
                    {automationName || automation?.name || "Automation Editor"}
                  </h1>
                  <Pencil className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors opacity-80" />
                </div>
              )}

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  automation?.is_enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600"
                }`}
              >
                {automation?.is_enabled ? "Enabled" : "Draft"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-md">{automationDescription || automation?.description || "React Flow Workflow Canvas"}</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </span>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveGraph}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Workflow</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT NODE PALETTE SIDEBAR */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col justify-between p-4 z-20 shadow-xs overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-600" /> Action Library
              </h3>
              <p className="text-[11px] text-gray-500 mb-4">Click any node to add it to your workflow canvas.</p>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("facebookNode")}
                  className="w-full p-2.5 bg-white border border-gray-200 hover:border-blue-500 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-gray-900">Post to Facebook</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("instagramNode")}
                  className="w-full p-2.5 bg-white border border-gray-200 hover:border-pink-500 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold text-gray-900">Post to Instagram</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("threadsNode")}
                  className="w-full p-2.5 bg-white border border-gray-200 hover:border-slate-800 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-800" />
                    <span className="text-xs font-bold text-gray-900">Post to Threads</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("tiktokNode")}
                  className="w-full p-2.5 bg-white border border-gray-200 hover:border-black rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-black" />
                    <span className="text-xs font-bold text-gray-900">Post to TikTok</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("articleNode")}
                  className="w-full p-2.5 bg-white border border-gray-200 hover:border-amber-500 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-gray-900">Generate Article</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" /> Locked Integrations
              </h3>

              <div className="space-y-2">
                {ALL_ACTION_NODES.filter((n) => !n.implemented).slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddNodeToCanvas("lockedNode", item)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-left opacity-75 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <span className="text-[11px] font-semibold text-gray-700 truncate">{item.label}</span>
                    <span className="text-[9px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.2 rounded shrink-0">Soon</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* REACT FLOW CANVAS */}
        <div className="flex-1 h-full relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            deleteKeyCode={["Delete", "Backspace"]}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            <Controls className="!bg-white !border-gray-200 !rounded-xl !shadow-md" />
            <MiniMap className="!bg-white !border-gray-200 !rounded-xl !shadow-md" zoomable pannable />
          </ReactFlow>
        </div>

        {/* RIGHT PROPERTIES PANEL */}
        {selectedNode && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col justify-between p-5 z-20 shadow-xl overflow-y-auto">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  Node Configuration
                </h3>

                <div className="flex items-center gap-1.5">
                  {selectedNode.type !== "triggerNode" && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedNode}
                      className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1 text-[11px] font-bold cursor-pointer transition-colors"
                      title="Delete Node (Delete / Backspace)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="p-1 text-gray-400 hover:text-gray-900"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedNode.type === "triggerNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-blue-900 block">Trigger Output Preview</span>
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      Emits `meme_id`, `brand_id`, `caption`, `hashtags`, and `image_url` to downstream actions.
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "facebookNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-blue-900 block">Facebook Page Publishing</span>
                      <span className="text-[10px] text-blue-700 block">Status: Connected</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Facebook Page</label>
                    {connectedPages.filter((p) => p.platform === "facebook").length > 0 ? (
                      <select
                        value={
                          connectedPages.find((p) => p.platform === "facebook")?.page_id || ""
                        }
                        onChange={() => {}}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900"
                      >
                        {connectedPages
                          .filter((p) => p.platform === "facebook")
                          .map((p) => (
                            <option key={p.id} value={p.page_id}>
                              {p.page_name} (ID: {p.page_id})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                        <p className="text-xs font-bold text-amber-900">No Facebook Page connected.</p>
                        <Link
                          href={`/dashboard/brands/${brandId}/socials`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Connect Page
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === "instagramNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-pink-50 border border-pink-100 rounded-2xl flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-pink-900 block">Instagram Business Publishing</span>
                      <span className="text-[10px] text-pink-700 block">Status: Connected</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Instagram Account</label>
                    {connectedPages.filter((p) => p.platform === "instagram").length > 0 ? (
                      <select
                        value={
                          connectedPages.find((p) => p.platform === "instagram")?.page_id || ""
                        }
                        onChange={() => {}}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900"
                      >
                        {connectedPages
                          .filter((p) => p.platform === "instagram")
                          .map((p) => (
                            <option key={p.id} value={p.page_id}>
                              {p.page_name} (ID: {p.page_id})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                        <p className="text-xs font-bold text-amber-900">No Instagram Business account connected.</p>
                        <Link
                          href={`/dashboard/brands/${brandId}/socials`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Connect Instagram
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === "threadsNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded-2xl flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-800 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Threads Profile Publishing</span>
                      <span className="text-[10px] text-slate-700 block">Status: Connected</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Threads Profile</label>
                    {connectedPages.filter((p) => p.platform === "threads").length > 0 ? (
                      <select
                        value={
                          connectedPages.find((p) => p.platform === "threads")?.page_id || ""
                        }
                        onChange={() => {}}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900"
                      >
                        {connectedPages
                          .filter((p) => p.platform === "threads")
                          .map((p) => (
                            <option key={p.id} value={p.page_id}>
                              {p.page_name} (ID: {p.page_id})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                        <p className="text-xs font-bold text-amber-900">No Threads account connected.</p>
                        <Link
                          href={`/dashboard/brands/${brandId}/socials`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Connect Threads
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedNode.type === "tiktokNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-black shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">TikTok Direct Publishing</span>
                      <span className="text-[10px] text-gray-700 block">Status: Connected</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target TikTok Account</label>
                    {connectedPages.filter((p) => p.platform === "tiktok").length > 0 ? (
                      <select
                        value={
                          connectedPages.find((p) => p.platform === "tiktok")?.page_id || ""
                        }
                        onChange={() => {}}
                        className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900"
                      >
                        {connectedPages
                          .filter((p) => p.platform === "tiktok")
                          .map((p) => (
                            <option key={p.id} value={p.page_id}>
                              {p.page_name} (ID: {p.page_id})
                            </option>
                          ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-center">
                        <p className="text-xs font-bold text-amber-900">No TikTok account connected.</p>
                        <Link
                          href={`/dashboard/brands/${brandId}/socials`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-gray-900 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" /> Connect TikTok
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-[10px] text-gray-400 block font-mono">Node ID: {selectedNode.id}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
