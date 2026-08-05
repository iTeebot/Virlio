"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  type Connection,
  type Edge,
  type Node,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import {
  Zap,
  Save,
  ArrowLeft,
  Play,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  Sparkles,
  FileText,
  CheckCircle2,
  Loader2,
  Share2,
  Camera,
  Globe,
  Settings,
  X,
  Layers,
  Bot,
  Sliders,
  HelpCircle,
  Clock,
  Plus,
} from "lucide-react";

// ==========================================
// CUSTOM REACT FLOW NODE COMPONENTS
// ==========================================

function TriggerNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-64 bg-white border-2 rounded-2xl shadow-md overflow-hidden select-none transition-all ${
        selected ? "border-blue-600 ring-4 ring-blue-500/20" : "border-gray-200"
      }`}
    >
      <div className="p-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-black uppercase tracking-wider">Trigger</span>
        </div>
        <span className="px-2 py-0.5 bg-blue-700 text-[9px] font-extrabold rounded uppercase">Active</span>
      </div>

      <div className="p-3.5 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-blue-600" /> {data.label || "Meme Published"}
        </h4>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          {data.description || "Fires automatically whenever a meme is published for this brand."}
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
}

function FacebookNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-64 bg-white border-2 rounded-2xl shadow-md overflow-hidden select-none transition-all ${
        selected ? "border-blue-600 ring-4 ring-blue-500/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white"
      />

      <div className="p-3 bg-blue-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500 text-[9px] font-extrabold rounded uppercase">Implemented</span>
      </div>

      <div className="p-3.5 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Share2 className="w-4 h-4 text-blue-600" /> Post to Facebook
        </h4>
        <div className="text-[10px] text-gray-500 space-y-1 bg-gray-50 p-2 rounded-xl border border-gray-100 font-mono">
          <div>Caption: {data.captionType || "Meme Description"}</div>
          <div>Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-blue-600 !border-2 !border-white"
      />
    </div>
  );
}

function CameraNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-64 bg-white border-2 rounded-2xl shadow-md overflow-hidden select-none transition-all ${
        selected ? "border-pink-600 ring-4 ring-pink-500/20" : "border-gray-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-pink-600 !border-2 !border-white"
      />

      <div className="p-3 bg-pink-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">Social Action</span>
        </div>
        <span className="px-2 py-0.5 bg-emerald-500 text-[9px] font-extrabold rounded uppercase">Implemented</span>
      </div>

      <div className="p-3.5 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-pink-600" /> Post to Instagram
        </h4>
        <div className="text-[10px] text-gray-500 space-y-1 bg-gray-50 p-2 rounded-xl border border-gray-100 font-mono">
          <div>Caption: {data.captionType || "Meme Description"}</div>
          <div>Tags: {data.tagsType || "Meme Tags"}</div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-pink-600 !border-2 !border-white"
      />
    </div>
  );
}

function ArticleNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-64 bg-white border-2 rounded-2xl shadow-md overflow-hidden select-none transition-all ${
        selected ? "border-amber-500 ring-4 ring-amber-500/20" : "border-amber-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-white"
      />

      <div className="p-3 bg-amber-500 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-black uppercase tracking-wider">AI Content</span>
        </div>
        <span className="px-2 py-0.5 bg-amber-700 text-[9px] font-extrabold rounded uppercase">Coming Soon</span>
      </div>

      <div className="p-3.5 space-y-2">
        <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-amber-600" /> Generate Article
        </h4>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Converts meme into full SEO blog article with headings & FAQ.
        </p>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3.5 !h-3.5 !bg-amber-500 !border-2 !border-white"
      />
    </div>
  );
}

function LockedActionNodeComponent({ data, selected }: any) {
  return (
    <div
      className={`w-64 bg-gray-50 border-2 border-dashed rounded-2xl shadow-xs overflow-hidden select-none opacity-80 transition-all ${
        selected ? "border-gray-500 ring-4 ring-gray-400/20" : "border-gray-300"
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3.5 !h-3.5 !bg-gray-400 !border-2 !border-white"
      />

      <div className="p-2.5 bg-gray-200 text-gray-700 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider">{data.category || "Action"}</span>
        <span className="px-2 py-0.5 bg-gray-300 text-gray-800 text-[9px] font-extrabold rounded flex items-center gap-1">
          <Lock className="w-2.5 h-2.5" /> Coming Soon
        </span>
      </div>

      <div className="p-3.5 space-y-1">
        <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-gray-400" /> {data.label}
        </h4>
        <p className="text-[10px] text-gray-400">Available in a future Virlio release.</p>
      </div>
    </div>
  );
}

