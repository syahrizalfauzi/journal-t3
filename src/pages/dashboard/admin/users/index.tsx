import { useSession } from "next-auth/react";
import { NextPage } from "next/types";
import React, { useEffect, useState } from "react";
import DashboardAdminLayout from "../../../../components/layout/dashboard/DashboardAdminLayout";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import RoleBadges from "../../../../components/RoleBadges";
import { trpc } from "../../../../utils/trpc";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { FaTrashAlt } from "react-icons/fa";
import parseDate from "../../../../utils/parseDate";
import Link from "next/link";
import { z } from "zod";
import { userListSorts } from "../../../../utils/sorts/user";
import getSortOrder from "../../../../utils/getSortOrder";
import getItemIndex from "../../../../utils/getItemIndex";
import { userListQuery } from "../../../../server/queries/user";
import Toast from "../../../../components/Toast";

const sortOrders = getSortOrder(userListSorts);
type UserListSorts = typeof userListSorts[number];
type UserListQuery = Omit<z.infer<typeof userListQuery>, "sort"> & {
  sort: UserListSorts;
};

const DashboardAdminUsersPage: NextPage = () => {
  const session = useSession();

  const [queryOptions, setQueryOptions] = useState<UserListQuery>({
    sort: sortOrders[0]?.sort,
    order: sortOrders[0]?.order,
  } as UserListQuery);
  const userListQuery = trpc.user.list.useQuery(queryOptions);
  const {
    mutate: activationMutate,
    data: activationData,
    error: activationError,
  } = trpc.user.activate.useMutation();
  const {
    mutate: deleteMutate,
    data: deleteData,
    error: deleteError,
  } = trpc.user.delete.useMutation();

  const handleActivate = (id: string, isActivated: boolean) =>
    activationMutate(
      { id, isActivated },
      { onSuccess: () => userListQuery.refetch() }
    );

  const handleDelete = (id: string, username: string) => {
    if (confirm(`Delete user '${username}'?\n\nID : ${id}`))
      deleteMutate(id, { onSuccess: () => userListQuery.refetch() });
  };

  const handleChangeSort = (sort: UserListSorts, order: "asc" | "desc") => {
    setQueryOptions((state) => ({
      ...state,
      sort,
      order,
    }));
  };

  const handleChangePage = (page: number) =>
    setQueryOptions((state) => ({ ...state, page }));

  useEffect(
    () => console.log([activationData?.message, deleteData?.message]),
    [activationData?.message, deleteData?.message]
  );

  return (
    <DashboardAdminLayout>
      {deleteData && <Toast variant="success">{deleteData.message}</Toast>}
      {activationData && (
        <Toast variant="success">{activationData.message}</Toast>
      )}
      {deleteError && <Toast variant="error">{deleteError.message}</Toast>}
      {activationError && (
        <Toast variant="error">{activationError.message}</Toast>
      )}
      <p className="text-xl font-medium">User List</p>
      <ListLayout
        queryResult={userListQuery}
        sortOrders={sortOrders}
        allowedSorts={userListSorts}
        onChangePage={handleChangePage}
        onChangeSort={handleChangeSort}
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
                {userListQuery.data?.users.map((user, index) => (
                  <tr key={user.id} className="hover">
                    <th>{getItemIndex(userListQuery.data._metadata, index)}</th>
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
                        onClick={() =>
                          handleActivate(user.id, !user.isActivated)
                        }
                      >
                        {user.isActivated ? (
                          <ImCheckboxChecked
                            className="cursor-pointer"
                            size="18px"
                          />
                        ) : (
                          <ImCheckboxUnchecked
                            className="cursor-pointer"
                            size="18px"
                          />
                        )}
                      </div>
                    </td>
                    <td>{user.profile?.email}</td>
                    <td>{user.profile?.name}</td>
                    <td>{user.profile?.country}</td>
                    <td>{parseDate(user.createdAt.toString())}</td>
                    <td>
                      <div onClick={() => handleDelete(user.id, user.username)}>
                        <FaTrashAlt
                          className="cursor-pointer"
                          color="red"
                          size="18px"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      />
    </DashboardAdminLayout>
  );
};

export default DashboardAdminUsersPage;
