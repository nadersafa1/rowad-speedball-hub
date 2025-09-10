"use client";

import { useEffect, useMemo } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Trophy,
  Target,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePlayersStore } from "@/store/players-store";
import { useTestsStore } from "@/store/tests-store";

const AnalyticsDashboard = () => {
  const {
    players,
    fetchPlayers,
    isLoading: playersLoading,
  } = usePlayersStore();
  const { tests, fetchTests, isLoading: testsLoading } = useTestsStore();

  useEffect(() => {
    fetchPlayers();
    fetchTests();
  }, [fetchPlayers, fetchTests]);

  // Calculate analytics
  const analytics = useMemo(() => {
    // Player analytics
    const totalPlayers = players.length;
    const genderDistribution = players.reduce((acc, player) => {
      acc[player.gender] = (acc[player.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Age group distribution
    const ageGroupDistribution = players.reduce((acc, player) => {
      acc[player.ageGroup] = (acc[player.ageGroup] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Test analytics
    const totalTests = tests.length;
    const testTypeDistribution = tests.reduce((acc, test) => {
      const typeLabel =
        test.testType === "60_30"
          ? "Type A (60s/30s)"
          : test.testType === "30_30"
          ? "Type B (30s/30s)"
          : "Type C (30s/60s)";
      acc[typeLabel] = (acc[typeLabel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent activity
    const recentTests = tests
      .sort(
        (a, b) =>
          new Date(b.dateConducted).getTime() -
          new Date(a.dateConducted).getTime()
      )
      .slice(0, 5);

    const recentPlayers = players
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return {
      totalPlayers,
      totalTests,
      genderDistribution,
      ageGroupDistribution,
      testTypeDistribution,
      recentTests,
      recentPlayers,
    };
  }, [players, tests]);

  const isLoading = playersLoading || testsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-rowad-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Players
                </p>
                <p className="text-3xl font-bold text-rowad-600">
                  {analytics.totalPlayers}
                </p>
              </div>
              <Users className="h-8 w-8 text-rowad-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Tests
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.totalTests}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Male Players
                </p>
                <p className="text-3xl font-bold text-purple-600">
                  {analytics.genderDistribution.male || 0}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Female Players
                </p>
                <p className="text-3xl font-bold text-pink-600">
                  {analytics.genderDistribution.female || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-rowad-600" />
              Age Group Distribution
            </CardTitle>
            <CardDescription>
              Player distribution across different age categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.ageGroupDistribution)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([ageGroup, count]) => (
                  <div
                    key={ageGroup}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-rowad-500 rounded-full"></div>
                      <span className="font-medium">{ageGroup}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-rowad-500 h-2 rounded-full"
                          style={{
                            width: `${(count / analytics.totalPlayers) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-blue-600" />
              Test Type Distribution
            </CardTitle>
            <CardDescription>
              Distribution of conducted test types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(analytics.testTypeDistribution).map(
                ([testType, count]) => {
                  const colors = {
                    "Type A (60s/30s)": "bg-red-500",
                    "Type B (30s/30s)": "bg-blue-500",
                    "Type C (30s/60s)": "bg-green-500",
                  };
                  const colorClass =
                    colors[testType as keyof typeof colors] || "bg-gray-500";

                  return (
                    <div
                      key={testType}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 ${colorClass} rounded-full`}
                        ></div>
                        <span className="font-medium">{testType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`${colorClass} h-2 rounded-full`}
                            style={{
                              width: `${(count / analytics.totalTests) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Recent Tests
            </CardTitle>
            <CardDescription>Latest conducted speedball tests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentTests.length > 0 ? (
                analytics.recentTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(test.dateConducted).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {test.testType === "60_30"
                          ? "Type A"
                          : test.testType === "30_30"
                          ? "Type B"
                          : "Type C"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No tests conducted yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Players */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-rowad-600" />
              Recent Players
            </CardTitle>
            <CardDescription>Recently registered players</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.recentPlayers.length > 0 ? (
                analytics.recentPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {player.gender === "male" ? "👨" : "👩"}{" "}
                        {player.ageGroup} • Age {player.age}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Joined {new Date(player.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No players registered yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