// 30+ Social Action Node Definitions for left sidebar palette
const ALL_ACTION_NODES = [
  { id: "facebook", label: "Post to Facebook", implemented: true, category: "Social" },
  { id: "x", label: "Post to X (Twitter)", implemented: false, category: "Social" },
  { id: "linkedin", label: "Post to LinkedIn", implemented: false, category: "Social" },
  { id: "instagram", label: "Post to Instagram", implemented: true, category: "Social" },
  { id: "reddit", label: "Post to Reddit", implemented: false, category: "Social" },
  { id: "pinterest", label: "Post to Pinterest", implemented: false, category: "Social" },
  { id: "youtube", label: "Post to YouTube", implemented: false, category: "Social" },
  { id: "tiktok", label: "Post to TikTok", implemented: false, category: "Social" },
  { id: "medium", label: "Post to Medium", implemented: false, category: "Publishing" },
  { id: "devto", label: "Post to Dev.to", implemented: false, category: "Publishing" },
  { id: "producthunt", label: "Post to Product Hunt", implemented: false, category: "Publishing" },
  { id: "threads", label: "Post to Threads", implemented: false, category: "Social" },
  { id: "bluesky", label: "Post to Bluesky", implemented: false, category: "Social" },
  { id: "mastodon", label: "Post to Mastodon", implemented: false, category: "Social" },
  { id: "discord", label: "Post to Discord", implemented: false, category: "Messaging" },
  { id: "slack", label: "Post to Slack", implemented: false, category: "Messaging" },
  { id: "telegram", label: "Post to Telegram", implemented: false, category: "Messaging" },
  { id: "whatsapp", label: "Post to WhatsApp Channel", implemented: false, category: "Messaging" },
  { id: "googlebiz", label: "Post to Google Business Profile", implemented: false, category: "Business" },
  { id: "snapchat", label: "Post to Snapchat", implemented: false, category: "Social" },
  { id: "buffer", label: "Post to Buffer", implemented: false, category: "Integration" },
  { id: "hootsuite", label: "Post to Hootsuite", implemented: false, category: "Integration" },
  { id: "hubspot", label: "Post to HubSpot", implemented: false, category: "Integration" },
  { id: "wordpress", label: "Post to WordPress", implemented: false, category: "Publishing" },
  { id: "ghost", label: "Post to Ghost", implemented: false, category: "Publishing" },
  { id: "shopify", label: "Post to Shopify Blog", implemented: false, category: "Publishing" },
];

