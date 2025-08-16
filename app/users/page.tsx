import { UserList } from "@/components/users/user-list";
import { UserSearch } from "@/components/users/user-search";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">
          Manage and search for users in the system.
        </p>
      </div>
      
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Users</h2>
          <UserSearch />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Users</h2>
          <UserList />
        </div>
      </div>
    </div>
  );
}
