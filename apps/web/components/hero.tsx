"use client"

import { TypewriterEffectSmooth } from "@workspace/ui/components/typewriter-effect"
import { Button } from "@workspace/ui/components/button"
import { GithubIcon } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()

  const words = [
    {
      text: "Build",
    },
    {
      text: "awesome",
    },
    {
      text: "apps",
    },
    {
      text: "with",
    },
    {
      text: "this",
    },
    {
      text: "Convex Starter.",
      className: "text-pink-500 dark:text-pink-500",
    },
  ]
  return (
    <div className="flex flex-col items-center justify-center h-[40rem]  ">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base  ">
        The road to freedom starts from here
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <Button className="w-40 h-10 bg-black border dark:border-white border-transparent text-white text-sm">
          <GithubIcon className="size-4" />
          Github
        </Button>
        <Button
          className="w-40 h-10 bg-white text-black border border-black  text-sm"
          onClick={() => router.push("http://localhost:3000")}
        >
          Demo
        </Button>
      </div>
    </div>
  )
}

