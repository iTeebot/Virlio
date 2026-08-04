import { redirect } from "next/navigation";

export default function SingularLeaderboardRedirectPage() {
  redirect("/leaderboards/top-contributers/all-time");
}
