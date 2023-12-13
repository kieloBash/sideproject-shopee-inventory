"use client";

// UI
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import useFetchMinersList from "@/hooks/useMinersList";
import { Copy, Menu } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useToast } from "@/components/ui/use-toast";
import { InvoiceType } from "@/lib/interfaces/new.interface";
import QRCode from "qrcode.react";
import { useState } from "react";
import { Label } from "@/components/ui/label";

export function ListMinerModal({ date }: { date: Date | undefined }) {
  const list = useFetchMinersList({ date });
  const { toast } = useToast();

  type CombinedInvoices = {
    totalPrice: number;
    totalItems: number;
    totalFree: number;
    miner_name: string;
    created_at: Date;
    totalCart: number[];
    id: string;
  };

  const [selectedInvoice, setSelectedInvoice] = useState<CombinedInvoices>();

  const combinedInvoice: CombinedInvoices[] = (list?.data || [])
    .filter((invoice) => invoice.status === "Confirmed") // Filter miners with status "Confirmed"
    .reduce((accumulator: CombinedInvoices[], currentInvoice: InvoiceType) => {
      const existingMinerIndex = accumulator.findIndex(
        (invoice) => invoice.miner_name === currentInvoice?.miner?.name
      );

      if (existingMinerIndex !== -1) {
        // Update existing combined invoice
        accumulator[existingMinerIndex].totalPrice +=
          currentInvoice.cart.reduce((sum, value) => sum + value, 0);
        accumulator[existingMinerIndex].totalItems +=
          currentInvoice.cart.length;
        accumulator[existingMinerIndex].totalFree += currentInvoice.free_items;
        accumulator[existingMinerIndex].totalCart = accumulator[
          existingMinerIndex
        ].totalCart.concat(currentInvoice.cart);
      } else {
        // Add new combined invoice
        const newCombinedMiner: CombinedInvoices = {
          totalPrice: currentInvoice.cart.reduce(
            (sum, value) => sum + value,
            0
          ),
          totalItems: currentInvoice.cart.length,
          totalFree: currentInvoice.free_items,
          miner_name: currentInvoice?.miner?.name || "",
          created_at: currentInvoice.created_at,
          totalCart: currentInvoice.cart.slice(), // Clone the array
          id: currentInvoice.miner_id,
        };
        accumulator.push(newCombinedMiner);
      }

      return accumulator;
    }, []);

  const handleCopyClick = async (data: CombinedInvoices) => {
    try {
      let total = 0;
      let tempDate = new Date(data.created_at);
      data.totalCart.forEach((item) => (total += item));

      let link = "";

      if (data.totalCart.length >= 5 && data.totalCart.length <= 8) {
        link =
          "https://shopee.ph/product/465440520/20517586187?utm_campaign=-&utm_content=----&utm_medium=affiliates&utm_source=an_13000970014&utm_term=9r9avpf8rk4o";
      } else if (data.totalCart.length > 8) {
        link =
          "https://shopee.ph/product/465440520/22571943292?utm_campaign=-&utm_content=----&utm_medium=affiliates&utm_source=an_13000970014&utm_term=9r9ayu3bb82j";
      }
      const textToCopy = `Miner: ${data.miner_name} (${
        data.totalCart.length
      } Items) | (${data.totalFree} Free)\nItems: ${data.totalCart.join(
        " + "
      )}\nTotal: ₱${total}\nDate Mined: ${tempDate.toDateString()}
      \n${link}
      \n To view your reward points visit this site or scan the QR code: https://sideproject-shopee-rewards.vercel.app/${
        data.id
      }`;

      await navigator.clipboard.writeText(textToCopy);
    } catch (error) {
      console.error("Failed to copy text:", error);
    } finally {
      toast({
        description: `Copied Successfully`,
        variant: "success",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed z-[10] left-1/2 -translate-x-1/2 bottom-4 w-12 h-12 shadow p-2 rounded-full ml-8">
          <Menu className="w-full h-full" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-[360px]">
        <DialogHeader>
          <DialogTitle>Confirmed Miners List</DialogTitle>
          <DialogDescription>
            Here are the list of miners that are confirmed
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96 w-full rounded-md border">
          <div className="p-4">
            {combinedInvoice.map((invoice, index) => (
              <>
                <div
                  key={invoice.miner_name}
                  className="grid grid-cols-6 text-xs"
                >
                  <div className="line-clamp-1 flex justify-start col-span-2 items-center">
                    {invoice.miner_name}
                  </div>
                  <div className="flex justify-start items-center col-span-2 font-medium">
                    ₱ {invoice.totalPrice.toLocaleString()}({invoice.totalItems}
                    )
                  </div>
                  <div className="flex justify-center items-center">
                    {invoice.totalFree}
                  </div>
                  <div className="flex justify-center items-center">
                    <Button
                      type="button"
                      variant={"ghostBtn"}
                      className="w-5 h-5 p-0"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        handleCopyClick(invoice);
                      }}
                    >
                      <Copy className="w-full h-full" />
                    </Button>
                  </div>
                </div>
                <Separator className="my-2" />
              </>
            ))}
          </div>
        </ScrollArea>
        {selectedInvoice && (
          <section
            className="fixed z-[100] inset-0 bg-white flex-col flex justify-center items-center"
            onClick={() => setSelectedInvoice(undefined)}
          >
            <Label className="mb-2 font-medium text-main-default">Rewards QR Link</Label>
            <div className="">
              <QRCode
                size={250}
                fgColor={"#ca5371"}
                value={`https://sideproject-shopee-rewards.vercel.app/${
                  selectedInvoice?.id || ""
                }`}
              />
            </div>
          </section>
        )}
      </DialogContent>
    </Dialog>
  );
}
