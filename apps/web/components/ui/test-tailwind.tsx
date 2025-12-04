/**
 * Test component to verify Tailwind CSS and utility setup
 * This file can be removed after verification
 */

import { cn } from '@/lib/utils'

export function TestTailwind() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-primary-600">Tailwind Test</h2>
      
      {/* Test custom colors */}
      <div className="grid grid-cols-3 gap-2">
        <div className="h-20 bg-primary-500 rounded-lg" />
        <div className="h-20 bg-festive-red rounded-lg" />
        <div className="h-20 bg-festive-green rounded-lg" />
      </div>

      {/* Test cn utility */}
      <div
        className={cn(
          'p-4 rounded-lg',
          'bg-primary-100',
          'hover:bg-primary-200'
        )}
      >
        cn() utility working
      </div>

      {/* Test touch target */}
      <button className="touch-target bg-primary-600 text-white rounded-lg px-4">
        Touch Target Test (44x44px)
      </button>

      {/* Test safe area */}
      <div className="safe-area-inset bg-gray-100 p-2 rounded">
        Safe Area Inset Applied
      </div>

      {/* Test responsive breakpoints */}
      <div className="xs:bg-red-100 sm:bg-blue-100 md:bg-green-100 lg:bg-yellow-100 p-4 rounded">
        Responsive: Red (xs) → Blue (sm) → Green (md) → Yellow (lg)
      </div>
    </div>
  )
}
