"use client";

// UI
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import supabase from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { date } from "zod";

export function DeleteTodayModal({
  dateString,
}: {
  dateString: string | undefined;
}) {
  const dateTodelete = dateString ? new Date(dateString) : new Date();
  const queryClient = useQueryClient();

  async function deleteDate() {
    try {
      if (dateTodelete === undefined) return null;

      const startDate = new Date(
        Date.UTC(
          dateTodelete.getFullYear(),
          dateTodelete.getMonth(),
          dateTodelete.getDate(),
          0,
          0,
          0,
          0
        )
      );
      const endDate = new Date(
        Date.UTC(
          dateTodelete.getFullYear(),
          dateTodelete.getMonth(),
          dateTodelete.getDate(),
          23,
          59,
          59,
          999
        )
      );

      let { data: error } = await supabase
        .from("invoices_transaction")
        .delete()
        .filter("created_at", "gte", startDate.toISOString())
        .filter("created_at", "lte", endDate.toISOString());

      if (error) return;
      else {
        queryClient.invalidateQueries({
          queryKey: [`invoices`],
        });
        queryClient.invalidateQueries({
          queryKey: [`invoices-dates`],
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <CalendarDays className="w-4 h-4 mr-2" />
          Delete Day
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-[350px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete all the records of miners for the date,{" "}
            {dateTodelete.toDateString()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={dateTodelete === undefined}
            onClick={deleteDate}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
