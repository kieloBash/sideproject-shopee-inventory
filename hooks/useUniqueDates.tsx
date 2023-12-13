"use client";

import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

const getUniqueCreatedAtValues = async () => {
  const { data, error } = await supabase.rpc("get_unique_created_at_values");

  if (error) {
    console.error("Error fetching unique created_at values:", error.message);
    return null;
  }

  // Extract unique created_at values from the response
  const uniqueCreatedAtValues = data?.map((entry: any) => entry.created_at);

  return uniqueCreatedAtValues || [];
};

const useUniqueDates = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["invoices-dates"],
    queryFn: getUniqueCreatedAtValues,
  });

  const d = data as string[];

  console.log(d);

  return { data: d || [], isLoading };
};

export default useUniqueDates;
