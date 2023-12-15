"use client";

// UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const FormSchema = z.object({
  cart: z.array(z.number()).refine(
    (value) => {
      return (
        value.length > 0 &&
        value.some((item) => item !== undefined && item !== null)
      );
    },
    {
      message: "You have to select at least one item.",
    }
  ),
});

// BACKEND
import { useInvoiceContext } from "@/contexts/InvoiceProvider";
import supabase from "@/utils/supabase";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserType } from "@/lib/interfaces/user.interface";

export function CheckOutMinerModal() {
  const {
    toggleCheckout,
    setToggleCheckout,
    setSelectedInvoice,
    selectedInvoice,
  } = useInvoiceContext();
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const user = session?.user as UserType;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cart: Array(selectedInvoice?.cart.length)
        .fill([])
        .map((_, index) => index),
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    if (!selectedInvoice) return null;
    setIsLoading(true);
    const cart = compareCarts(selectedInvoice?.cart || [], data.cart);
    let points = 0;

    if (selectedInvoice.status === "Pending") {
      if (cart.differentValues.length === 0) {
        //   GET EXISTING INVOICE OF A CONFIRMED MINER
        const existingConfirmedInvoice = await supabase
          .from("invoices_transaction")
          .select("*")
          .eq("miner_id", selectedInvoice.miner_id)
          .eq("created_at", new Date(selectedInvoice.created_at).toISOString())
          .eq("status", "Confirmed")
          .single();

        points = points + selectedInvoice.cart.length;

        if (existingConfirmedInvoice.data) {
          const updatedExistingInvoice = await supabase
            .from("invoices_transaction")
            .update({
              ["cart"]: [
                ...existingConfirmedInvoice.data.cart,
                ...cart.commonValues,
              ],
              ["free_items"]: existingConfirmedInvoice.data.free_items,
            })
            .eq("id", existingConfirmedInvoice.data.id);
          const res = await supabase
            .from("invoices_transaction")
            .delete()
            .eq("id", selectedInvoice.id);

          const income = await supabase
            .from("income")
            .insert({
              user_id: user.id,
              date: new Date(),
              source: "Business - Shopee",
              amount: getTotalOfCart([
                ...existingConfirmedInvoice.data.cart,
                ...cart.commonValues,
              ]),
              description: `Shopee mined by ${selectedInvoice.miner_name}`,
            })
            .select("*")
            .single();
        } else {
          const res = await supabase
            .from("invoices_transaction")
            .update({
              ["status"]: "Confirmed",
              ["confirm_date"]: new Date(),
            })
            .eq("id", selectedInvoice.id);

          const income = await supabase
            .from("income")
            .insert({
              user_id: user.id,
              date: new Date(),
              source: "Business - Shopee",
              amount: getTotalOfCart(selectedInvoice.cart),
              description: `Shopee mined by ${selectedInvoice.miner_name}`,
            })
            .select("*")
            .single();
        }
      } else if (cart.differentValues.length > 0) {
        const prevInvoice = await supabase
          .from("invoices_transaction")
          .update({
            ["cart"]: cart.differentValues,
            ["free_items"]: 0,
          })
          .eq("id", selectedInvoice.id)
          .single();

        //   GET EXISTING INVOICE OF A CONFIRMED MINER
        const existingConfirmedInvoice = await supabase
          .from("invoices_transaction")
          .select("*")
          .eq("miner_id", selectedInvoice.miner_id)
          .eq("created_at", new Date(selectedInvoice.created_at).toISOString())
          .eq("status", "Confirmed")
          .single();

        if (existingConfirmedInvoice.data) {
          const updatedExistingInvoice = await supabase
            .from("invoices_transaction")
            .update({
              ["cart"]: [
                ...existingConfirmedInvoice.data.cart,
                ...cart.commonValues,
              ],
              ["free_items"]: existingConfirmedInvoice.data.free_items,
            })
            .eq("id", existingConfirmedInvoice.data.id);
          points += cart.commonValues.length;

          const income = await supabase
            .from("income")
            .insert({
              user_id: user.id,
              date: new Date(),
              source: "Business - Shopee",
              amount: getTotalOfCart([
                ...existingConfirmedInvoice.data.cart,
                ...cart.commonValues,
              ]),
              description: `Shopee mined by ${selectedInvoice.miner_name}`,
            })
            .select("*")
            .single();
        } else {
          const CheckOutInvoice = await supabase
            .from("invoices_transaction")
            .insert({
              miner_id: selectedInvoice.miner_id,
              cart: cart.commonValues,
              free_items: selectedInvoice.free_items,
              created_at: selectedInvoice.created_at,
              miner_name: selectedInvoice.miner_name,
              status: "Confirmed",
              confirm_date: new Date(),
            })
            .select("*")
            .single();
          points += cart.commonValues.length;

          const income = await supabase
            .from("income")
            .insert({
              user_id: user.id,
              date: new Date(),
              source: "Business - Shopee",
              amount: getTotalOfCart(cart.commonValues),
              description: `Shopee mined by ${selectedInvoice.miner_name}`,
            })
            .select("*")
            .single();
        }
      }
    } else {
      if (cart.differentValues.length === 0) {
        const res = await supabase
          .from("invoices_transaction")
          .delete()
          .eq("id", selectedInvoice.id);
      } else {
        const res = await supabase
          .from("invoices_transaction")
          .update({
            ["status"]: "Confirmed",
            ["confirm_date"]: null,
            ["cart"]: cart.differentValues,
          })
          .eq("id", selectedInvoice.id);
      }

      points -= cart.differentValues.length;

      const existingPendingInvoice = await supabase
        .from("invoices_transaction")
        .select("*")
        // equal name of the miner from the referenced miner_id and equal created_at
        .eq("miner_id", selectedInvoice.miner_id)
        .eq("created_at", new Date(selectedInvoice.created_at).toISOString())
        .eq("status", "Pending")
        .single();

      if (existingPendingInvoice.data) {
        const updatedExistingInvoice = await supabase
          .from("invoices_transaction")
          .update({
            ["cart"]: [
              ...existingPendingInvoice.data.cart,
              ...cart.commonValues,
            ],
            ["free_items"]: existingPendingInvoice.data.free_items,
          })
          .eq("id", existingPendingInvoice.data.id);
      } else {
        const invoice = await supabase
          .from("invoices_transaction")
          .insert({
            miner_id: selectedInvoice.miner_id,
            cart: cart.commonValues,
            free_items: selectedInvoice.free_items,
            created_at: new Date(selectedInvoice.created_at),
            miner_name: selectedInvoice.miner?.name,
          })
          .select("*")
          .single();
      }
      points -= cart.commonValues.length;
    }
    const miner = await supabase
      .from("miner")
      .select("*")
      .eq("id", selectedInvoice.miner_id)
      .single();

    const newMiner = await supabase
      .from("miner")
      .update({
        ["rewardpts"]: points + miner.data.rewardpts,
      })
      .eq("id", selectedInvoice.miner_id);

    queryClient.invalidateQueries({
      queryKey: ["invoices-dates"],
    });
    queryClient.invalidateQueries({
      queryKey: [`invoices`],
    });
    queryClient.invalidateQueries({
      queryKey: [`miners-search`],
    });
    queryClient.invalidateQueries({
      queryKey: [`miners`],
    });
    queryClient.invalidateQueries({
      queryKey: [`revenue`],
    });
    setSelectedInvoice(undefined);
    setToggleCheckout(false);
    setIsLoading(false);
    form.reset();

    toast({
      title: `Confirmed Miner`,
      variant: `success`,
    });
  }
  function getTotalOfCart(cart: number[]) {
    const total = cart.reduce((acc, item) => acc + item, 0);
    const tax = total * 0.2;
    return total - tax;
  }
  function compareCarts(selectedValues: number[], checkedIndexes: number[]) {
    const commonValues = selectedValues.filter((value, index) =>
      checkedIndexes.includes(index)
    );
    const differentValues = selectedValues.filter(
      (value, index) => !checkedIndexes.includes(index)
    );
    return { commonValues, differentValues };
  }

  if (!user)
    return (
      <div className="flex-1 w-full h-full flex justify-center items-center">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );

  return (
    <Dialog
      open={toggleCheckout}
      onOpenChange={(e) => {
        setToggleCheckout(e);
        setSelectedInvoice(undefined);
      }}
    >
      <DialogContent className="max-w-[320px] sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {selectedInvoice?.status === "Pending"
              ? "Check Out"
              : "Remove Check Out"}
          </DialogTitle>
          <DialogDescription>
            {selectedInvoice?.status === "Pending"
              ? "Select the items to check out."
              : "Select the items to remove from check out."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="cart"
              render={() => (
                <FormItem>
                  <div className="w-full flex justify-center cart-center flex-1">
                    <ScrollArea className="h-40 w-48 flex flex-col">
                      <div className="w-full h-full flex flex-col gap-1">
                        {selectedInvoice?.cart.map((_, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name="cart"
                            render={({ field }) => (
                              <FormItem
                                key={index}
                                className="flex flex-row cart-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(index)}
                                    onCheckedChange={(checked) => {
                                      console.log(checked);
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            index,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== index
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Php{" "}
                                  {selectedInvoice?.cart[
                                    index
                                  ].toLocaleString()}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isLoading} type="submit">
                Confirm{" "}
                {isLoading && <Loader2 className="w-5 h-5 animate-spin ml-2" />}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
