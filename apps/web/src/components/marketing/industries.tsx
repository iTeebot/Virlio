import React from "react";
import { Utensils, Coffee, Briefcase, Code, User, Rocket, Scale, Stethoscope, Dumbbell, Hotel, ShoppingBag, Terminal } from "lucide-react";

export function IndustriesSection() {
  const industries = [
    { title: "Restaurants", benefit: "Boost local table bookings and takeout orders with relatable food culture content.", icon: Utensils },
    { title: "Coffee Shops", benefit: "Engage morning regulars and drive foot traffic with daily morning coffee memes.", icon: Coffee },
    { title: "Agencies", benefit: "Scale client social media campaigns without hiring dedicated meme creators.", icon: Briefcase },
    { title: "Developers", benefit: "Build developer brand affinity and hire top engineering talent with tech humor.", icon: Code },
    { title: "Creators", benefit: "Maintain consistent posting schedules and grow cross-platform follower engagement.", icon: User },
    { title: "Startups", benefit: "Stand out on LinkedIn and X with witty product launches and founder commentary.", icon: Rocket },
    { title: "Law Firms", benefit: "Humanize legal services and make complex regulations approachable to clients.", icon: Scale },
    { title: "Dentists", benefit: "Demystify dental checkups and build patient trust with friendly social humor.", icon: Stethoscope },
    { title: "Fitness Centers", benefit: "Motivate gym members and convert trial signups with workout humor.", icon: Dumbbell },
    { title: "Hotels", benefit: "Highlight vacation experiences and drive direct website room reservations.", icon: Hotel },
    { title: "Retail Brands", benefit: "Promote seasonal flash sales and product drops with viral shopping memes.", icon: ShoppingBag },
    { title: "Software Companies", benefit: "Drive SaaS product trials with relatable workflow and productivity memes.", icon: Terminal },
  ];

  return (
    <section className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Target Audience
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Built for Businesses & Professional Content Creators
          </p>
          <p className="mt-3 text-base text-gray-600">
            Tailored benefits engineered for every industry sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {industries.map((ind) => {
            const Icon = ind.icon;
            return (
              <div key={ind.title} className="virlio-card p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 border border-blue-100">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{ind.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{ind.benefit}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
