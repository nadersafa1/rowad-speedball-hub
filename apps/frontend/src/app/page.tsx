import AnalyticsDashboard from "@/components/dashboard/analytics-dashboard";

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Rowad Speedball Dashboard
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Comprehensive analytics and insights for Rowad speedball team
          performance
        </p>
      </header>

      {/* Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
};

export default HomePage;
