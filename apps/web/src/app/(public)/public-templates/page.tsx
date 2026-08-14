import { permanentRedirect } from "next/navigation";

export default function PublicTemplatesPage() {
  permanentRedirect("/templates");
}
