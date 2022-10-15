import { NextPage } from "next/types";
import React, { useState } from "react";
import DashboardAdminLayout from "../../../../components/layout/dashboard/DashboardAdminLayout";
import ListLayout from "../../../../components/layout/dashboard/ListLayout";
import { trpc } from "../../../../utils/trpc";
import { FaTrashAlt } from "react-icons/fa";
import parseDate from "../../../../utils/parseDate";
import Link from "next/link";
import { z } from "zod";
import {
  QUESTION_LIST_SORTS,
  USER_LIST_SORTS,
} from "../../../../constants/sorts";
import getSortOrder from "../../../../utils/getSortOrder";
import getItemIndex from "../../../../utils/getItemIndex";
import { questionListQuery } from "../../../../server/queries";
import { toastSettleHandler } from "../../../../utils/toastSettleHandler";

const sortOrders = getSortOrder(QUESTION_LIST_SORTS);
type QuestionListSorts = typeof QUESTION_LIST_SORTS[number];
type QuestionListQuery = Omit<z.infer<typeof questionListQuery>, "sort"> & {
  sort: QuestionListSorts;
};

const DashboardAdminQuestionsPage: NextPage = () => {
  const [queryOptions, setQueryOptions] = useState<QuestionListQuery>({
    sort: sortOrders[0]?.sort,
    order: sortOrders[0]?.order,
  } as QuestionListQuery);
  const questionListQuery = trpc.question.list.useQuery(queryOptions);
  const { mutate: deleteMutate } = trpc.question.delete.useMutation({
    onSettled: toastSettleHandler(),
  });

  const handleChangeSort = (sort: QuestionListSorts, order: "asc" | "desc") => {
    setQueryOptions((state) => ({
      ...state,
      sort,
      order,
    }));
  };

  const handleChangePage = (page: number) =>
    setQueryOptions((state) => ({ ...state, page }));

  const handleDelete = (id: string, question: string) => {
    if (confirm(`Delete question '${question}'?\n\nID : ${id}`))
      deleteMutate(id, { onSuccess: () => questionListQuery.refetch() });
  };
  return (
    <DashboardAdminLayout>
      <p className="text-xl font-medium">Question List</p>
      <ListLayout
        queryResult={questionListQuery}
        sortOrders={sortOrders}
        allowedSorts={USER_LIST_SORTS}
        onChangePage={handleChangePage}
        onChangeSort={handleChangeSort}
        create={
          <Link href="/dashboard/admin/questions/create">
            <a className="btn btn-info btn-sm text-white">
              New Review Question
            </a>
          </Link>
        }
        main={
          <>
            <table className="table w-full overflow-x-auto">
              <thead>
                <tr>
                  <th />
                  <th>Question</th>
                  <th>Max Scale</th>
                  <th>Date Created</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {questionListQuery.data?.questions.map((question, index) => (
                  <tr key={question.id} className="hover">
                    <th>
                      {getItemIndex(questionListQuery.data._metadata, index)}
                    </th>
                    <td>
                      <Link href={`/dashboard/admin/questions/${question.id}`}>
                        <a className="link">{question.question}</a>
                      </Link>
                    </td>
                    <td>{question.maxScale}</td>
                    <td>{parseDate(question.createdAt)}</td>
                    <td>
                      <div
                        onClick={() =>
                          handleDelete(question.id, question.question)
                        }
                      >
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

export default DashboardAdminQuestionsPage;
