import React from "react";
import { AvailableRoles } from "../types/Role";
import getStatusProps from "../utils/getStatusProps";

type StatusBadgeProps = {
  role: Exclude<AvailableRoles, "admin">;
  history: {
    status: number;
    review?: { decision?: number; dueDate?: Date | null } | null;
  };
  hasSelfAssesment?: boolean;
};

const StatusBadge = ({ hasSelfAssesment, history, role }: StatusBadgeProps) => {
  const { color, label } = getStatusProps(
    history,
    role,
    hasSelfAssesment,
    true
  );

  const colorBg = `bg-${color}`;

  return (
    <div
      className={`rounded-full px-3 py-1 text-center ${
        color !== "gray-200" ? " text-white" : ""
      } ${colorBg}`}
    >
      {label}
    </div>
  );
};

export default StatusBadge;
