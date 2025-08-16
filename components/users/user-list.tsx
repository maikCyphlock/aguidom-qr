"use client";

import { useUsers } from "@/hooks/api/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserList() {
  const { users, isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive">
        Error loading users: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <Card key={user.id}>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.user_metadata?.name || user.email}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {user.role} • {user.clubId ? `Club ID: ${user.clubId}` : 'No Club'}
              </p>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
