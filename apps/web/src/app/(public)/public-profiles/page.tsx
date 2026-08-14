import { permanentRedirect } from "next/navigation";

export default function PublicProfilesPage() {
  permanentRedirect("/contributors");
}
