"use client";
import { InvoiceType } from "@/lib/interfaces/new.interface";
import * as React from "react";

export type InvoiceContextType = {
  selectedInvoice: InvoiceType | undefined;
  setSelectedInvoice: (temp: InvoiceType | undefined) => void;

  // toggleAdd: boolean;
  // setToggleAdd: (temp: boolean) => void;
  toggleView: boolean;
  setToggleView: (temp: boolean) => void;
  toggleCheckout: boolean;
  setToggleCheckout: (temp: boolean) => void;
  toggleDelete: boolean;
  setToggleDelete: (temp: boolean) => void;
};

export const InvoiceContext = React.createContext<InvoiceContextType>({
  selectedInvoice: undefined,
  setSelectedInvoice: (temp: InvoiceType | undefined) => {},

  // toggleAdd: false,
  // setToggleAdd: (temp: boolean) => {},
  toggleView: false,
  setToggleView: (temp: boolean) => {},
  toggleCheckout: false,
  setToggleCheckout: (temp: boolean) => {},
  toggleDelete: false,
  setToggleDelete: (temp: boolean) => {},
});

export const useInvoiceContext = () => React.useContext(InvoiceContext);

const InvoiceProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedInvoice, setSelectedInvoice] = React.useState<
    InvoiceType | undefined
  >();

  // const [toggleAdd, setToggleAdd] = React.useState<boolean>(false);
  const [toggleView, setToggleView] = React.useState<boolean>(false);
  const [toggleCheckout, setToggleCheckout] = React.useState<boolean>(false);
  const [toggleDelete, setToggleDelete] = React.useState<boolean>(false);

  return (
    <InvoiceContext.Provider
      value={{
        selectedInvoice,
        setSelectedInvoice,
        // toggleAdd,
        toggleView,
        toggleCheckout,
        toggleDelete,
        // setToggleAdd,
        setToggleView,
        setToggleCheckout,
        setToggleDelete,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export default InvoiceProvider;
