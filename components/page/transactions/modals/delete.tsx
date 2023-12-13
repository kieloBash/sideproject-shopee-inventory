"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useInvoiceContext } from "@/contexts/InvoiceProvider";
import supabase from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";

export function DeleteMinerModal() {
  const { selectedInvoice, setSelectedInvoice, toggleDelete, setToggleDelete } =
    useInvoiceContext();

  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  async function deleteMiner() {
    if (selectedInvoice === undefined) return null;
    setIsLoading(true);

    const res = await supabase
      .from("invoices_transaction")
      .delete()
      .eq("id", selectedInvoice.id);

    if (res.error) {
      console.log(res);
      setIsLoading(false);
    } else {
      setToggleDelete(false);
      setSelectedInvoice(undefined);
      setIsLoading(false);

      queryClient.invalidateQueries({
        queryKey: ["invoices-dates"],
      });
      queryClient.invalidateQueries({
        queryKey: [`invoices`],
      });
    }
  }
  return (
    <AlertDialog
      open={toggleDelete}
      onOpenChange={(e) => {
        setToggleDelete(e);
        setSelectedInvoice(undefined);
      }}
    >
      <AlertDialogContent className="max-w-[320px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete invoice{" "}
            <span className="font-bold underline underline-offset-2">
              Cart: ({selectedInvoice?.cart.join(",")}) |{" "}
              {selectedInvoice?.free_items} free
            </span>{" "}
            and cannot be undone
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => {
              setSelectedInvoice(undefined);
            }}
          >
            Cancel
          </AlertDialogCancel>
          <Button disabled={isLoading} onClick={deleteMiner}>
            Continue{" "}
            {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-2" />}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
