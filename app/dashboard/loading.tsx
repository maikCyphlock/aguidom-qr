export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-pulse space-y-4 w-full max-w-2xl">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  )
}
