"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

type MaskedHeadingProps = {
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  id?: string;
  text: string;
};

export default function MaskedHeading({
  as = "h2",
  className = "",
  delay = 0,
  id,
  text,
}: MaskedHeadingProps) {
  const reduceMotion = useReducedMotion();
  const Heading = as;
  const words = text.trim().split(/\s+/);

  if (reduceMotion) {
    return (
      <Heading id={id} className={className}>
        {text}
      </Heading>
    );
  }

  return (
    <Heading id={id} aria-label={text} className={className}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.35 }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              delayChildren: delay,
              staggerChildren: 0.035,
            },
          },
        }}
      >
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: "115%" },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.58,
                      ease: [0.22, 1, 0.36, 1],
                    },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>{" "}
          </Fragment>
        ))}
      </motion.span>
    </Heading>
  );
}
