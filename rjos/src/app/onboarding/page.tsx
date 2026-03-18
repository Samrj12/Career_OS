"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { GeneratedGraph } from "@/lib/ai/schemas/graph";
import { persistGeneratedGraph } from "@/actions/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [graphGenerated, setGraphGenerated] = useState(false);

  const [goal, setGoal] = useState("");
  const [timeline, setTimeline] = useState("");
  const [skills, setSkills] = useState("");
  const [availability, setAvailability] = useState("");
  const [style, setStyle] = useState("");

  const totalSteps = 5;

  async function handleGraphGenerated(graph: GeneratedGraph) {
    if (graphGenerated) return;
    setIsGeneratingGraph(true);
    setGraphGenerated(true);
    try {
      const result = await persistGeneratedGraph(graph);
      console.log(`Graph created: ${result.nodeCount} nodes, ${result.edgeCount} edges`);
      setTimeout(() => router.push("/graph"), 2000);
    } catch (err) {
      console.error("Failed to save graph:", err);
      setIsGeneratingGraph(false);
      setGraphGenerated(false);
    }
  }

  function handleFinalSubmit() {
    const mockGraph: GeneratedGraph = {
      nodes: [
        { tempId: "n1", type: "goal", title: goal || "Career Goal", importance: 10 },
        { tempId: "n2", type: "milestone", title: "First Milestone", importance: 8 },
        { tempId: "n3", type: "skill", title: "Core Skill", importance: 7 },
      ],
      edges: [
        { sourceTempId: "n1", targetTempId: "n2", type: "parent_child" },
        { sourceTempId: "n2", targetTempId: "n3", type: "parent_child" },
      ],
      habits: [
        { tempId: "h1", title: "Daily Practice", parentTempId: "n3", importance: 5 }
      ],
      summary: "Generated career graph based on onboarding inputs."
    };
    handleGraphGenerated(mockGraph);
  }

  // Generating State — animated route line + pin drops
  if (isGeneratingGraph || graphGenerated) {
    return (
      <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
        {/* Grayscale map at 6% opacity */}
        <img
          src="/assets/maps/maps (2).png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none grayscale"
        />
        <div className="w-full max-w-[600px] relative z-10">
          <div className="bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px] flex flex-col items-center justify-center min-h-[380px]">
            {/* Animated dashed route line being drawn */}
            <svg className="w-[200px] h-[40px] mb-6" viewBox="0 0 200 40">
              <path
                d="M 10 20 Q 50 5, 100 20 T 190 20"
                fill="none"
                stroke="var(--amber)"
                strokeWidth="2.5"
                strokeDasharray="8 6"
                className="animate-route-draw"
                style={{ strokeDashoffset: 200 }}
              />
            </svg>

            {/* Pushpins dropping in with bounce */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3].map((i) => (
                <img
                  key={i}
                  src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                  alt=""
                  className="w-[20px] h-[20px] animate-pin-drop"
                  style={{ animationDelay: `${i * 200}ms`, opacity: 0 }}
                />
              ))}
            </div>

            <h2 className="font-[family-name:var(--font-playfair)] text-[24px] text-[var(--ink)] mb-2">
              Building your career graph...
            </h2>
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)]">
              Mapping your goals, skills, and milestones
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex-1">
            <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-4">
              STEP 01 / CAREER GOAL
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-[26px] text-[var(--ink)]">
              What&apos;s your primary career goal?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] mt-[6px] mb-6">
              Be specific — this becomes the root of your career graph
            </p>
            <textarea
              className="w-full bg-transparent border-b-2 border-t-0 border-x-0 border-[var(--border)] rounded-none p-[12px] pl-0 font-[family-name:var(--font-inter)] text-[16px] text-[var(--ink)] outline-none focus:border-[var(--amber)] transition-colors resize-none"
              rows={4}
              placeholder="e.g. Land a backend engineering role at a top tech company by late 2026"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
        );
      case 2: {
        const options = [
          { value: "6 months", label: "6 months", sub: "Sprint" },
          { value: "1 year", label: "1 year", sub: "Standard" },
          { value: "18 months", label: "18 months", sub: "Steady" },
          { value: "2+ years", label: "2+ years", sub: "Long haul" },
        ];
        return (
          <div className="flex-1">
            <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-4">
              STEP 02 / TIMELINE
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-[26px] text-[var(--ink)]">
              When do you want to achieve this?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] mt-[6px] mb-6">
              This sets the pace of your entire roadmap
            </p>
            <div className="flex flex-row gap-4">
              {options.map((opt, i) => {
                const rotations = [-2, 1, -0.5, 1.5];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTimeline(opt.value)}
                    className={`flex-1 h-[72px] rounded-[2px] border-[1.5px] transition-all flex flex-col items-center justify-center ${
                      timeline === opt.value
                        ? "bg-[var(--amber-light)] border-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-pin)]"
                        : "bg-[var(--paper)] border-[var(--border)] hover:border-[var(--border-dark)]"
                    }`}
                    style={{ transform: `rotate(${rotations[i]}deg)` }}
                  >
                    <span className="font-[family-name:var(--font-inter)] text-[14px] font-bold">
                      {opt.label}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] mt-1">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
      case 3:
        return (
          <div className="flex-1">
            <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-4">
              STEP 03 / YOUR SKILLS
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-[26px] text-[var(--ink)]">
              What are you already good at?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] mt-[6px] mb-6">
              Skills you have now — helps calibrate where you start
            </p>
            <textarea
              className="w-full bg-transparent border-b-2 border-t-0 border-x-0 border-[var(--border)] rounded-none p-[12px] pl-0 font-[family-name:var(--font-inter)] text-[16px] text-[var(--ink)] outline-none focus:border-[var(--amber)] transition-colors resize-none"
              rows={4}
              placeholder="e.g. Python, basic algorithms, a few side projects..."
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>
        );
      case 4: {
        const options = [
          { value: "1–2 hrs", label: "1–2 hrs", sub: "Light" },
          { value: "2–4 hrs", label: "2–4 hrs", sub: "Moderate" },
          { value: "4–6 hrs", label: "4–6 hrs", sub: "Focused" },
          { value: "6+ hrs", label: "6+ hrs", sub: "Full-time" },
        ];
        return (
          <div className="flex-1">
            <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-4">
              STEP 04 / DAILY TIME
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-[26px] text-[var(--ink)]">
              How many hours per day can you commit?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] mt-[6px] mb-6">
              Be realistic — the AI plans around your actual availability
            </p>
            <div className="flex flex-row gap-4">
              {options.map((opt, i) => {
                const rotations = [-2, 1, -0.5, 1.5];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAvailability(opt.value)}
                    className={`flex-1 h-[72px] rounded-[2px] border-[1.5px] transition-all flex flex-col items-center justify-center ${
                      availability === opt.value
                        ? "bg-[var(--amber-light)] border-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-pin)]"
                        : "bg-[var(--paper)] border-[var(--border)] hover:border-[var(--border-dark)]"
                    }`}
                    style={{ transform: `rotate(${rotations[i]}deg)` }}
                  >
                    <span className="font-[family-name:var(--font-inter)] text-[14px] font-bold">
                      {opt.label}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] mt-1">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
      case 5: {
        const options = [
          { value: "Direct", label: "Direct", sub: "No fluff. Just the plan." },
          { value: "Balanced", label: "Balanced", sub: "Honest and encouraging" },
          { value: "Supportive", label: "Supportive", sub: "Warm and motivating" },
        ];
        return (
          <div className="flex-1">
            <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase text-[var(--ink-3)] tracking-[0.12em] mb-4">
              STEP 05 / COACHING STYLE
            </div>
            <h2 className="font-[family-name:var(--font-playfair)] text-[26px] text-[var(--ink)]">
              How should your AI coach talk to you?
            </h2>
            <p className="font-[family-name:var(--font-inter)] text-[14px] text-[var(--ink-2)] mt-[6px] mb-6">
              You can change this anytime
            </p>
            <div className="flex flex-row gap-4">
              {options.map((opt, i) => {
                const rotations = [-2, 1, -0.5];
                return (
                  <button
                    key={opt.value}
                    onClick={() => setStyle(opt.value)}
                    className={`flex-1 h-[72px] rounded-[2px] border-[1.5px] transition-all flex flex-col items-center justify-center px-2 ${
                      style === opt.value
                        ? "bg-[var(--amber-light)] border-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-pin)]"
                        : "bg-[var(--paper)] border-[var(--border)] hover:border-[var(--border-dark)]"
                    }`}
                    style={{ transform: `rotate(${rotations[i]}deg)` }}
                  >
                    <span className="font-[family-name:var(--font-inter)] text-[14px] font-bold">
                      {opt.label}
                    </span>
                    <span className="font-[family-name:var(--font-geist-mono)] text-[10px] text-[var(--ink-3)] mt-1 text-center leading-tight">
                      {opt.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden">
      {/* Grayscale map bg at 6% opacity with gradient fade */}
      <img
        src="/assets/maps/maps (2).png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-[0.06] pointer-events-none select-none grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg)]/60 via-transparent to-[var(--bg)]/80 pointer-events-none" />

      <div className="w-full max-w-[600px] flex flex-col relative z-10">
        {/* Step Indicator — pushpins on a horizontal dashed line */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative flex flex-row items-center gap-6 mb-2">
            {/* Dashed line connecting all steps */}
            <div className="absolute top-1/2 left-3 right-3 h-0 border-t-[2px] border-dashed border-[var(--border-dark)] -translate-y-1/2" />
            {Array.from({ length: totalSteps }).map((_, i) => {
              const isCurrent = i + 1 === currentStep;
              const isCompleted = i + 1 < currentStep;
              return (
                <div key={i} className="relative z-10 flex items-center justify-center">
                  {isCompleted ? (
                    <img
                      src="/assets/stationary_elements/8dV3aCqzCVySc1GF1CYVK0gQcQI.png"
                      alt=""
                      className="w-[16px] h-[16px]"
                    />
                  ) : isCurrent ? (
                    <img
                      src="/assets/stationary_elements/Effx968261ztSs30esQUEHvmIsM (1).png"
                      alt=""
                      className="w-[22px] h-[22px] animate-pin-drop"
                    />
                  ) : (
                    <div className="w-[12px] h-[12px] rounded-full border-2 border-[var(--border-dark)] bg-[var(--paper)]" />
                  )}
                </div>
              );
            })}
          </div>
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] text-[var(--ink-3)]">
            Step {currentStep} of 5
          </span>
        </div>

        {/* Card — paper sheet with corner fold and paper clip */}
        <div className="relative bg-[var(--paper)] border border-[var(--border)] rounded-[2px] shadow-[var(--shadow-card)] p-[20px] min-h-[380px] flex flex-col justify-between">
          {/* Corner fold via clip-path */}
          <div
            className="absolute top-0 right-0 w-[40px] h-[40px] bg-[var(--paper-alt)] border-l border-b border-[var(--border)]"
            style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          />

          {/* Paper clip at top-left */}
          <img
            src="/assets/stationary_elements/xSXenWs1UJkTy0XAXVlAQAAwlE.png"
            alt=""
            className="absolute -top-3 -left-2 w-[30px] h-auto pointer-events-none select-none z-10 rotate-[-5deg]"
          />

          {renderStepContent()}

          {/* Navigation Row */}
          <div className="flex flex-row justify-between items-center mt-8">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="bg-transparent text-[var(--ink)] border border-[var(--border-dark)] rounded-full px-5 py-2 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] hover:bg-[var(--paper-alt)] transition-colors"
              >
                &larr; Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep((prev) => Math.min(totalSteps, prev + 1))}
                className="bg-[var(--amber)] text-white rounded-full px-6 py-2 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] shadow-[3px_3px_0px_#92400E] hover:shadow-[2px_2px_0px_#92400E] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_#92400E] transition-all ml-auto"
              >
                Continue &rarr;
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="bg-[var(--amber)] text-white rounded-full px-6 py-2 font-[family-name:var(--font-geist-mono)] text-[12px] uppercase tracking-[0.08em] shadow-[3px_3px_0px_#92400E] hover:shadow-[2px_2px_0px_#92400E] active:translate-y-[1px] active:translate-x-[1px] active:shadow-[1px_1px_0px_#92400E] transition-all ml-auto"
              >
                Build My Career Graph &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
