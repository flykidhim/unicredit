"use client";

import { useEffect } from "react";
import { LandingHero } from "@/components/LandingHero";
import { LoanCarouselSection } from "@/components/LoanCarouselSection";
import { AppointmentCTA } from "@/components/AppointmentCTA";
import { MyCareSection } from "@/components/MyCareSection";
import { DidYouKnowSection } from "@/components/DidYouKnowSection";
import { AppCTA } from "@/components/AppCTA";
import { HelpSection } from "@/components/HelpSection";

export default function HomePage() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(
      "[data-fade-section]"
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-6");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-0">
      {/* HERO – no scroll animation */}
      <LandingHero />

      {/* From here down, each section fades up on scroll */}
      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <LoanCarouselSection />
      </div>

      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <AppointmentCTA />
      </div>

      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <MyCareSection />
      </div>

      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <DidYouKnowSection />
      </div>

      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <AppCTA />
      </div>

      <div
        data-fade-section
        className="opacity-0 translate-y-6 transition-all duration-700 ease-out"
      >
        <HelpSection />
      </div>
    </div>
  );
}
