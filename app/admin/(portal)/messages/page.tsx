import MessagesInbox from "@/components/admin/messages-inbox";
import { getInbox } from "@/lib/messages-query";
import type { InboxSearchParams } from "@/lib/messages-params";

export const metadata = { title: "Messages — CodeTherapy Admin" };

/**
 * Contact-form + newsletter inbox. Every public form submission lands in the
 * Lead table (app/(site)/contact/actions.ts) — this screen is where the team
 * reads them, instead of relying on the notification email alone.
 *
 * List state lives in the URL (?q=&source=&status=&limit=): filter/search
 * server-side, selection deep-links to /admin/messages/[id], and "Load more"
 * grows the limit — so messages are shareable and the browser back button
 * walks the inbox history.
 */
export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: InboxSearchParams;
}) {
  const inbox = await getInbox(searchParams);

  return (
    <div className="p-6">
      <MessagesInbox
        leads={inbox.leads}
        counts={inbox.counts}
        hasMore={inbox.hasMore}
        initialParams={inbox.params}
        openId={null}
      />
    </div>
  );
}
