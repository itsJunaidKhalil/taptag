"use client";

import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative mx-auto" style={{ width: 320 }}>
      <div
        className="relative bg-black rounded-[3rem] p-2.5 shadow-2xl"
        style={{
          boxShadow:
            "0 25px 50px -12px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.08) inset",
        }}
      >
        {/* Side buttons */}
        <span className="absolute left-[-3px] top-24 w-[3px] h-12 bg-black rounded-l" />
        <span className="absolute left-[-3px] top-40 w-[3px] h-16 bg-black rounded-l" />
        <span className="absolute left-[-3px] top-60 w-[3px] h-16 bg-black rounded-l" />
        <span className="absolute right-[-3px] top-32 w-[3px] h-20 bg-black rounded-r" />

        {/*
          Screen background pulls from the active CSS theme variable so
          changing the theme in AppearanceTab actually repaints the whole
          phone "screen", not just the text/links inside ProfileCard.
        */}
        <div
          className="relative rounded-[2.4rem] overflow-hidden"
          style={{ height: 600, background: "var(--bg, #ffffff)" }}
        >
          {/* Dynamic island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-24 h-6 bg-black rounded-full" />

          {/* Inner scrollable content */}
          <div className="h-full min-w-0 overflow-y-auto overflow-x-hidden pt-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
