import { useQuery } from "@tanstack/react-query";
import { getUsers, getUserById, searchUsers } from "@/lib/services/users";

export const useUsers = () => {
  const {
    data: users = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return {
    users,
    isLoading,
    error,
    refetch,
  };
};

export const useUser = (userId?: string) => {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => (userId ? getUserById(userId) : null),
    enabled: !!userId, // Only run the query if userId is provided
  });

  return {
    user,
    isLoading,
    error,
    refetch,
  };
};

export const useSearchUsers = (query: string) => {
  const {
    data: results = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["searchUsers", query],
    queryFn: () => searchUsers(query),
    enabled: query.length > 1, // Only search if query has at least 2 characters
  });

  return {
    results,
    isLoading,
    error,
    refetch,
  };
};
