export default function ClubLoading() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        
        {/* Content Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
