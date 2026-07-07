export interface LabelTotal {
  label: string;
  total_seconds: number;
}

export interface TasksPerDay {
  date: string;
  count: number;
}

export interface Distribution {
  label: string;
  percentage: number;
}

export interface DailySeries {
  date: string;
  total_seconds: number;
}

export interface StatsOut {
  totals_by_label: LabelTotal[];
  tasks_per_day: TasksPerDay[];
  distribution: Distribution[];
  daily_series: DailySeries[];
}