"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useSearchUsers } from "@/hooks/api/useUsers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const { results, isLoading } = useSearchUsers(searchQuery);

  return (
    <div className="space-y-4">
      <Input
        type="search"
        placeholder="Search users by name or ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {isLoading && searchQuery.length > 1 && (
        <div className="text-muted-foreground">Searching...</div>
      )}
      
      {results && results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div key={user.userId} className="flex items-center space-x-3 p-2 hover:bg-accent rounded-md">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>
                  {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.idNumber && `ID: ${user.idNumber} • `}
                  {user.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {searchQuery.length > 1 && results && results.length === 0 && !isLoading && (
        <div className="text-muted-foreground text-center py-4">
          No users found matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}
