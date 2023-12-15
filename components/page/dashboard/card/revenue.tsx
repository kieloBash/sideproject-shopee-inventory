"use client";
import React, { useMemo } from "react";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetchRevenue from "@/hooks/useRevenue";
import { Circle } from "lucide-react";
import { Label } from "@/components/ui/label";

const Revenue = ({ date }: { date: Date | undefined }) => {
  const revenue = useFetchRevenue({ date });

  const total: number = useMemo(() => {
    const income = (revenue?.data?.income || []).reduce((acc, d) => {
      return acc + (d.amount || 0);
    }, 0);
    const expense = (revenue?.data?.expense || []).reduce((acc, d) => {
      return acc + (d.amount || 0);
    }, 0);

    return income - expense;
  }, [revenue]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Total Revenue</CardTitle>
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
        <div className="text-4xl font-bold">₱ {total.toLocaleString()}</div>
        <Label>Expenses</Label>
        {revenue.data?.expense.map((d, index) => {
          return (
            <p
              key={index}
              className="text-xs text-muted-foreground flex justify-start items-center"
            >
              <Circle className="w-3 h-3 mr-2 bg-main-500 text-main-500 rounded-full" />
              <span className="capitalize">
                ₱ {d.amount.toLocaleString()} | {d.category}
              </span>
            </p>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default Revenue;
