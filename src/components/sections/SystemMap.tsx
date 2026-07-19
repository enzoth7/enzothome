"use client";

import React from "react";

export default function SystemMap() {
  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30">
      <svg
        viewBox="0 0 1600 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Paths (Lines) */}
        <g stroke="white" strokeWidth="0.5" strokeOpacity="0.4">
          {/* Main node from button (at ~25% width, 50% height) */}
          {/* Coordinates: x=400, y=450 */}

          {/* Path 1: Workflows -> AI Agents */}
          <path d="M 400 450 Q 550 250 750 250 H 950 Q 1050 150 1120 150" strokeDasharray="4 4" />

          {/* Path 2: Automations -> Scalability */}
          <path d="M 400 450 Q 550 420 770 420 H 950 Q 1050 420 1120 420" strokeDasharray="4 4" />

          {/* Path 3: Data Analytics */}
          <path d="M 400 450 Q 550 620 759 620" strokeDasharray="4 4" />
        </g>

        {/* Nodes (Circles/Rectangles) */}
        <g fill="#0f172a" stroke="white" strokeOpacity="0.3" strokeWidth="0.5">
          {/* Top Nodes */}
          <rect x="666" y="230" width="168" height="40" rx="20" /> {/*WORKFLOWS*/}
          <rect x="1030" y="130" width="180" height="40" rx="20" /> {/*AI AGENTS*/}

          {/* Middle Nodes */}
          <rect x="666" y="400" width="168" height="40" rx="20" /> {/*AUTOMATIONS*/}
          <rect x="1030" y="400" width="180" height="40" rx="20" /> {/*SCALABILITY*/}

          {/* Bottom Nodes */}
          <rect x="666" y="600" width="168" height="40" rx="20" /> {/*DATA ANALYTICS*/}
        </g>

        {/* Node Text */}
        <g fill="white" fillOpacity="0.5" fontFamily="sans-serif" fontSize="12" fontWeight="300" letterSpacing="0.1em">
          <text x="750" y="255" textAnchor="middle">WORKFLOWS</text>
          <text x="1120" y="155" textAnchor="middle">AI AGENTS</text>

          <text x="750" y="425" textAnchor="middle">AUTOMATIONS</text>
          <text x="1120" y="425" textAnchor="middle">SCALABILITY</text>

          <text x="750" y="625" textAnchor="middle">DATA ANALYTICS</text>
        </g>

        {/* Moving lights (animations) */}
        <circle r="2" fill="white">
          <animateMotion
            dur="4s"
            repeatCount="indefinite"
            path="M 400 450 Q 550 250 750 250 H 950 Q 1050 150 1120 150"
          />
        </circle>
        <circle r="1.5" fill="white" fillOpacity="0.6">
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 400 450 Q 550 420 770 420 H 950 Q 1050 420 1120 420"
          />
        </circle>
      </svg>
    </div>
  );
}
