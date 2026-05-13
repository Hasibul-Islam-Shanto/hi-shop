import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/shared/components/PageHeading";
import { Pagination } from "@/shared/components/Pagination";
import { StatusBadge } from "@/shared/components/StatusBadge";
import { getApiErrorMessage } from "@/utils/api-error";
import {
  getUsers,
  reactivateUser,
  suspendUser,
  updateUserRole,
  type AdminUser,
  type UserRole,
} from "../services/userService";
import type { PaginationMeta } from "@/features/orders/schemas/types";

const LIMIT = 20;

const roleColors: Record<string, string> = {
  ADMIN: "text-primary bg-primary/10",
  CUSTOMER: "text-on-surface-variant bg-surface-container",
};

const accountColors: Record<string, string> = {
  Active: "text-tertiary bg-tertiary/10",
  Suspended: "text-destructive bg-destructive/10",
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const UsersPage = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "All">("All");
  const [suspended, setSuspended] = useState<"All" | "Active" | "Suspended">("All");
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getUsers({ page, limit: LIMIT, search, role, suspended });
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load users."));
    } finally {
      setIsLoading(false);
    }
  }, [page, search, role, suspended]);

  useEffect(() => {
    const id = window.setTimeout(() => void load(), 250);
    return () => window.clearTimeout(id);
  }, [load]);

  const patchUser = async (userId: string, action: () => Promise<AdminUser>) => {
    setActionId(userId);
    setError(null);
    try {
      const updated = await action();
      setUsers((prev) => prev.map((user) => (user.id === userId ? updated : user)));
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update user."));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6">
      <PageHeading label="Manage" title="Users">
        <div className="hidden sm:flex items-center bg-surface-container rounded-lg px-3 py-1.5 ghost-border w-56">
          <Search className="h-3.5 w-3.5 text-on-surface-variant mr-2 shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search users..."
            className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
          />
        </div>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as UserRole | "All");
            setPage(1);
          }}
          className="bg-surface-container text-sm text-on-surface rounded-lg px-3 py-1.5 ghost-border"
        >
          <option value="All">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="CUSTOMER">Customer</option>
        </select>
        <select
          value={suspended}
          onChange={(e) => {
            setSuspended(e.target.value as "All" | "Active" | "Suspended");
            setPage(1);
          }}
          className="bg-surface-container text-sm text-on-surface rounded-lg px-3 py-1.5 ghost-border"
        >
          <option value="All">All accounts</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </PageHeading>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-4 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="bg-card rounded-xl overflow-hidden ghost-border shadow-(--shadow-sm)">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="text-left border-b border-outline-variant/10">
                <th className="label-text text-[10px] px-5 py-3">User</th>
                <th className="label-text text-[10px] px-3 py-3">Role</th>
                <th className="label-text text-[10px] px-3 py-3">Status</th>
                <th className="label-text text-[10px] px-3 py-3">Joined</th>
                <th className="label-text text-[10px] px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    Loading users…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-on-surface-variant">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const name = `${user.firstName} ${user.lastName}`;
                  const accountStatus = user.suspendedAt ? "Suspended" : "Active";
                  const isBusy = actionId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {user.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{name}</p>
                            <p className="text-xs text-on-surface-variant">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={user.role} colorMap={roleColors} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={accountStatus} colorMap={accountColors} />
                      </td>
                      <td className="px-3 py-3 text-sm text-on-surface-variant">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              patchUser(user.id, () =>
                                updateUserRole(user.id, user.role === "ADMIN" ? "CUSTOMER" : "ADMIN"),
                              )
                            }
                          >
                            {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                            {user.role === "ADMIN" ? "Make Customer" : "Make Admin"}
                          </Button>
                          <Button
                            variant={user.suspendedAt ? "outline" : "destructive"}
                            size="sm"
                            disabled={isBusy}
                            onClick={() =>
                              patchUser(user.id, () =>
                                user.suspendedAt ? reactivateUser(user.id) : suspendUser(user.id),
                              )
                            }
                          >
                            {user.suspendedAt ? (
                              <UserCheck className="h-3.5 w-3.5" />
                            ) : (
                              <ShieldOff className="h-3.5 w-3.5" />
                            )}
                            {user.suspendedAt ? "Reactivate" : "Suspend"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {meta && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            limit={meta.limit}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default UsersPage;
