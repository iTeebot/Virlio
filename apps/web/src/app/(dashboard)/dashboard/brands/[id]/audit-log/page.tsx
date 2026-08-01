"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { FileText } from "lucide-react";

export default function BrandAuditLogPage() {
  const { currentBrand } = useBrand();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function loadAuditLogs() {
      if (!currentBrand) return;
      try {
        const res = await fetch(`/api/v1/brands/${currentBrand.id}/members`);
        if (res.ok) {
          const json = await res.json();
          setLogs(json.data?.auditLogs || []);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadAuditLogs();
  }, [currentBrand]);

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Security & Audit Log
        </h1>
        <p className="text-xs text-gray-500">
          Internal audit log tracking administrative security actions and verification runs.
        </p>

        {logs.length > 0 ? (
          <div className="space-y-2 pt-2">
            {logs.map((log, idx) => (
              <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-gray-800">{log.action || "BRAND_AUDIT_EVENT"}</span>
                <span className="text-gray-400 font-mono text-[10px]">{new Date(log.created_at || Date.now()).toLocaleString()}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl">
            No security audit entries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
