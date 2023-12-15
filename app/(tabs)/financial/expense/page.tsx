import React from "react";
import { ExpenseForm } from "./form";

const ExpensePage = () => {
  return (
    <section className="w-full h-screen flex flex-col p-4 bg-white">
      <header className="w-full text-2xl h-10 flex gap-2 justify-start items-center">
        <h1 className="font-bold text-main-default">Expenses</h1>
      </header>
      <article className="flex-1 flex flex-col relative mt-4">
        <ExpenseForm />
      </article>
    </section>
  );
};

export default ExpensePage;
