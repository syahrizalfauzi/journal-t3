import classNames from "classnames";
import Link from "next/link";
import React from "react";
import DashboardReviewerLayout from "../../../../components/layout/dashboard/DashboardReviewerLayout";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import StatusBadge from "../../../../components/StatusBadge";
import { MANUSCRIPT_REVIEWER_FILTERS } from "../../../../constants/filters";
import { manuscriptReviewerQuery } from "../../../../server/queries";
import parseDate from "../../../../utils/parseDate";
import { trpc } from "../../../../utils/trpc";
import { useQueryOptions } from "../../../../utils/useQueryOptions";

type QueryOptions = typeof manuscriptReviewerQuery;
type Filters = typeof MANUSCRIPT_REVIEWER_FILTERS[number];

const DashboardReviewerAssignmentsPage = () => {
  const { queryOptions, ...rest } = useQueryOptions<
    QueryOptions,
    never,
    Filters
  >({}, undefined, MANUSCRIPT_REVIEWER_FILTERS);
  const manuscriptReviewerQuery =
    trpc.manuscript.listForReviewer.useQuery(queryOptions);

  return (
    <DashboardReviewerLayout>
      <p className="text-xl font-medium">Assignment List</p>
      <ListLayout
        queryResult={manuscriptReviewerQuery}
        useQueryOptionsReturn={{ queryOptions, ...rest }}
        main={
          (manuscriptReviewerQuery.data?.manuscripts.length ?? 0) <= 0 ? (
            <p>You have no assignments</p>
          ) : (
            manuscriptReviewerQuery.data?.manuscripts.map((assignment) => {
              if (!assignment.history[0]) return;

              const assessmentLength =
                assignment.history[0].review?.assesment.length ?? 0;
              return (
                <Link
                  key={assignment.id}
                  href={`/dashboard/reviewer/assignments/${assignment.id}`}
                >
                  <a className="card card-side shadow-lg transition-all duration-100 hover:bg-gray-100">
                    <figure
                      className={classNames({
                        "bg-success": assessmentLength > 0,
                        "bg-gray-200": assessmentLength <= 0,
                        "w-4": true,
                      })}
                    />
                    <div className="card-body gap-2 rounded-l-none rounded-r-2xl rounded-b-2xl border p-4">
                      <h2 className="card-title justify-between">
                        <p>{assignment.title}</p>
                        {assignment.reviewerNumber > 0 && (
                          <p className="text-right">
                            Reviewer Number: {assignment.reviewerNumber}
                          </p>
                        )}
                      </h2>
                      <p className="text-gray-400">
                        Submitted: {parseDate(assignment.createdAt)}
                      </p>
                      <p className="text-gray-400">
                        Last Updated:{" "}
                        {parseDate(assignment.history[0].updatedAt)}
                      </p>
                      <div className="card-actions items-end">
                        <StatusBadge
                          history={assignment.history[0]}
                          role="reviewer"
                          hasSelfAssessment={
                            (assignment.history[0].review?.assesment.length ??
                              1) > 0
                          }
                        />
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })
          )
        }
      />
    </DashboardReviewerLayout>
  );
};

export default DashboardReviewerAssignmentsPage;
