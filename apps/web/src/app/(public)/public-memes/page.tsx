import { permanentRedirect } from "next/navigation";

export default function PublicMemesPage() {
  permanentRedirect("/explore");
}
