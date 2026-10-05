'use client'

import React from 'react'
import { Navbar } from '@/components/ui/Navbar'
import { Footer } from '@/components/ui/Footer'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardProvider } from '@/components/dashboard/DashboardContext'
import { DatasetBar } from '@/components/dashboard/DatasetBar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="flex flex-col min-h-screen bg-[#05070A]">
        <Navbar />

        <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
          {/* Collapsible / responsive sidebar */}
          <Sidebar />

          {/* Main Console Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            {/* Top Dataset Management Bar */}
            <DatasetBar />

            {/* Sub-page content */}
            {children}
          </main>
        </div>

        <Footer />
      </div>
    </DashboardProvider>
  )
}
