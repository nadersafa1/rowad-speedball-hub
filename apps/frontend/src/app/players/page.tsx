"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Users, Search, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePlayersStore } from "@/store/players-store";
import { calculateAge, getAgeGroup, formatDate } from "@/lib/utils";

const PlayersPage = () => {
  const {
    players,
    isLoading,
    error,
    filters,
    fetchPlayers,
    setFilters,
    clearError,
  } = usePlayersStore();

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
            <Button onClick={clearError} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8 text-speedball-600" />
            Players Archive
          </h1>
          <p className="text-muted-foreground mt-2">
            Browse and manage all registered players
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search players..."
                  value={filters.search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : players.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {filters.search
                ? "Try adjusting your search terms."
                : "No players have been registered yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Link key={player.id} href={`/players/${player.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg text-rowad-600">
                    {player.name}
                  </CardTitle>
                  <CardDescription>
                    {player.gender === "male" ? "👨" : "👩"} {player.ageGroup} •
                    Age {player.age}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Date of Birth:
                      </span>
                      <span>{formatDate(player.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gender:</span>
                      <span className="capitalize">{player.gender}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Age Group:</span>
                      <span className="font-medium text-speedball-600">
                        {player.ageGroup}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Stats */}
      {players.length > 0 && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{players.length}</p>
                <p className="text-muted-foreground text-sm">Total Players</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {players.filter((p) => p.gender === "male").length}
                </p>
                <p className="text-muted-foreground text-sm">Male</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {players.filter((p) => p.gender === "female").length}
                </p>
                <p className="text-muted-foreground text-sm">Female</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Set(players.map((p) => p.ageGroup)).size}
                </p>
                <p className="text-muted-foreground text-sm">Age Groups</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlayersPage;
