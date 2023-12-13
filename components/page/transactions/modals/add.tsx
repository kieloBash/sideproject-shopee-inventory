"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// FORM
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, Trash } from "lucide-react";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import supabase from "@/utils/supabase";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import useDebounce from "@/hooks/useDebounce";
import useFetchMinersSearch from "@/hooks/useMinersSearch";

const formSchema = z.object({
  free: z.number().gte(0),
});

export function AddMinerModal() {
  const [cart, setCart] = useState<number[]>([]);
  const [item, setItem] = useState<number>(0);
  const [miner_name, setMiner_name] = useState<string>("");
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      free: 0,
    },
  });

  const debouncedSearch = useDebounce(miner_name, 500);
  const searchedMiners = useFetchMinersSearch({ searchName: debouncedSearch });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (cart.length === 0 && miner_name === "") return null;

    const { free } = values;
    const created_at = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );
    setIsLoading(true);

    // const res = await supabase
    //   .from("invoice")
    //   .insert({ miner_name, free, cart, created_at })
    //   .select("*")
    //   .single();

    let miner;

    const existingMiner = await supabase
      .from("miner")
      .select("*")
      .eq("name", miner_name)
      .single();

    if (existingMiner.data) {
      miner = existingMiner;
    } else {
      const newMiner = await supabase
        .from("miner")
        .insert({ name: miner_name })
        .select("*")
        .single();

      if (newMiner.error) {
        console.error("Error creating new miner:", newMiner.error);
        return;
      }
      miner = newMiner;
    }

    const invoice = await supabase
      .from("invoices_transaction")
      .insert({ miner_id: miner.data.id, cart, free_items: free, created_at })
      .select("*")
      .single();

    if (invoice.error) {
      console.log(invoice.error);
      setIsLoading(false);
    } else {
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
      toast({
        title: "Successfully Inserted",
        description: `Mined: ${cart.length}`,
        variant: "success",
      });
      form.reset();
      setCart([]);
      setItem(0);
      setOpen(false);
      setIsLoading(false);
    }
  }
  function handleDeleteItem(index: number) {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  }
  function getTotalOfCart() {
    const total = cart.reduce((acc, item) => acc + item, 0);
    return total;
  }
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="fixed z-[10] right-1/2 translate-x-1/2 bottom-4 w-12 h-12 shadow p-2 rounded-full mr-8">
            <Plus className="w-full h-full" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-w-[320px]">
          <DialogHeader>
            <DialogTitle>Add Miner</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-2"
            >
              <div className="grid w-full max-w-sm items-center gap-1.5 relative">
                <Label>Name</Label>
                <Input
                  type="text"
                  placeholder="Name of Miner"
                  value={miner_name}
                  onChange={(e) => setMiner_name(e.target.value)}
                />
                {searchedMiners?.data !== undefined && (
                  <div className="absolute top-full left-0 bg-white shadow -mt-1 z-[10] w-full">
                    {searchedMiners?.isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </>
                    ) : (
                      <>
                        {searchedMiners?.data.length === 0 ? (
                          <></>
                        ) : (
                          <>
                            {searchedMiners?.data.length === 1 &&
                            searchedMiners?.data[0].name === miner_name ? (
                              <></>
                            ) : (
                              <>
                                <ScrollArea className="h-32 w-full rounded-md border">
                                  <div className="p-4">
                                    {searchedMiners?.data?.map((miner) => (
                                      <>
                                        <button
                                          onClick={() =>
                                            setMiner_name(miner.name)
                                          }
                                          key={miner.id}
                                          className="text-sm"
                                        >
                                          {miner.name}
                                        </button>
                                        <Separator className="my-2" />
                                      </>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
              {/* <FormField
                control={form.control}
                miner_name="miner_name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid w-full max-w-sm items-center gap-1.5 relative">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Name of Miner"
                          {...field}
                        />
                      </FormControl>
                      {searchedMiners?.data !== undefined && (
                        <div className="absolute top-full left-0 bg-white shadow -mt-1 z-[10] w-full">
                          {searchedMiners?.isLoading ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </>
                          ) : (
                            <>
                              <ScrollArea className="h-32 w-full rounded-md border">
                                <div className="p-4">
                                  {searchedMiners?.data?.map((miner) => (
                                    <>
                                      <div key={miner.id} className="text-sm">
                                        {miner.miner_name}
                                      </div>
                                      <Separator className="my-2" />
                                    </>
                                  ))}
                                </div>
                              </ScrollArea>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="free"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                      <FormLabel>Free</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Number of Free Items"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10))
                          }
                        />
                      </FormControl>
                    </div>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label>Mined Date</Label>
                <input
                  className="p-2 border rounded-md text-sm outline-none"
                  type="date"
                  value={date.toISOString().split("T")[0]}
                  onChange={(e) => setDate(new Date(e.target.value))}
                />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="col-span-1 flex flex-col gap-1.5">
                  <div className="flex flex-col p-2 border rounded-md gap-1">
                    <Label htmlFor="cart">Price</Label>
                    <input
                      type="number"
                      id="price"
                      placeholder="Price"
                      className="outline-none border-b pl-2 py-1"
                      value={item}
                      onChange={(e) => setItem(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex w-full mt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setCart((prev) => [item, ...prev]);
                        setItem(0);
                      }}
                      className=""
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>

                <div className="w-full col-span-2 flex justify-center items-center">
                  <ScrollArea className="h-40 w-48 rounded-md border">
                    <div className="p-4">
                      <h4 className="mb-4 text-sm font-medium leading-none">
                        Cart ({cart.length}) Php{" "}
                        {getTotalOfCart().toLocaleString()}
                      </h4>
                      {cart.map((tag, index) => (
                        <>
                          <div
                            key={tag}
                            className="text-sm flex justify-between items-center"
                          >
                            <span>{tag}</span>
                            <div className="flex gap-2 justify-center items-center">
                              <Button
                                type="button"
                                variant={"ghostBtn"}
                                onClick={() => handleDeleteItem(index)}
                                className="w-4 h-4 p-0"
                              >
                                <Trash />
                              </Button>
                            </div>
                          </div>
                          <Separator className="my-2" />
                        </>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <Button
                disabled={isLoading}
                type="submit"
                className="w-full mt-4"
              >
                Submit{" "}
                {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
