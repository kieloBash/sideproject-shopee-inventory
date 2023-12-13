export interface Miner {
  id: number;
  created_at: Date;
  miner_name: string;
  cart: number[];
  status: "Pending" | "Confirmed";
  free: number;
  confirm_date: Date | null;
}

export interface FormDataType {
  miner_name: string;
  cart: (number | null)[];
  free: number;
}

export interface TotalItemsType {
  miner_name: string;
  totalItems: number;
  totalPrice: number;
}

export type FilterOptions = "All" | "Pending" | "Confirmed";
