import { permanentRedirect } from "next/navigation";

interface ContributorPageProps {
  params: Promise<{ username: string }>;
}

export default async function ContributorProfilePage({ params }: ContributorPageProps) {
  const { username } = await params;
  permanentRedirect(`/profiles/${encodeURIComponent(username)}`);
}
