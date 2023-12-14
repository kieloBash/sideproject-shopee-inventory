"use client";
import useFetchMiners from "@/hooks/useMiners";
import React, { useState } from "react";

// UI
import { MinerCard } from "./cards/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Menu,
  Plus,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useUniqueDates from "@/hooks/useUniqueDates";
import dayjs from "dayjs";
import { ViewMinersModal } from "./modals/view";
import { DeleteMinerModal } from "./modals/delete";
import { AddMinerModal } from "./modals/add";
import { ListMinerModal } from "./modals/lists";
import useFetchInvoices from "@/hooks/useInvoices";
import { useInvoiceContext } from "@/contexts/InvoiceProvider";
import { useSession } from "next-auth/react";
import { StatusMinerFilterType } from "@/lib/interfaces/new.interface";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckOutMinerModal } from "./modals/checkout";

const TransactionComponent = ({
  dateString,
  searchMinerString,
}: {
  dateString: string | undefined;
  searchMinerString: string;
}) => {
  const [filter, setFilter] = useState<StatusMinerFilterType>("All");
  const [date, setDate] = useState<Date | undefined>(
    dateString ? new Date(dateString) : new Date()
  );
  const [stringVal, setStringVal] = useState<string>(searchMinerString || "");
  const { data: session } = useSession();

  const { selectedInvoice } = useInvoiceContext();

  const uniqueDates = useUniqueDates();
  const invoices = useFetchInvoices({
    filter,
    date,
    search: searchMinerString,
  });

  // PATH
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const minerParams = params.get("searchMiner");
  const dateParams = params.get("date");

  return (
    <>
      {selectedInvoice && <ViewMinersModal />}
      {selectedInvoice && <DeleteMinerModal />}
      {selectedInvoice && <CheckOutMinerModal />}
      <AddMinerModal />
      <ListMinerModal date={date} />

      <form
        className="flex items-center px-3 border rounded-md mb-2"
        onSubmit={(event) => {
          event.preventDefault();
          const newURL = `${pathname}?date=${dateParams}&searchMiner=${stringVal}`; // Construct the new URL with the formatted date as a query parameter
          console.log(newURL);
          router.push(newURL, undefined);
        }}
      >
        <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
        <input
          className="flex w-full py-3 text-sm bg-transparent rounded-md outline-none h-11 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Search a user..."
          value={stringVal}
          onChange={(e) => setStringVal(e.target.value)}
          name="searchMiner"
        />
        {stringVal !== "" && (
          <div className="flex gap-1">
            <Button
              type="button"
              onClick={() => {
                setStringVal("");
                router.replace("/transactions");
              }}
              size={"icon"}
              variant={"ghostBtn"}
              className="w-5 h-5"
            >
              <X />
            </Button>
            <Button type="submit" variant={"ghostBtn"} className="h-5">
              Search
            </Button>
          </div>
        )}
      </form>
      <div className="w-full flex gap-2 justify-start items-center">
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
                const newURL = `${pathname}?date=${newDate}&searchMiner=${minerParams ? minerParams : ""}`; // Construct the new URL with the formatted date as a query parameter
                console.log(newURL);
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
        <Select
          value={filter}
          onValueChange={(e) => setFilter(e as StatusMinerFilterType)}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Select a filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Filter</SelectLabel>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {invoices.isLoading ? (
        <div className="flex flex-col gap-1.5 py-2">
          {Array(3)
            .fill([])
            .map((_, index) => {
              return (
                <Skeleton
                  key={index}
                  className="w-full rounded-lg h-36"
                ></Skeleton>
              );
            })}
        </div>
      ) : (
        <>
          {invoices.data && invoices.data.length > 0 ? (
            <>
              <ScrollArea className="px-2 w-full h-[calc(100vh-14rem)] mt-2">
                <div className="w-full py-2 h-full flex flex-col gap-1.5">
                  {invoices?.data?.map((invoice) => {
                    return (
                      <MinerCard
                        // @ts-ignore
                        user_id={(session?.user?.id as string) || ""}
                        invoice={invoice}
                        key={invoice.id}
                      />
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="w-full flex justify-end items-center mt-2">
                <span className="text-sm text-foreground">
                  {invoices.data.length} results
                </span>
              </div>
            </>
          ) : (
            <div className="text-center mt-4 w-full h-full justify-center items-center">
              <span className="">No Results Found</span>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default TransactionComponent;
