import React from "react";
import { CheckCircle2, Globe, Search, Bot, Calendar, Star, Mail, MapPin, ShoppingCart } from "lucide-react";

export function DigitalGrowthSection() {
  const recommendations = [
    { title: "Website Optimization", desc: "Detects mobile responsiveness gaps, slow load times, and missing call-to-actions.", icon: Globe },
    { title: "SEO Health Audit", desc: "Identifies missing meta descriptions, structured schema data, and local search visibility.", icon: Search },
    { title: "Workflow Automation", desc: "Recommends automated customer inquiry replies and lead capture funnels.", icon: Bot },
    { title: "Online Ordering Setup", desc: "Suggests commission-free direct ordering links for restaurants and retail shops.", icon: ShoppingCart },
    { title: "Booking & Reservations", desc: "Evaluates direct calendar booking integrations for dental, legal, and salon services.", icon: Calendar },
    { title: "Google Business Profile", desc: "Checks address accuracy, opening hours, photo updates, and category alignment.", icon: MapPin },
    { title: "Review Automation", desc: "Provides automated post-service review request flows to boost 5-star ratings.", icon: Star },
    { title: "Email Marketing Sequences", desc: "Recommends automated welcome emails, newsletter signups, and customer win-backs.", icon: Mail },
  ];

  return (
    <section className="py-20 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Holistic Digital Ecosystem
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Virlio Does More Than Generate Memes
          </p>
          <p className="mt-3 text-base text-gray-600">
            Upon brand verification, Virlio performs a complimentary digital presence audit to surface actionable growth opportunities for your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((rec) => {
            const Icon = rec.icon;
            return (
              <div key={rec.title} className="virlio-card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{rec.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
