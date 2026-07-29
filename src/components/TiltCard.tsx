"use client";

import React, { useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  HTMLMotionProps,
} from "framer-motion";

interface TiltCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  showGlare?: boolean;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 22,
  showGlare = false,
  onMouseMove,
  onMouseLeave,
  style,
  ...props
}: TiltCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [{ mouseX, mouseY }, setMousePos] = useState({ mouseX: 0.5, mouseY: 0.5 });

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const xPct = useTransform(x, [0, 1], [-0.5, 0.5]);
  const yPct = useTransform(y, [0, 1], [-0.5, 0.5]);

  const springConfig = { stiffness: 900, damping: 40 };
  const xSpring = useSpring(xPct, springConfig);
  const ySpring = useSpring(yPct, springConfig);

  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [maxTilt, -maxTilt]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height) {
      const mX = (e.clientX - rect.left) / rect.width;
      const mY = (e.clientY - rect.top) / rect.height;
      x.set(mX);
      y.set(mY);
      setMousePos({ mouseX: mX, mouseY: mY });
    }
    setIsHovered(true);
    if (onMouseMove) {
      onMouseMove(e);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    x.set(0.5);
    y.set(0.5);
    setIsHovered(false);
    if (onMouseLeave) {
      onMouseLeave(e);
    }
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
        ...style,
      }}
      className={`relative ${className}`.trim()}
      {...props}
    >
      {children}
      {showGlare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mouseX * 100}% ${mouseY * 100}%, rgba(255, 255, 255, 0.15), transparent 60%)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
    </motion.div>
  );
}

