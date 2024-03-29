import React from "react";
import { ROLE_MAP } from "../constants/role";

type RoleBadgesProps = {
  role: number;
};

export const RoleBadges = ({ role }: RoleBadgesProps) => {
  const parsedRole = ROLE_MAP[role];

  return (
    <div className="flex flex-wrap gap-1">
      {role === 0 ? (
        <div className="badge">reader</div>
      ) : (
        <>
          {parsedRole?.isAdmin && (
            <div className="badge badge-ghost">admin</div>
          )}
          {parsedRole?.isChief && (
            <div className="badge badge-accent">chief editor</div>
          )}
          {parsedRole?.isReviewer && (
            <div className="badge badge-secondary">reviewer</div>
          )}
          {parsedRole?.isAuthor && (
            <div className="badge badge-primary">author</div>
          )}
        </>
      )}
    </div>
  );
};