export default function AutomationEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { currentBrand } = useBrand();

  const brandId = params.id as string;
  const automationId = params.automationId as string;

  const [automation, setAutomation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectedPages, setConnectedPages] = useState<any[]>([]);

  // React Flow state
  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNodeComponent,
      facebookNode: FacebookNodeComponent,
      instagramNode: CameraNodeComponent,
      articleNode: ArticleNodeComponent,
      lockedNode: LockedActionNodeComponent,
    }),
    []
  );

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Load automation details & connected social accounts
  useEffect(() => {
    async function loadEditor() {
      if (!brandId || !automationId) return;
      try {
        setLoading(true);
        const [autoRes, socialRes] = await Promise.all([
          fetch(`/api/v1/brands/${brandId}/automations/${automationId}`),
          fetch(`/api/v1/brands/${brandId}/socials`),
        ]);

        if (autoRes.ok) {
          const json = await autoRes.json();
          setAutomation(json.data);
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
  }, [brandId, automationId]);

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
          name: automation.name,
          description: automation.description,
          is_enabled: automation.is_enabled,
          graphData,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        toast.success("Workflow graph saved to database!", "Version Recorded");
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
        position: { x: 450, y: 150 + nodes.length * 50 },
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
        position: { x: 450, y: 150 + nodes.length * 50 },
        data: {
          label: "Post to Instagram",
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
        position: { x: 450, y: 320 },
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
        position: { x: 450, y: 200 + nodes.length * 60 },
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
              <h1 className="text-sm font-bold text-gray-900 truncate max-w-xs">{automation?.name || "Automation Editor"}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  automation?.is_enabled ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-600"
                }`}
              >
                {automation?.is_enabled ? "Enabled" : "Draft"}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate max-w-md">{automation?.description || "React Flow Workflow Canvas"}</p>
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
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Graph</span>
          </button>
        </div>
      </div>

      {/* MAIN EDITOR AREA */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR - NODE PALETTE */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col justify-between overflow-y-auto scrollbar-none z-10 p-4 space-y-6">
          <div className="space-y-5">
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Triggers
              </h3>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Meme Published</span>
                    <span className="text-[10px] text-blue-700 block">Active Event</span>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold bg-blue-600 text-white px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-purple-600" /> Implemented Actions
              </h3>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("facebookNode")}
                  className="w-full p-3 bg-white border border-gray-200 hover:border-blue-500 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
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
                  className="w-full p-3 bg-white border border-gray-200 hover:border-pink-500 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold text-gray-900">Post to Instagram</span>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAddNodeToCanvas("articleNode")}
                  className="w-full p-3 bg-white border border-gray-200 hover:border-amber-500 rounded-2xl flex items-center justify-between text-left transition-colors cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Generate Article</span>
                      <span className="text-[9px] text-amber-700 block">SEO Content</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Soon</span>
                </button>
              </div>
            </div>

            {/* LOCKED NODES CATEGORY */}
            <div>
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" /> Locked Integrations
              </h3>

              <div className="space-y-2">
                {ALL_ACTION_NODES.filter((n) => !n.implemented).slice(0, 10).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddNodeToCanvas("lockedNode", item)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-left opacity-75 hover:opacity-100 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-semibold text-gray-700 truncate">{item.label}</span>
                    <span className="text-[9px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded shrink-0">Soon</span>
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
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
            <Controls className="!bg-white !border-gray-200 !rounded-2xl !shadow-md" />
            <MiniMap className="!bg-white !border-gray-200 !rounded-2xl !shadow-md" zoomable pannable />
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
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-400 hover:text-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {selectedNode.type === "triggerNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-blue-900 block">Trigger Output Preview</span>
                    <p className="text-[11px] text-blue-700 leading-relaxed">
                      This node provides runtime data payload to all downstream connected actions.
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-gray-700 font-mono bg-gray-50 p-3 rounded-2xl border border-gray-200">
                    <div>• payload.memeId</div>
                    <div>• payload.title</div>
                    <div>• payload.description</div>
                    <div>• payload.imageUrl</div>
                    <div>• payload.brandName</div>
                  </div>
                </div>
              )}

              {selectedNode.type === "facebookNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-blue-900 block">Facebook Publishing</span>
                      <span className="text-[10px] text-blue-700 block">Status: Centralized Account Shared</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Facebook Page</label>
                    {connectedPages.length > 0 ? (
                      <select
                        value={selectedNode.data?.pageId || connectedPages[0].page_id}
                        onChange={(e) => {
                          const val = e.target.value;
                          const selectedPage = connectedPages.find((p) => p.page_id === val);
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, pageId: val, pageName: selectedPage?.page_name } }
                                : n
                            )
                          );
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold"
                      >
                        {connectedPages.map((p) => (
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
                          <Plus className="w-3.5 h-3.5" />
                          <span>Connect Facebook</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Caption Content</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold">
                      <option>Use AI Description (Default)</option>
                      <option>Use AI Title + Description</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Image Asset</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold">
                      <option>Generated Branded Meme</option>
                    </select>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                      <span className="text-xs font-bold text-gray-800">Append Virlio Attribution</span>
                    </label>
                    <p className="text-[10px] text-gray-400 pl-5">
                      Adds &ldquo;Generated with Virlio https://virlio.iteebot.com&rdquo;
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "instagramNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-pink-50 border border-pink-100 rounded-2xl flex items-center gap-2">
                    <Camera className="w-5 h-5 text-pink-600" />
                    <div>
                      <span className="text-xs font-bold text-pink-900 block">Instagram Business Publishing</span>
                      <span className="text-[10px] text-pink-700 block">Status: Centralized Account Shared</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Target Instagram Business Account</label>
                    {connectedPages.filter((p) => p.platform === "instagram").length > 0 ? (
                      <select
                        value={
                          selectedNode.data?.pageId ||
                          connectedPages.find((p) => p.platform === "instagram")?.page_id
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          const selectedAcc = connectedPages.find((p) => p.page_id === val);
                          setNodes((nds) =>
                            nds.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, data: { ...n.data, pageId: val, pageName: selectedAcc?.page_name } }
                                : n
                            )
                          );
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold"
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
                        <p className="text-xs font-bold text-amber-900">No Camera Business account connected.</p>
                        <Link
                          href={`/dashboard/brands/${brandId}/socials`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg transition-colors shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Connect Instagram</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Caption Content</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold">
                      <option>Use AI Description + Hashtags (Default)</option>
                      <option>Use AI Title + Description + Hashtags</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Image Asset</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 font-bold">
                      <option>Generated Branded Meme</option>
                    </select>
                  </div>

                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-pink-600" />
                      <span className="text-xs font-bold text-gray-800">Append Virlio Attribution</span>
                    </label>
                    <p className="text-[10px] text-gray-400 pl-5">
                      Adds &ldquo;Posted with Virlio&rdquo; at end of caption.
                    </p>
                  </div>
                </div>
              )}

              {selectedNode.type === "articleNode" && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                    <span className="text-xs font-bold text-amber-900 block">AI Article Generation</span>
                    <p className="text-[11px] text-amber-800">Converts meme concept into full SEO blog article.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Article Length</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl font-bold">
                      <option>Short (400-600 words)</option>
                      <option>Medium (800-1200 words)</option>
                      <option>Long (1500+ words)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Article Tone</label>
                    <select className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl font-bold">
                      <option>Professional</option>
                      <option>Funny & Relatable</option>
                      <option>Educational</option>
                      <option>Technical</option>
                    </select>
                  </div>
                </div>
              )}

              {selectedNode.type === "lockedNode" && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-center">
                  <Lock className="w-6 h-6 text-gray-400 mx-auto" />
                  <h4 className="text-xs font-bold text-gray-900">{String(selectedNode.data?.label || "Action Node")}</h4>
                  <p className="text-[11px] text-gray-500">
                    This integration is coming soon in a future Virlio release.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
