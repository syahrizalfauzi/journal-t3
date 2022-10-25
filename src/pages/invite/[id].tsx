import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AuthGuard } from "../../components/AuthGuard";
import ListLayout from "../../components/layout/dashboard/ListLayout";
import { USER_REVIEWER_SORTS } from "../../constants/sorts";
import { userReviewerQuery } from "../../server/queries";
import getItemIndex from "../../utils/getItemIndex";
import getSortOrder from "../../utils/getSortOrder";
import { toastSettleHandler } from "../../utils/toastSettleHandler";
import { trpc } from "../../utils/trpc";
import { useQueryOptions } from "../../utils/useQueryOptions";

const sortOrders = getSortOrder(USER_REVIEWER_SORTS);
type QueryOptions = typeof userReviewerQuery;
type Sorts = typeof USER_REVIEWER_SORTS[number];

type UserInviteStatus = {
  isInvited: "loading" | "false" | "true";
  username: string;
  id: string;
  profile: {
    email: string;
    name: string;
    country: string;
  } | null;
};

const InvitePage = () => {
  const { query } = useRouter();

  if (!query.id) return null;

  const { queryOptions, ...rest } = useQueryOptions<QueryOptions, Sorts, never>(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    USER_REVIEWER_SORTS
  );
  const userReviewerQuery = trpc.user.reviewer.useQuery(queryOptions);
  const [users, setUsers] = useState<UserInviteStatus[]>([]);
  const createInvitation = trpc.invitation.create.useMutation({
    onSettled: toastSettleHandler,
  });

  const handleInvite = (reviewerId: string) => async () => {
    setUsers((prevState) => {
      const index = prevState.findIndex((e) => e.id === reviewerId);
      const newState = prevState;
      newState[index] = {
        ...newState[index],
        isInvited: "loading",
      } as UserInviteStatus;
      return [...newState];
    });

    createInvitation.mutate(
      { manuscriptId: query.id as string, reviewerId },
      {
        onSuccess: () => {
          setUsers((prevState) => {
            const index = prevState.findIndex((e) => e.id === reviewerId);
            const newState = prevState;

            newState[index] = {
              ...newState[index],
              isInvited: "true",
            } as UserInviteStatus;

            return [...newState];
          });
        },
      }
    );
  };

  useEffect(() => {
    if (!userReviewerQuery.data) return;

    setUsers(
      userReviewerQuery.data.users.map<UserInviteStatus>((user) => ({
        ...user,
        isInvited: "false",
      }))
    );
  }, [userReviewerQuery.data]);

  return (
    <AuthGuard allowedRole="chief" redirectTo="/dashboard">
      <div className="container my-4 flex flex-col items-stretch gap-4">
        <p className="text-xl font-medium">Invite Reviewers</p>
        <ListLayout
          queryResult={userReviewerQuery}
          useQueryOptionsReturn={{ queryOptions, ...rest }}
          main={
            <>
              <table className="table w-full overflow-x-auto">
                <thead>
                  <tr>
                    <th />
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.length <= 0 ? (
                    <p>No reviewers available</p>
                  ) : (
                    !!userReviewerQuery.data &&
                    users.map((user, index) => (
                      <tr key={user.id} className="hover">
                        <th>
                          {getItemIndex(
                            userReviewerQuery.data._metadata,
                            index
                          )}
                        </th>
                        <td>{user.username}</td>
                        <td>{user.profile?.name}</td>
                        <td>{user.profile?.email}</td>
                        <td>{user.profile?.country}</td>

                        <td>
                          <button
                            disabled={user.isInvited !== "false"}
                            onClick={handleInvite(user.id)}
                            className="btn btn-info btn-sm text-white"
                          >
                            {
                              {
                                true: "Invited",
                                false: "Invite",
                                loading: "Inviting",
                              }[user.isInvited]
                            }
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </>
          }
        />
      </div>
    </AuthGuard>
  );
};

export default InvitePage;
