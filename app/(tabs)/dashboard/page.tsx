import React from "react";

import { CardLists } from "@/components/page/dashboard/card/card";
import { PageProps } from "@/lib/interfaces/new.interface";

const DashboardPage = async ({ searchParams }: PageProps) => {
  const dateString = (searchParams?.date || undefined) as string | undefined;
  return (
    <>
      <section className="w-full h-screen flex flex-col p-4 bg-white">
        <header className="w-full text-2xl h-10">
          <h1 className="font-bold text-main-default">Dashboard</h1>
        </header>
        <article className="flex-1 flex flex-col py-2 relative">
          <CardLists dateString={dateString} />
        </article>
      </section>
    </>
  );
};

export default DashboardPage;
