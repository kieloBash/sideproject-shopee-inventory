import React from "react";
import { IncomeForm } from "./form";

const IncomePage = () => {
  return (
    <section className="w-full h-screen flex flex-col p-4 bg-white">
      <header className="w-full text-2xl h-10 flex gap-2 justify-start items-center">
        <h1 className="font-bold text-main-default">Income</h1>
      </header>
      <article className="flex-1 flex flex-col relative mt-4">
        <IncomeForm />
      </article>
    </section>
  );
};

export default IncomePage;
