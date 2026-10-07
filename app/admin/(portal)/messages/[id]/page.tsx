import { notFound } from "next/navigation";
import MessagesInbox from "@/components/admin/messages-inbox";
import { getInbox } from "@/lib/messages-query";
import type { InboxSearchParams } from "@/lib/messages-params";

export const metadata = { title: "Messages — CodeTherapy Admin" };

/**
 * Deep link to a single message. Renders the same inbox with this message
 * open — the URL is the selection state, so links are shareable and
 * back/forward walks the reading history.
 */
export default async function AdminMessagePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: InboxSearchParams;
}) {
  const inbox = await getInbox(searchParams, params.id);
  const open = inbox.leads.find((lead) => lead.id === params.id);
  if (!open) notFound();

  return (
    <div className="p-6">
      <MessagesInbox
        leads={inbox.leads}
        counts={inbox.counts}
        hasMore={inbox.hasMore}
        initialParams={inbox.params}
        openId={params.id}
      />
    </div>
  );
}
