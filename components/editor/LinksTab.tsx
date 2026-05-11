"use client";

import SocialLinksForm from "@/components/SocialLinksForm";
import { useEditorStore } from "@/lib/store/editorStore";

interface LinksTabProps {
  userId: string;
}

export default function LinksTab({ userId }: LinksTabProps) {
  const links = useEditorStore((s) => s.links);
  const setLinks = useEditorStore((s) => s.setLinks);

  // SocialLinksForm requires order_index; coerce missing values to position
  const normalizedLinks = links.map((l, i) => ({
    id: l.id,
    platform: l.platform,
    url: l.url,
    order_index: l.order_index ?? i,
    title: l.title,
  }));

  return (
    <SocialLinksForm
      userId={userId}
      initialLinks={normalizedLinks}
      onLinksChange={(next) => setLinks(next)}
    />
  );
}
