import { permanentRedirect } from "next/navigation";

export default function PublicContributorsPage() {
  permanentRedirect("/contributors");
}
