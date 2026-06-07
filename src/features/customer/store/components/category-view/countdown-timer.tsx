"use client";

import React, { useEffect, useState } from "react";
import { intervalToDuration, isAfter } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(
    intervalToDuration({ start: new Date(), end: targetDate })
  );
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      
      if (isAfter(now, targetDate)) {
        setHasEnded(true);
        clearInterval(interval);
      } else {
        setTimeLeft(
          intervalToDuration({
            start: now,
            end: targetDate,
          })
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (hasEnded) {
    return <span className="font-semibold text-red-600">Offer Expired</span>;
  }

  const formatNumber = (num: number = 0) => String(num).padStart(2, "0");

  const timeUnits = [
    { label: "DAYS", value: formatNumber(timeLeft.days) },
    { label: "HRS", value: formatNumber(timeLeft.hours) },
    { label: "MINS", value: formatNumber(timeLeft.minutes) },
    { label: "SECS", value: formatNumber(timeLeft.seconds) },
  ];

  return (
    <div className="flex gap-4 items-center justify-center">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center">
          <div className="bg-secondary text-secondary-foreground rounded-md px-3 py-2 text-2xl md:text-3xl font-mono font-bold min-w-[3rem] text-center flex justify-center items-center overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={`${unit.label}-${unit.value}`}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="inline-block"
              >
                {unit.value}
              </motion.div>
            </AnimatePresence>
          </div>
          <span className="text-[10px] tracking-wider font-semibold text-muted-foreground mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
