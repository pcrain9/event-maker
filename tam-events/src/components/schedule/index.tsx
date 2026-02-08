import type { ScheduleProps } from "../../types";
import { ScheduleAccordion } from "../accordion";

type ScheduleComponentProps = ScheduleProps & {
  defaultOpen?: boolean;
};

export const Schedule = ({ day, defaultOpen }: ScheduleComponentProps) => {
  return <ScheduleAccordion day={day} defaultOpen={defaultOpen} />;
};
