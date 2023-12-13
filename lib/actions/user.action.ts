"use server";

import supabase from "@/utils/supabase";
import * as bcrypt from "bcrypt";

export async function createNewUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    const saltRounds = 10;
    const defaultPassword = password || "1234";
    const salt = bcrypt.genSaltSync(saltRounds);

    const hashedPassword = bcrypt.hashSync(defaultPassword, salt);

    console.log({ email, password, hashedPassword });
    const res = await supabase
      .from("users")
      .insert({ email, password: hashedPassword, role: "user" })
      .select("*")
      .single();

    console.log(res);

    if (res.error !== null) return false;

    return true;
  } catch (error: any) {
    throw new Error("Error in creating users", error.message);
  }
}
