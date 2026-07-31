import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Layers, Eye } from "lucide-react";

interface OverviewRecentMemesProps {
  memes: Array<{
    id: string;
    top_text?: string | null;
    bottom_text?: string | null;
    image_url?: string | null;
    visibility?: string | null;
    created_at?: Date | string | null;
  }>;
}

export function OverviewRecentMemes({ memes }: OverviewRecentMemesProps) {
  if (!memes || memes.length === 0) {
    return (
      <div className="virlio-card p-6 bg-white border border-gray-200 rounded-2xl text-center">
        <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 text-blue-600">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          No generated memes yet
        </h3>
        <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
          Start generating viral brand memes using Virlio's AI Meme Generator and community templates.
        </p>
        <Link
          href="/dashboard/generator"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate First Meme</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="virlio-card p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Recent Content & Generated Memes
          </h2>
        </div>
        <Link
          href="/dashboard/templates"
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {memes.slice(0, 6).map((meme) => (
          <div
            key={meme.id}
            className="group relative rounded-xl border border-gray-200 bg-gray-50 p-3 hover:border-blue-300 transition-all"
          >
            <div className="relative aspect-video w-full rounded-lg bg-gray-200 overflow-hidden mb-2.5">
              {meme.image_url ? (
                <Image
                  src={meme.image_url}
                  alt={meme.top_text || "Generated Meme"}
                  fill
                  sizes="(max-width: 768px) 100vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <Sparkles className="w-6 h-6" />
                </div>
              )}

              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-gray-700 border border-gray-200">
                {meme.visibility || "Public"}
              </span>
            </div>

            <h4 className="text-xs font-semibold text-gray-900 truncate">
              {meme.top_text || meme.bottom_text || "Untitled Meme"}
            </h4>

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/80 text-[11px] text-gray-500">
              <span>{meme.created_at ? new Date(meme.created_at).toLocaleDateString() : "Recently"}</span>
              <Link
                href={`/dashboard/generator/${meme.id}`}
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
