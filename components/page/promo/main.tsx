"use client";
import React, { useState } from "react";

// UI
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpRightSquareIcon,
  Loader2,
  QrCode,
  Search,
  ThumbsUp,
} from "lucide-react";

// BACKEND
import useFetchMiners from "./useMiners";
import useDebounce from "@/hooks/useDebounce";
import { MinerType } from "@/lib/interfaces/new.interface";
import supabase from "@/utils/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import QRCode from "qrcode.react";
import { Label } from "@radix-ui/react-dropdown-menu";

const PromoMain = () => {
  const [stringVal, setStringVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const [selectedMiner, setSelectedMiner] = useState<MinerType>();

  const debouncedSearch = useDebounce(stringVal, 500);
  const miners = useFetchMiners({ searchName: debouncedSearch, limit: 5 });

  async function handleLiked(miner: MinerType) {
    setIsLoading(true);

    const newRewardPts = miner.liked
      ? miner.rewardpts - 5
      : miner.rewardpts + 5;

    const res = await supabase
      .from("miner")
      .update({
        ["liked"]: !miner.liked,
        ["rewardpts"]: newRewardPts,
      })
      .eq("id", miner.id);

    if (res.error) console.log(res);
    else {
      queryClient.invalidateQueries({
        queryKey: [`miners`],
      });
      setIsLoading(false);
    }
  }
  async function handleShared(miner: MinerType) {
    setIsLoading(true);

    const newRewardPts = miner.shared
      ? miner.rewardpts - 5
      : miner.rewardpts + 5;

    const res = await supabase
      .from("miner")
      .update({
        ["shared"]: !miner.shared,
        ["rewardpts"]: newRewardPts,
      })
      .eq("id", miner.id);

    if (res.error) console.log(res);
    else {
      queryClient.invalidateQueries({
        queryKey: [`miners`],
      });
      setIsLoading(false);
    }
  }

  return (
    <>
      {selectedMiner && (
        <section
          className="fixed z-[100] inset-0 bg-white flex-col flex justify-center items-center"
          onClick={() => setSelectedMiner(undefined)}
        >
          <Label className="mb-2 text-main-default text-xl font-bold">Rewards QR Link</Label>
          <div className="">
            <QRCode
              size={250}
              bgColor={"#ffffff"}
              fgColor={'#ca5371'}
              value={`https://sideproject-shopee-rewards.vercel.app/${
                selectedMiner?.id || ""
              }`}
            />
          </div>
        </section>
      )}
      <div className="flex items-center px-3 border-b">
        <Search className="w-4 h-4 mr-2 opacity-50 shrink-0" />
        <input
          className="flex w-full py-3 text-sm bg-transparent rounded-md outline-none h-11 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Search a user..."
          value={stringVal}
          onChange={(e) => setStringVal(e.target.value)}
        />
      </div>
      {miners.isLoading ? (
        <div className="w-full h-[calc(100vh-7rem)] flex justify-center items-center">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>
          <ScrollArea className="w-full h-[calc(100vh-7rem)] py-4">
            <div className="w-full flex flex-col gap-1.5">
              {miners?.data?.map((miner) => {
                return (
                  <div
                    className="w-full h-[8.5rem] p-4 border rounded-md flex flex-col gap-2 justify-center items-center"
                    key={miner.id}
                  >
                    <div className="flex gap-2 w-full justify-between items-center">
                      <h3 className="font-bold text-lg">{miner.name}</h3>
                      <p className="text-sm">
                        Reward Points:{" "}
                        <span className="font-medium">{miner.rewardpts}</span>
                      </p>
                    </div>
                    <div className="w-full flex flex-col gap-y-0.5">
                      <Progress
                        value={miner.rewardpts}
                        className="w-full h-3 rounded-none"
                      />
                      <div className="w-full grid grid-cols-10 h-2">
                        {Array(10)
                          .fill([10, 20, 30, 40, 50, 60, 70, 80, 90, 100])
                          .map((_, i) => {
                            return (
                              <div
                                className="text-xs text-muted-foreground text-right"
                                key={i}
                              >
                                {_[i]}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-center gap-2 mt-1">
                      <Button
                        type="button"
                        onClick={() => {
                          setSelectedMiner(miner);
                        }}
                        className="text-xs px-2"
                        size={"sm"}
                        variant={"default"}
                        disabled={isLoading}
                      >
                        <QrCode className="w-5 h-5" />
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          onClick={() => handleLiked(miner)}
                          className="text-xs"
                          size={"sm"}
                          variant={!miner.liked ? "default" : "outline"}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="w-3 h-3 mr-2" /> Liked
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          onClick={() => handleShared(miner)}
                          className="text-xs"
                          size={"sm"}
                          variant={!miner.shared ? "default" : "outline"}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                            </>
                          ) : (
                            <>
                              <ArrowUpRightSquareIcon className="w-3 h-3 mr-2" />{" "}
                              Shared
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}
    </>
  );
};

export default PromoMain;
