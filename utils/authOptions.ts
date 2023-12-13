import { NextAuthOptions } from "next-auth";
import { authUser, getUserByEmail } from "@/utils/getUserByEmail";
import CredentialsProvider from "next-auth/providers/credentials";

//bcrypt
import bcrypt from "bcrypt";
import { UserType } from "@/lib/interfaces/user.interface";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log(credentials?.email, credentials?.password);
        if (credentials) {
          const user = await authUser({
            email: credentials?.email as string,
          });

          if (!user) {
            return null;
          }

          if (credentials?.password !== "") {
            const match = await bcrypt.compare(
              credentials?.password,
              user.password
            );
            if (!match) {
              console.log("password incorrect");
              return null;
            }
          } else {
            console.log("new account");
            const match = true;
          }
          return user;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // if (account?.type === "oauth") {
      console.log(account, profile);
      // return await signInWithOAuth({ account, profile });
      // }
      return true;
    },
    async jwt({ token, trigger, session }) {
      if (trigger == "update") {
        console.log("YOU ARE HERE");
        if (token?.user) {
          const user: UserType = token.user as UserType;
          user.role = session.user.role;
          token.user = user;
        }
      } else {
        const user = await getUserByEmail({ email: token.email as string });
        // if(!user) return false
        console.log(user);
        token.uid = user?.id;
        token.user = user;
        // session.user = user;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token.user as UserType;
      return session;
    },
  },
  pages: {
    signIn: "/auth/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
