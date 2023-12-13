export interface InvoiceType {
  id: string;
  miner_id: string;
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
