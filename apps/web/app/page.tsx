"use client"

import { Hero } from "../components/home/hero";
import { ConvexNudge } from '@convex-nudge/react';
import { SessionTracker } from "@devwithbobby/convex-session-tracker";

export default function Home() {
  return (
    // <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center p-20 gap-16 font-synthesis-none">
    //   <main className="flex flex-col gap-8 row-start-2">
    //     <Hero />
    //   </main>
    //   <footer className="grid-row-start-3 flex gap-6 bottom-10">
    // <ConvexNudge
    //   variant="dark"
    //   position="bottom"
    //   animation="slide"
    //   textSize="base"
    //   logoSize={24}
    //   referralCode="cvx-starter"
    //   fixed
    // />
    //     <SessionTracker />
    //   </footer>
    // </div>
    <>
      <Hero />
      <SessionTracker />
      <ConvexNudge
        variant="dark"
        position="bottom"
        animation="slide"
        textSize="base"
        logoSize={24}
        referralCode="cvx-starter"
        fixed
      />
    </>
  );
}