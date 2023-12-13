export interface InvoiceType {
  id: string;
  miner_id: string;
  miner_name: string;
  created_at: Date;
  cart: number[];
  status: "Pending" | "Confirmed";
  free_items: number;
  confirm_date: Date | null;
  miner?: MinerType;
}

export interface MinerType {
  id: string;
  name: string;
  rewardpts: number;
  liked: boolean;
  shared: boolean;
}

export interface PageProps {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}

export type StatusMinerFilterType = "All" | "Pending" | "Confirmed";
