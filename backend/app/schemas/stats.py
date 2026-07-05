from pydantic import BaseModel


class LabelTotal(BaseModel):
    label: str
    total_seconds: int


class TasksPerDay(BaseModel):
    date: str
    count: int


class Distribution(BaseModel):
    label: str
    percentage: float


class DailySeries(BaseModel):
    date: str
    total_seconds: int


class StatsOut(BaseModel):
    totals_by_label: list[LabelTotal]
    tasks_per_day: list[TasksPerDay]
    distribution: list[Distribution]
    daily_series: list[DailySeries]