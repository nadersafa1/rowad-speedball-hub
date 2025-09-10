import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";
import { BarChart3 } from "lucide-react";

const AnalyticsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BarChart3 className="h-10 w-10 text-rowad-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Analytics & Insights
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Detailed performance analytics and insights for Rowad speedball team
        </p>
      </header>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
};

export default AnalyticsPage;
