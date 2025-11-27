'use client'

import { useQuery } from '@tanstack/react-query'

export default function TestQueryPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['test'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { message: 'React Query is working!' }
    }
  })

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-3xl font-bold">React Query Test</h1>

        {isLoading && (
          <div className="text-blue-600">Loading...</div>
        )}

        {error && (
          <div className="text-red-600">Error: {error.message}</div>
        )}

        {data && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{data.message}</p>
          </div>
        )}

        <div className="text-sm text-gray-600">
          <p>Check the bottom-left corner for React Query DevTools</p>
          <p className="mt-2">Query State:</p>
          <ul className="mt-1 space-y-1">
            <li>Loading: {isLoading ? '✓' : '✗'}</li>
            <li>Error: {error ? '✓' : '✗'}</li>
            <li>Data: {data ? '✓' : '✗'}</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
