"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { Users, UserPlus } from "lucide-react";

export default function BrandTeamPage() {
  const { currentBrand } = useBrand();
  const [membersData, setMembersData] = useState<any>({ members: [], invitations: [], userRole: "owner" });
  const [inviteInput, setInviteInput] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      if (!currentBrand) return;
      try {
        const res = await fetch(`/api/v1/brands/${currentBrand.id}/members`);
        if (res.ok) {
          const json = await res.json();
          setMembersData(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadMembers();
  }, [currentBrand]);

  if (!currentBrand) return null;

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    setInviteMessage(null);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: inviteInput.trim(), role: inviteRole }),
      });

      const json = await res.json();
      if (res.ok) {
        setInviteMessage("Invitation sent successfully!");
        setInviteInput("");
      } else {
        setInviteMessage(`Error: ${json.message}`);
      }
    } catch (err: any) {
      setInviteMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Team & Members
        </h1>

        <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-blue-600" /> Invite Team Member
          </h3>
          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="Enter email address or username..."
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="editor">Editor</option>
              <option value="content_creator">Content Creator</option>
              <option value="viewer">Viewer</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              Send Invite
            </button>
          </form>
          {inviteMessage && <p className="text-xs font-medium text-blue-700">{inviteMessage}</p>}
        </div>
      </div>
    </div>
  );
}
