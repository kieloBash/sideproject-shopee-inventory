"use client";

import { ExpenseType, IncomeType } from "@/lib/interfaces/new.interface";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

const useFetchWeekRevenue = ({
  date = new Date(),
}: {
  date: Date | undefined;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [`revenue:week`, date],
    queryFn: async () => {
      let supabaseQuery = supabase.from("income").select("*");

      // Filter for timestamps on the specified date (UTC)
      let startWeek;
      let endWeek;

      startWeek = dayjs(date).startOf("week").toDate();
      endWeek = dayjs(date).endOf("week").toDate();

      const startDate = new Date(
        Date.UTC(
          startWeek.getFullYear(),
          startWeek.getMonth(),
          startWeek.getDate(),
          0,
          0,
          0,
          0
        )
      );
      const endDate = new Date(
        Date.UTC(
          endWeek.getFullYear(),
          endWeek.getMonth(),
          endWeek.getDate(),
          23,
          59,
          59,
          999
        )
      );

      supabaseQuery = supabaseQuery
        .filter("date", "gte", startDate.toISOString())
        .filter("date", "lte", endDate.toISOString());

      const { data: income } = await supabaseQuery;

      let expenseQuery = supabase
        .from("expense")
        .select("*")
        .filter("date", "gte", startDate.toISOString())
        .filter("date", "lte", endDate.toISOString());
      const { data: expense } = await expenseQuery;

      const incomeData = income as IncomeType[];
      const expenseData = expense as ExpenseType[];

      return { income: incomeData, expense: expenseData };
    },
    enabled: date !== undefined,
  });
  return { data, isLoading };
};

export default useFetchWeekRevenue;
