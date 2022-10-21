import classNames from "classnames";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DashboardReviewerLayout from "../../../components/layout/dashboard/DashboardReviewerLayout";
import ListLayout from "../../../components/layout/dashboard/ListLayout";
import { INVITATION_LIST_FILTERS } from "../../../constants/filters";
import { INVITATION_STATUS } from "../../../constants/numbers";
import { INVITATION_LIST_SORTS } from "../../../constants/sorts";
import { invitationListQuery } from "../../../server/queries";
import getSortOrder from "../../../utils/getSortOrder";
import { parseDate } from "../../../utils/parseDate";
import { toastSettleHandler } from "../../../utils/toastSettleHandler";
import { trpc } from "../../../utils/trpc";
import { useQueryOptions } from "../../../utils/useQueryOptions";

const sortOrders = getSortOrder(INVITATION_LIST_SORTS);

type QueryOptions = typeof invitationListQuery;
type Sorts = typeof INVITATION_LIST_SORTS[number];
type Filters = typeof INVITATION_LIST_FILTERS[number];

type InvitationStatus = {
  isLoading: boolean;
  createdAt: Date;
  updatedAt: Date;
  status: number;
  id: string;
  team: {
    manuscript: {
      title: string;
      abstract: string;
      authors: string;
      isBlind: boolean;
    };
    _count: {
      users: number;
    };
  };
};

const DashboardReviewerInvitationsPage = () => {
  const router = useRouter();
  const { queryOptions, ...rest } = useQueryOptions<
    QueryOptions,
    Sorts,
    Filters
  >(
    {
      sort: sortOrders[0]!.sort,
      order: sortOrders[0]!.order,
    },
    INVITATION_LIST_SORTS,
    INVITATION_LIST_FILTERS
  );
  const invitationListQuery = trpc.invitation.list.useQuery(queryOptions);
  const [invitations, setInvitations] = useState<InvitationStatus[]>([]);
  const updateInvitation = trpc.invitation.update.useMutation({
    onSettled: (data, error) => toastSettleHandler(data?.message, error),
  });

  const handleAnswerInvitation = (id: string, status: boolean) => {
    setInvitations((prevState) => {
      const index = prevState.findIndex((e) => e.id === id);
      const newState = prevState;
      newState[index] = {
        ...newState[index],
        isInvited: "loading",
      } as InvitationStatus;
      return [...newState];
    });

    updateInvitation.mutate(
      { id, status },
      {
        onSettled: (data) => {
          setInvitations((prevState) => {
            const index = prevState.findIndex((e) => e.id === id);
            const newState = prevState;

            newState[index] = {
              ...newState[index],
              status: status
                ? INVITATION_STATUS.accepted
                : INVITATION_STATUS.rejected,
              isInvited: "true",
            } as InvitationStatus;

            return [...newState];
          });

          if (data && data.manuscriptId) {
            router.push(`/dashboard/reviewer/assignments/${data.manuscriptId}`);
          }
          invitationListQuery.refetch();
        },
      }
    );
  };

  useEffect(() => {
    if (!invitationListQuery.data) return;

    setInvitations(
      invitationListQuery.data.invitations.map<InvitationStatus>((user) => ({
        ...user,
        isLoading: false,
      }))
    );
  }, [invitationListQuery.data]);

  return (
    <DashboardReviewerLayout>
      <p className="text-xl font-medium">Invitation List</p>
      <ListLayout
        queryResult={invitationListQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        main={invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="card card-side bg-base-100 shadow-lg"
          >
            <figure
              className={classNames({
                "w-4": true,
                "bg-error": invitation.status === 1,
                "bg-success": invitation.status === 2,
                "bg-gray-200": invitation.status === 0,
              })}
            />
            <div className="card-body gap-0 rounded-l-none rounded-r-2xl rounded-b-2xl border p-4">
              <h2 className="card-title justify-between">
                <p>{invitation.team.manuscript.title}</p>
                <p className="text-right">
                  Current Reviewers : {invitation.team._count.users}
                </p>
              </h2>
              {!invitation.team.manuscript.isBlind && (
                <p>{invitation.team.manuscript.authors}</p>
              )}
              <p className="text-gray-400">Abstract</p>
              <p>{invitation.team.manuscript.abstract}</p>
              <div className="card-actions items-end">
                <p className="text-gray-400">
                  Invited at : {parseDate(invitation.createdAt)}
                </p>
                {invitation.status === 0 ? (
                  invitation.isLoading ? (
                    <button
                      disabled
                      className="btn btn-success btn-sm text-white"
                    >
                      Loading...
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          handleAnswerInvitation(invitation.id, true)
                        }
                        className="btn btn-success btn-sm text-white"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() =>
                          handleAnswerInvitation(invitation.id, false)
                        }
                        className="btn btn-error btn-sm text-white"
                      >
                        Reject
                      </button>
                    </>
                  )
                ) : (
                  <p className="text-right text-gray-400">
                    Answered at {parseDate(invitation.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      />
    </DashboardReviewerLayout>
  );
};

export default DashboardReviewerInvitationsPage;
