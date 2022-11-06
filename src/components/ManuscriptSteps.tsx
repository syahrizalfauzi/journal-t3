import classNames from "classnames";
import React from "react";
import { HISTORY_STATUS } from "../constants/numbers";
import { MANUSCRIPT_STEPS_LABEL } from "../constants/others";

interface ManuscriptStepsProps {
  status: number | typeof HISTORY_STATUS[keyof typeof HISTORY_STATUS];
  short?: boolean;
}

export const ManuscriptSteps = ({ status, short }: ManuscriptStepsProps) => {
  return (
    <ul className="steps -z-10">
      {status === -1 && <li className="step step-primary">Rejected</li>}
      {(short
        ? MANUSCRIPT_STEPS_LABEL.slice(0, 5)
        : MANUSCRIPT_STEPS_LABEL
      ).map((step, index) => (
        <li
          key={index}
          className={classNames(
            {
              "step-primary": status >= index,
            },
            "step"
          )}
        >
          {step}
        </li>
      ))}
    </ul>
  );
};
