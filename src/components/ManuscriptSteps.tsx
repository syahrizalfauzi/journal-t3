import React from "react";
import { HISTORY_STATUS } from "../constants/numbers";
import { MANUSCRIPT_STEPS_LABEL } from "../constants/others";

interface ManuscriptStepsProps {
  status: number | typeof HISTORY_STATUS[keyof typeof HISTORY_STATUS];
}

const ManuscriptSteps = ({ status }: ManuscriptStepsProps) => {
  return (
    <ul className="steps">
      {status === -1 && <li className="step step-primary">Rejected</li>}
      {MANUSCRIPT_STEPS_LABEL.map((step, index) => (
        <li
          key={index}
          className={`step ${status >= index ? "step-primary" : ""}`}
        >
          {step}
        </li>
      ))}
    </ul>
  );
};

export default ManuscriptSteps;
