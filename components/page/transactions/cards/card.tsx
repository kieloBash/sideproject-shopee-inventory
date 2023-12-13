"use client";

// UI
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  Calendar,
  CalendarCheck,
  Check,
  ChevronDownIcon,
  CircleIcon,
  DollarSign,
  MinusCircle,
  ShoppingBag,
} from "lucide-react";

// BACKEND
import dayjs from "dayjs";
import supabase from "@/utils/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { InvoiceType } from "@/lib/interfaces/new.interface";
import { useInvoiceContext } from "@/contexts/InvoiceProvider";

export function MinerCard({
  invoice,
  user_id,
}: {
  invoice: InvoiceType;
  user_id: string;
}) {
  const { setSelectedInvoice, setToggleView, setToggleDelete, setToggleEdit } =
    useInvoiceContext();

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  function getTotalOfCart() {
    const total = invoice.cart.reduce((acc, item) => acc + item, 0);
    return total;
  }

  async function updateStatus() {
    if (!invoice) return null;
    setIsLoading(true);
    const newStatus = invoice.status === "Pending" ? "Confirmed" : "Pending";

    const currDate = newStatus === "Confirmed" ? new Date() : null;

    const res = await supabase
      .from("invoices_transaction")
      .update({
        ["status"]: newStatus,
        ["confirm_date"]: currDate,
      })
      .eq("id", invoice.id);

    const miner = await supabase
      .from("miner")
      .select("*")
      .eq("id", invoice.miner_id)
      .single();

    let newMiner;

    if (newStatus === "Confirmed") {
      newMiner = await supabase
        .from("miner")
        .update({
          ["rewardpts"]: miner.data.rewardpts + 1,
        })
        .eq("id", miner.data.id);

      const newIncome = await supabase
        .from("income")
        .insert({
          user_id,
          date: currDate,
          source: "Shopee - Live",
          amount: getTotalOfCart(),
          description: `Mined Confirmed by: ${invoice.miner?.name}`,
        })
        .select("*")
        .single();
    } else {
      newMiner = await supabase
        .from("miner")
        .update({
          ["rewardpts"]: miner.data.rewardpts - 1,
        })
        .eq("id", miner.data.id);
    }

    if (res.error) console.log(res);
    else {
      queryClient.invalidateQueries({
        queryKey: [`invoices`],
      });
      toast({
        title: `${newStatus} invoice ${invoice.miner?.name}`,
        variant: `${newStatus === "Confirmed" ? "success" : "destructive"}`,
      });
      setIsLoading(false);
    }
  }
  return (
    <Card>
      <CardHeader className="grid grid-cols-3 items-start gap-4 space-y-0">
        <div className="space-y-1 col-span-1">
          <CardTitle className="text-xl">{invoice.miner?.name}</CardTitle>
          <CardDescription>
            <div className="flex items-center">
              <ShoppingBag className="mr-1 h-3 w-3" />
              {invoice.cart.length} items
            </div>
            <div className="flex items-center w-60">
              <BadgeCheck className="mr-1 h-3 w-3" />
              {invoice.free_items} free
            </div>
            <div className="flex items-center w-60">
              <DollarSign className="mr-1 h-3 w-3" />
              {getTotalOfCart().toLocaleString()} total
            </div>
          </CardDescription>
        </div>
        <div className="col-span-2 flex justify-end items-center">
          <div className="flex items-center space-x-1 rounded-md bg-secondary text-secondary-foreground">
            <Button
              disabled={isLoading}
              onClick={updateStatus}
              variant="secondary"
              className={`${
                invoice.status === "Confirmed" && "text-main-default"
              } px-2 shadow-none`}
            >
              <Check className={`mr-2 h-4 w-4`} />
              Mined
            </Button>
            <Separator orientation="vertical" className="h-[20px]" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="px-2 shadow-none">
                  <ChevronDownIcon className="h-4 w-4 text-secondary-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                alignOffset={-5}
                className="w-[200px]"
                forceMount
              >
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setToggleEdit(true);
                  }}
                >
                  <PenBox className="mr-2 h-4 w-4" /> Edit Name
                </DropdownMenuItem> */}
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setToggleView(true);
                  }}
                >
                  <ShoppingBag className="mr-2 h-4 w-4" /> Cart
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    setSelectedInvoice(invoice);
                    setToggleDelete(true);
                  }}
                >
                  <MinusCircle className="mr-2 h-4 w-4" /> Delete Miner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <CircleIcon
              className={`mr-1 h-3 w-3 ${
                invoice.status === "Confirmed"
                  ? "fill-green-400 text-green-400"
                  : "fill-yellow-400 text-yellow-400"
              }`}
            />
            {invoice.status === "Confirmed" ? "Done" : "Pending"}
          </div>
          <div className="flex col-span-2 gap-2">
            <div className="flex justify-start items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="">
                {dayjs(new Date(invoice.created_at)).format("MMM D")}
              </span>
            </div>
            <div className="flex items-center">
              <CalendarCheck className="mr-1 h-3 w-3" />
              <span className="">
                {invoice.confirm_date
                  ? dayjs(new Date(invoice.confirm_date)).format("MMM D")
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
