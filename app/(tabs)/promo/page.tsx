import PromoMain from "@/components/page/promo/main";
import React from "react";

const PromoPage = () => {
  return (
    <section className="w-full h-screen flex flex-col p-4 bg-white">
      <header className="w-full text-2xl h-10 flex gap-2 justify-start items-center">
        <h1 className="font-bold text-main-default">Promo</h1>
      </header>
      <article className="flex-1 flex flex-col relative">
        <PromoMain />
      </article>
    </section>
  );
};

export default PromoPage;
