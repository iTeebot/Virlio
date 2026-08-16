"use client";

import React from "react";
import { GitBranch, Clock, Check, ArrowRight, CornerDownRight } from "lucide-react";

export interface VersionNode {
  id: string;
  version_number: number;
  parent_version_id?: string | null;
  image_url: string;
  edit_instruction?: string | null;
  created_at: string | Date;
  quality_score?: number | null;
}

interface VersionHistoryTreeProps {
  versions: VersionNode[];
  activeVersionId: string;
  onSelectVersion: (version: VersionNode) => void;
}

export function VersionHistoryTree({
  versions,
  activeVersionId,
  onSelectVersion,
}: VersionHistoryTreeProps) {
  if (versions.length <= 1) {
    return null;
  }

  // Sort versions by version number ascending
  const sorted = [...versions].sort((a, b) => a.version_number - b.version_number);

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800">
          <GitBranch className="w-3.5 h-3.5 text-blue-600" />
          <span>Revision Lineage Tree</span>
        </div>
        <span className="text-[10px] font-mono text-gray-500">
          {versions.length} versions generated
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
        {sorted.map((ver, idx) => {
          const isActive = ver.id === activeVersionId;
          const isInitial = ver.version_number === 1;

          return (
            <React.Fragment key={ver.id}>
              {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />}

              <button
                type="button"
                onClick={() => onSelectVersion(ver)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-left shrink-0 transition-all ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold"
                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  v{ver.version_number}
                </div>

                <div className="min-w-0">
                  <span className="block text-[11px] font-medium truncate max-w-[120px]">
                    {isInitial ? "Original Generation" : ver.edit_instruction || "Revision"}
                  </span>
                </div>

                {isActive && <Check className="w-3 h-3 text-white shrink-0 ml-1" />}
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
