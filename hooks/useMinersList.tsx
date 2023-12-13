"use client";

import { InvoiceType } from "@/lib/interfaces/new.interface";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

const useFetchMinersList = ({
  date = new Date(),
}: {
  date: Date | undefined;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [`invoices`, date],
    queryFn: async () => {
      let supabaseQuery = supabase
        .from("invoices_transaction")
        .select("*, miner: miner_id(name)");

      // Filter for timestamps on the specified date (UTC)
      const startDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        )
      );
      const endDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          23,
          59,
          59,
          999
        )
      );

      supabaseQuery = supabaseQuery
        .filter("created_at", "gte", startDate.toISOString())
        .filter("created_at", "lte", endDate.toISOString());

      const { data, error } = await supabaseQuery;

      return data as InvoiceType[];
    },
    enabled: date !== undefined,
  });
  return { data, isLoading };
};

export default useFetchMinersList;
