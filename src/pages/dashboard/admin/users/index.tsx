import { NextPage } from "next/types";
import React, { useEffect } from "react";
import { DashboardAdminLayout } from "../../../../components/layout/dashboard/DashboardAdminLayout";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import { RoleBadges } from "../../../../components/RoleBadges";
import { trpc } from "../../../../utils/trpc";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { FaTrashAlt } from "react-icons/fa";
import { parseDate } from "../../../../utils/parseDate";
import Link from "next/link";
import { USER_LIST_SORTS } from "../../../../constants/sorts";
import getSortOrder from "../../../../utils/getSortOrder";
import getItemIndex from "../../../../utils/getItemIndex";
import { userListQuery } from "../../../../server/queries";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";
import { useSession } from "next-auth/react";
import { useQueryOptions } from "../../../../utils/useQueryOptions";
import { inferProcedureOutput } from "@trpc/server";
import { userRouter } from "../../../../server/trpc/router/user";

const sortOrders = getSortOrder(USER_LIST_SORTS);
type QueryOptions = typeof userListQuery;
type Sorts = typeof USER_LIST_SORTS[number];
type UserLoadingStatus = inferProcedureOutput<
  typeof userRouter["list"]
>["users"][number] & {
  isLoading: boolean;
};

const DashboardAdminUsersPage: NextPage = () => {
  const session = useSession();

  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    USER_LIST_SORTS
  );
  const userListQuery = trpc.user.list.useQuery(queryOptions);
  const [users, setUsers] = React.useState<UserLoadingStatus[]>([]);
  const { mutate: activationMutate } = trpc.user.activate.useMutation({
    onSettled: toastSettleHandler,
  });
  const { mutate: deleteMutate } = trpc.user.delete.useMutation({
    onSettled: toastSettleHandler,
  });

  const setUserLoading = (id: string, isLoading: boolean) => {
    setUsers((prevState) => {
      const index = prevState.findIndex((e) => e.id === id);
      const newState = prevState;
      newState[index] = {
        ...newState[index],
        isLoading,
      } as UserLoadingStatus;
      return [...newState];
    });
  };

  const handleActivate = (id: string, isActivated: boolean) => {
    setUserLoading(id, true);

    activationMutate(
      { id, isActivated },
      { onSuccess: () => userListQuery.refetch() }
    );
  };

  const handleDelete = (id: string, username: string) => {
    if (!confirm(`Delete user '${username}'?\n\nID : ${id}`)) return;

    setUserLoading(id, true);
    deleteMutate(id, { onSuccess: () => userListQuery.refetch() });
  };

  useEffect(() => {
    if (!userListQuery.data) {
      return;
    }
    const users = userListQuery.data.users.map((user) => ({
      ...user,
      isLoading: false,
    }));
    setUsers(users);
  }, [userListQuery.data]);

  return (
    <DashboardAdminLayout>
      <p className="text-xl font-medium">User List</p>
      <ListLayout
        queryResult={userListQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        create={
          <Link href="/dashboard/admin/users/create">
            <a className="btn btn-info btn-sm text-white">New User</a>
          </Link>
        }
        main={
          <>
            <table className="table w-full overflow-x-auto">
              <thead>
                <tr>
                  <th />
                  <th>Username</th>
                  <th>Role</th>
                  <th>Activated</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Date Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {(userListQuery.data?.users.length ?? 0) <= 0 ? (
                  <p>No users</p>
                ) : (
                  !!userListQuery.data &&
                  users.map((user, index) => (
                    <tr key={user.id} className="hover">
                      <th>
                        {getItemIndex(userListQuery.data._metadata, index)}
                      </th>
                      <td>
                        <Link
                          href={
                            session.data?.user?.id !== user.id
                              ? `/dashboard/admin/users/${user.id}`
                              : "/dashboard/settings/user"
                          }
                        >
                          <a className="link">{user.username}</a>
                        </Link>
                      </td>
                      <td className="max-w-[12rem]">
                        <RoleBadges role={user.role} />
                      </td>
                      <td>
                        <div
                          onClick={() => {
                            if (user.isLoading) return;
                            handleActivate(user.id, !user.isActivated);
                          }}
                        >
                          {user.isActivated ? (
                            <ImCheckboxChecked
                              className="cursor-pointer"
                              color={user.isLoading ? "gray" : "black"}
                              size="18px"
                            />
                          ) : (
                            <ImCheckboxUnchecked
                              className="cursor-pointer"
                              color={user.isLoading ? "gray" : "black"}
                              size="18px"
                            />
                          )}
                        </div>
                      </td>
                      <td>{user.profile?.email}</td>
                      <td>{user.profile?.name}</td>
                      <td>{user.profile?.country}</td>
                      <td>{parseDate(user.createdAt)}</td>
                      <td>
                        <div
                          onClick={() => {
                            if (user.isLoading) return;
                            handleDelete(user.id, user.username);
                          }}
                        >
                          <FaTrashAlt
                            className="cursor-pointer"
                            color={user.isLoading ? "gray" : "red"}
                            size="18px"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        }
      />
    </DashboardAdminLayout>
  );
};
export default DashboardAdminUsersPage;
