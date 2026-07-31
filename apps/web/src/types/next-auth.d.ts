import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: "user" | "creator" | "brand" | "moderator" | "admin";
    username: string | null;
    bio?: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: "user" | "creator" | "brand" | "moderator" | "admin";
      username: string | null;
      bio?: string | null;
    } & DefaultSession["user"];
  }
}
