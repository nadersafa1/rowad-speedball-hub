"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Trophy, Target, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { usePlayersStore } from "@/store/players-store";
import { useTestsStore } from "@/store/tests-store";
import PlayerForm from "@/components/players/player-form";
import TestForm from "@/components/tests/test-form";
import ResultsForm from "@/components/results/results-form";

const AdminDashboard = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    players,
    fetchPlayers,
    deletePlayer,
    isLoading: playersLoading,
  } = usePlayersStore();
  const {
    tests,
    fetchTests,
    deleteTest,
    isLoading: testsLoading,
  } = useTestsStore();

  const [playerFormOpen, setPlayerFormOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [testFormOpen, setTestFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [resultsFormOpen, setResultsFormOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      router.push("/");
      return;
    }

    // Fetch data
    fetchPlayers();
    fetchTests();
  }, [user, router, fetchPlayers, fetchTests]);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-4">
              You need to be logged in as an admin to access this page.
            </p>
            <Button onClick={() => router.push("/")}>Go to Homepage</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (
      confirm(
        `Are you sure you want to delete player "${playerName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deletePlayer(playerId);
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  const handleDeleteTest = async (testId: string, testName: string) => {
    if (
      confirm(
        `Are you sure you want to delete test "${testName}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteTest(testId);
      } catch (error) {
        console.error("Error deleting test:", error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage players, tests, and results for Rowad speedball team
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Dialog open={playerFormOpen} onOpenChange={setPlayerFormOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Plus className="h-12 w-12 text-rowad-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Add New Player</h3>
                <p className="text-gray-600">Register a new speedball player</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <PlayerForm
              player={editingPlayer}
              onSuccess={() => {
                setPlayerFormOpen(false);
                setEditingPlayer(null);
                fetchPlayers();
              }}
              onCancel={() => {
                setPlayerFormOpen(false);
                setEditingPlayer(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={testFormOpen} onOpenChange={setTestFormOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Create New Test</h3>
                <p className="text-gray-600">Set up a new speedball test</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <TestForm
              test={editingTest}
              onSuccess={() => {
                setTestFormOpen(false);
                setEditingTest(null);
                fetchTests();
              }}
              onCancel={() => {
                setTestFormOpen(false);
                setEditingTest(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={resultsFormOpen} onOpenChange={setResultsFormOpen}>
          <DialogTrigger asChild>
            <Card className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="pt-6 text-center">
                <Target className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">Add Test Results</h3>
                <p className="text-gray-600">Record new test results</p>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <ResultsForm
              result={editingResult}
              onSuccess={() => {
                setResultsFormOpen(false);
                setEditingResult(null);
                fetchPlayers();
                fetchTests();
              }}
              onCancel={() => {
                setResultsFormOpen(false);
                setEditingResult(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Players Management */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Players Management ({players.length})
          </CardTitle>
          <CardDescription>
            Manage all registered speedball players
          </CardDescription>
        </CardHeader>
        <CardContent>
          {playersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Players Yet
              </h3>
              <p className="text-gray-600">
                Start by adding your first speedball player.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{player.name}</h3>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {player.ageGroup}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {player.gender === "male" ? "👨" : "👩"} Age {player.age}{" "}
                      • Born {new Date(player.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingPlayer(player);
                        setPlayerFormOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Tests Management ({tests.length})
          </CardTitle>
          <CardDescription>Manage all speedball tests</CardDescription>
        </CardHeader>
        <CardContent>
          {testsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Tests Yet
              </h3>
              <p className="text-gray-600">
                Create your first speedball test to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{test.name}</h3>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          test.testType === "60_30"
                            ? "bg-red-100 text-red-800"
                            : test.testType === "30_30"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {test.testType === "60_30"
                          ? "Type A"
                          : test.testType === "30_30"
                          ? "Type B"
                          : "Type C"}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      📅 {new Date(test.dateConducted).toLocaleDateString()}
                      {test.description && ` • ${test.description}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTest(test);
                        setTestFormOpen(true);
                      }}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTest(test.id, test.name)}
                      className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
