import React from "react";
import Image from "next/image";
import Link from "next/link";
import { User, ShieldCheck, CheckCircle2, Award, ExternalLink } from "lucide-react";

interface OverviewAccountSummaryProps {
  user: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
    trust_score?: number | null;
    contributor_score?: number | null;
    account_status?: string | null;
  };
}

export function OverviewAccountSummary({ user }: OverviewAccountSummaryProps) {
  const name = user.name || "Virlio Creator";
  const username = user.username ? `@${user.username}` : user.email || "";
  const role = (user.role || "USER").toUpperCase();
  const trustScore = user.trust_score ?? 100;
  const profileHandle = user.username || "";

  return (
    <div className="virlio-card p-5 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-4">
      <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
          {user.image ? (
            <Image src={user.image} alt={name} fill unoptimized className="object-cover" />
          ) : (
            <User className="w-6 h-6 text-blue-600" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900 truncate">{name}</h3>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100 uppercase shrink-0">
              {role}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">{username}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-[11px]">Trust Score</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{trustScore} / 100</span>
        </div>

        <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-500 mb-1">
            <Award className="w-3.5 h-3.5 text-purple-600" />
            <span className="font-semibold text-[11px]">Contributor Score</span>
          </div>
          <span className="text-sm font-bold text-gray-900">{user.contributor_score || 0} pts</span>
        </div>
      </div>

      {profileHandle && (
        <Link
          href={`/profiles/${profileHandle}`}
          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-xs font-semibold text-blue-700 transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Your Public Profile</span>
        </Link>
      )}

      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>PostgreSQL Active</span>
        </span>
        <span className="capitalize font-semibold text-gray-700">
          Status: {user.account_status || "Active"}
        </span>
      </div>
    </div>
  );
}
