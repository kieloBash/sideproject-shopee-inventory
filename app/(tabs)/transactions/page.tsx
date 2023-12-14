// import TransactionComponent from "@/components/page/transactions/component";
import TransactionComponent from "@/components/page/transactions/component";
import { DeleteTodayModal } from "@/components/page/transactions/modals/delete-today";
import InvoiceProvider from "@/contexts/InvoiceProvider";
import { PageProps } from "@/lib/interfaces/new.interface";
import React from "react";

const TransactionsPage = ({ searchParams }: PageProps) => {
  const dateString = (searchParams?.date || undefined) as string | undefined;
  const searchMiner = (searchParams?.searchMiner || undefined) as string | undefined;
  console.log(searchParams,searchMiner);

  return (
    <>
      <section className="w-full h-screen flex flex-col p-4 bg-white">
        <header className="w-full text-2xl h-10 flex gap-2 justify-start items-center">
          <h1 className="font-bold text-main-default">Miners</h1>
          <DeleteTodayModal dateString={dateString} />
        </header>
        <article className="flex-1 flex flex-col py-2 relative">
          <InvoiceProvider>
            <TransactionComponent dateString={dateString} searchMinerString={searchMiner || ""}/>
          </InvoiceProvider>
        </article>
      </section>
    </>
  );
};

export default TransactionsPage;
