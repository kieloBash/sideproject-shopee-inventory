"use client";

import { MinerType } from "@/lib/interfaces/new.interface";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";

const useFetchMiners = ({
  searchName,
  limit,
}: {
  searchName: string;
  limit: number;
}) => {
  const { data, isLoading } = useQuery({
    queryKey: [`miners`, searchName],
    queryFn: async () => {
      let supabaseQuery = supabase.from("miner").select("*");

      if (searchName) {
        // Use ilike for case-insensitive search
        supabaseQuery = supabaseQuery.filter(
          "name",
          "ilike",
          `%${searchName}%`
        );
        // .limit(limit);
      }
      // Add order by rewardpts
      supabaseQuery = supabaseQuery.order("rewardpts", { ascending: false }); // Set the desired order

      // supabaseQuery = supabaseQuery.limit(limit);
      const { data: miners, error } = await supabaseQuery;

      return miners as MinerType[];
    },
  });

  return { data, isLoading };
};

export default useFetchMiners;
