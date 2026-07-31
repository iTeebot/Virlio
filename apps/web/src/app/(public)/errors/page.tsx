"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ERROR_PAGES_CATALOG, ErrorPageConfig } from "@/components/errors/ErrorPagesCatalog";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { Sparkles, Layers, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";

export default function ErrorsShowcaseCatalogPage() {
  const [selectedKey, setSelectedKey] = useState<string>("notFound");

  const catalogKeys = Object.keys(ERROR_PAGES_CATALOG);
  const activeConfig = ERROR_PAGES_CATALOG[selectedKey];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Design System • 10 Error & Empty States</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight">
              Virlio Error & Empty State Catalog
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Interactive preview catalog displaying all 10 custom error illustrations and responsive layouts.
            </p>
          </div>

          {/* Catalog Selector Bar */}
          <div className="virlio-surface p-4 border border-gray-200 mb-8 overflow-x-auto">
            <div className="flex items-center gap-2 min-w-max pb-1">
              {catalogKeys.map((key) => {
                const item = ERROR_PAGES_CATALOG[key];
                const isActive = selectedKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                      isActive
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.httpStatus && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.httpStatus}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Error State Preview Box */}
          <div className="virlio-surface border border-gray-200 rounded-3xl overflow-hidden shadow-sm my-8">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <span className="font-semibold text-gray-900">
                Previewing State: <strong className="text-blue-600">{activeConfig.title}</strong>
              </span>
              <span className="font-mono text-gray-500">Asset: {activeConfig.imageSrc}</span>
            </div>

            <div className="py-12">
              <ErrorPageLayout
                imageSrc={activeConfig.imageSrc}
                imageAlt={activeConfig.imageAlt}
                title={activeConfig.title}
                description={activeConfig.description}
                httpStatus={activeConfig.httpStatus}
                statusBadgeText={activeConfig.statusBadgeText}
                primaryButtonText={activeConfig.primaryButtonText}
                primaryButtonHref={activeConfig.primaryButtonHref}
                secondaryButtonText={activeConfig.secondaryButtonText}
                secondaryButtonHref={activeConfig.secondaryButtonHref}
                primaryButtonIconName={activeConfig.primaryButtonIconName}
                secondaryButtonIconName={activeConfig.secondaryButtonIconName}
              />
            </div>
          </div>

          {/* 10 Error States Cards Grid */}
          <div className="my-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">All 10 Error & Empty States Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {catalogKeys.map((key) => {
                const item = ERROR_PAGES_CATALOG[key];
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedKey(key)}
                    className={`virlio-card p-4 cursor-pointer bg-white border flex flex-col justify-between transition-all ${
                      selectedKey === key ? "border-blue-600 ring-2 ring-blue-600/20" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="relative w-full aspect-square mb-3 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center p-2">
                        <Image
                          src={item.imageSrc}
                          alt={item.imageAlt}
                          fill
                          sizes="150px"
                          className="object-contain p-2"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-gray-900 leading-snug">{item.title}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-tight">{item.description}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 mt-3 flex items-center justify-between text-[10px] font-semibold text-blue-600">
                      <span>View Layout</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
