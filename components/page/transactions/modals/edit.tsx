"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceContext } from "@/contexts/InvoiceProvider";
import { InvoiceType } from "@/lib/interfaces/new.interface";
import supabase from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

export function EditMinerModal() {
  const { toggleEdit, setToggleEdit, setSelectedInvoice, selectedInvoice } =
    useInvoiceContext();

  const [name, setName] = useState<string>(selectedInvoice?.miner?.name || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const noChanges = useMemo(() => {
    if (name !== selectedInvoice?.miner?.name) return false;

    return true;
  }, [name]);

  const queryClient = useQueryClient();

  async function updateMiner(minerToUpdate: InvoiceType) {
    setIsLoading(true);
    const res = await supabase
      .from("invoices_transaction")
      .update({
        ...minerToUpdate,
        ["cart"]: minerToUpdate.cart,
        ["free_items"]: minerToUpdate.free_items,
      })
      .eq("id", minerToUpdate.id);

    if (res.error) console.log(res);
    else {
      queryClient.invalidateQueries({
        queryKey: [`miners`],
      });
      queryClient.invalidateQueries({
        queryKey: [`miner-dates`],
      });
      setToggleEdit(false);
      setSelectedInvoice(undefined);
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!selectedInvoice) return null;
    const newMiner: InvoiceType = { ...selectedInvoice };
    await updateMiner(newMiner);
  }

  return (
    <Dialog
      open={toggleEdit}
      onOpenChange={(e) => {
        setToggleEdit(e);
        setSelectedInvoice(undefined);
      }}
    >
      <DialogContent className="max-w-[320px] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Edit InvoiceType</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={noChanges || isLoading}
            type="button"
            onClick={handleSave}
          >
            Save Changes{" "}
            {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-2" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
