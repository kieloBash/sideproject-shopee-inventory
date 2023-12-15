"use client";
import React, { useMemo } from "react";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import useFetchWeekRevenue from "@/hooks/useWeekRevenue";
import dayjs from "dayjs";

const WeekCard = ({ date }: { date: Date | undefined }) => {
  const revenue = useFetchWeekRevenue({ date });

  const total: number = useMemo(() => {
    const income = (revenue?.data?.income || []).reduce((acc, d) => {
      return acc + (d.amount || 0);
    }, 0);
    const expense = (revenue?.data?.expense || []).reduce((acc, d) => {
      return acc + (d.amount || 0);
    }, 0);

    return income - expense;
  }, [revenue]);

  let startWeek;
  let endWeek;

  startWeek = dayjs(date).startOf("week").format("MMM DD");
  endWeek = dayjs(date).endOf("week").format("MMM DD");

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Weekly Revenue</CardTitle>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          className="h-4 w-4 text-muted-foreground"
        >
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      </CardHeader>
      <CardContent>
        {revenue.isLoading ? (
          <>
            <Skeleton className="w-48 h-14 rounded-md" />
          </>
        ) : (
          <>
            <div className="text-4xl font-bold">₱ {total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">
              ({startWeek} - {endWeek})
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeekCard;
