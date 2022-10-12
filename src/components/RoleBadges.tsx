import React from "react";
import { roleMap } from "../utils/role";

type RoleBadgesProps = {
  role: number;
};

const RoleBadges = ({ role }: RoleBadgesProps) => {
  const parsedRole = roleMap[role];

  return (
    <div className="flex flex-wrap gap-1">
      {role === 0 ? (
        <div className="badge">reader</div>
      ) : (
        <>
          {parsedRole?.admin && <div className="badge badge-ghost">admin</div>}
          {parsedRole?.chief && (
            <div className="badge badge-accent">chief editor</div>
          )}
          {parsedRole?.reviewer && (
            <div className="badge badge-secondary">reviewer</div>
          )}
          {parsedRole?.author && (
            <div className="badge badge-primary">author</div>
          )}
        </>
      )}
    </div>
  );
};

export default RoleBadges;
