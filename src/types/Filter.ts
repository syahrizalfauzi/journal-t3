export interface FilterValue {
  value: string;
  label: string;
}

export interface Filter {
  key: string;
  label: string;
  availableValues: readonly FilterValue[];
}
