"use client";
import { useState } from "react";

// UI
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import dayjs from "dayjs";

// BACKEND
import useUniqueDates from "@/hooks/useUniqueDates";
import useFetchMinersList from "@/hooks/useMinersList";
import { usePathname, useRouter } from "next/navigation";
import Revenue from "./revenue";
import WeekCard from "../week";

export function CardLists({ dateString }: { dateString: string | undefined }) {
  const [date, setDate] = useState<Date | undefined>(
    dateString ? new Date(dateString) : new Date()
  );
  const uniqueDates = useUniqueDates();
  const list = useFetchMinersList({ date });

  const pathname = usePathname();
  const router = useRouter();

  const totalAmountByStatus: Record<string, number> = {
    Pending: 0,
    Confirmed: 0,
  };

  const totalItemsByStatus: Record<string, number> = {
    Pending: 0,
    Confirmed: 0,
  };

  list?.data?.forEach((miner) => {
    const { status, cart } = miner;

    if (status === "Pending" || status === "Confirmed") {
      totalAmountByStatus[status] += cart.reduce(
        (sum, value) => sum + value,
        0
      );
      totalItemsByStatus[status] += cart.length;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex gap-2 justify-between items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(e) => {
                // I want this to add the date to the pathname
                const formattedDate = dayjs(e).format("YYYY-MM-DD");

                const newDate = encodeURIComponent(formattedDate); // Encoding the date if needed
                const newURL = `${pathname}?date=${newDate}`; // Construct the new URL with the formatted date as a query parameter
                router.push(newURL, undefined); // Navigate to the new URL

                setDate(e);
              }}
              disabled={
                (date) => {
                  return (
                    !uniqueDates.data.includes(
                      dayjs(date).format("YYYY-MM-DD")
                    ) || date > new Date()
                  );
                }
                // date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <WeekCard date={date} />
      <Revenue date={date} />
      <div className="grid gap-2 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
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
            <div className="text-2xl font-bold">
              ₱ {totalAmountByStatus["Confirmed"].toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalItemsByStatus["Confirmed"]} items mined
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
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
            <div className="text-2xl font-bold">
              ₱ {totalAmountByStatus["Pending"].toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalItemsByStatus["Pending"]} items mined
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
