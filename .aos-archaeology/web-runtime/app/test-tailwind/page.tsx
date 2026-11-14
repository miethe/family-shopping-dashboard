import { TestTailwind } from '@/components/ui/test-tailwind'

export const metadata = {
  title: 'Tailwind Test | Family Gifting Dashboard',
  description: 'Test page for Tailwind CSS and utilities',
}

export default function TestTailwindPage() {
  return (
    <main className="min-h-screen-safe bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-primary-600 mb-6">
            Tailwind CSS + Radix UI Setup Test
          </h1>
          <TestTailwind />
        </div>
      </div>
    </main>
  )
}
