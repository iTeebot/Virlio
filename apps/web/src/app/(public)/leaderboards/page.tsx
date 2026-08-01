import { redirect } from "next/navigation";

export default function LeaderboardsRoot() {
  redirect("/leaderboards/top-contributers/all-time");
}
