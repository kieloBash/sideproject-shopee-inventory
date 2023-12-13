import { authOptions } from "@/utils/authOptions";
import { getServerSession } from "next-auth";
import React from "react";

const DashboardPage = async () => {
  const session = await getServerSession(authOptions);
  console.log(session);
  return <div>DashboardPage</div>;
};

export default DashboardPage;
