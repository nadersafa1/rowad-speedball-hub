import Link from "next/link";
import { Activity, Users, Trophy, BarChart3 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">SpeedballHub</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive platform for managing speedball sport data and
          analytics for Rowad club
        </p>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Users className="h-8 w-8 text-speedball-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-muted-foreground">Total Players</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Trophy className="h-8 w-8 text-speedball-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-muted-foreground">Tests Conducted</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <Activity className="h-8 w-8 text-speedball-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-muted-foreground">Test Results</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-6">
            <BarChart3 className="h-8 w-8 text-speedball-600 mx-auto mb-3" />
            <h3 className="text-2xl font-bold">3</h3>
            <p className="text-muted-foreground">Test Types</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
          <Link href="/players">
            <CardHeader>
              <div className="flex items-center">
                <Users className="h-10 w-10 text-speedball-600 mr-4" />
                <CardTitle className="text-2xl group-hover:text-speedball-600 transition-colors">
                  Players Archive
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Browse and search through all registered players. View player
                profiles, performance history, and statistics.
              </CardDescription>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow group cursor-pointer">
          <Link href="/tests">
            <CardHeader>
              <div className="flex items-center">
                <Trophy className="h-10 w-10 text-speedball-600 mr-4" />
                <CardTitle className="text-2xl group-hover:text-speedball-600 transition-colors">
                  Tests Archive
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Explore all conducted tests with detailed results. Filter by
                test type, date, and performance metrics.
              </CardDescription>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Test Types Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Speedball Test Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-speedball-100 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-speedball-800">
                  Type A
                </h3>
                <p className="text-speedball-600">60s Play / 30s Rest</p>
              </div>
              <p className="text-sm text-muted-foreground">
                High-intensity endurance test with extended play time
              </p>
            </div>
            <div className="text-center">
              <div className="bg-speedball-100 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-speedball-800">
                  Type B
                </h3>
                <p className="text-speedball-600">30s Play / 30s Rest</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Balanced intensity test with equal play and rest periods
              </p>
            </div>
            <div className="text-center">
              <div className="bg-speedball-100 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-speedball-800">
                  Type C
                </h3>
                <p className="text-speedball-600">30s Play / 60s Rest</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Recovery-focused test with extended rest periods
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center mt-12 pt-8 border-t">
        <p className="text-muted-foreground">
          © 2024 SpeedballHub - Rowad Club. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
