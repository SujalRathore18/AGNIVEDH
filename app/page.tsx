'use client'

import React, { useState } from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { Hero } from '@/components/landing/Hero'
import { ProblemNumberLine } from '@/components/landing/ProblemNumberLine'
import { ThreeLayersSection } from '@/components/landing/ThreeLayersSection'
import { PipelineSection } from '@/components/landing/PipelineSection'
import { ExamplePromptsSection } from '@/components/landing/ExamplePromptsSection'
import { InnovationsSection } from '@/components/landing/InnovationsSection'
import { PrivacySection } from '@/components/landing/PrivacySection'
import { HonestLimitsBanner } from '@/components/landing/HonestLimitsBanner'

export default function LandingPage() {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Full-Screen Hero with Space Frog Vedh & Ask AGNIVEDH Panel */}
        <Hero />

        {/* 1. The Problem: Interactive number-line widget */}
        <ProblemNumberLine />

        {/* 2. Three Layers of Defense */}
        <ThreeLayersSection />

        {/* 3. How it Works: 5-step Pipeline */}
        <PipelineSection />

        {/* 4. Clickable Prompts and Use Cases */}
        <ExamplePromptsSection onSelectPrompt={(p) => setSelectedPrompt(p)} />

        {/* 5. What is New (Innovations Matrix) */}
        <InnovationsSection />

        {/* 6. Privacy and Air-Gapped Security */}
        <PrivacySection />

        {/* 7. Honest Limits Engineering Banner */}
        <HonestLimitsBanner className="my-8" />
      </main>

      <Footer />
    </div>
  )
}
