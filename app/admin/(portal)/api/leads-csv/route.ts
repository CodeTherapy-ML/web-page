import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inboxWhere, parseInboxParams } from "@/lib/messages-query";

/**
 * Messages → Export CSV. Streams the current filtered view (same ?q=&source=
 * &status= params as the inbox) as a spreadsheet-friendly CSV — newsletter
 * rows double as the mailing-list export. Protected by the /admin middleware
 * like the JSON export in api/export.
 */
export async function GET(request: NextRequest) {
  const params = parseInboxParams({
    q: request.nextUrl.searchParams.get("q") ?? undefined,
    source: request.nextUrl.searchParams.get("source") ?? undefined,
    status: request.nextUrl.searchParams.get("status") ?? undefined,
  });

  const leads = await db.lead.findMany({
    where: inboxWhere(params),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 5000,
  });

  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [
    [
      "Received",
      "Name",
      "Email",
      "Organization",
      "Source",
      "Inquiry type",
      "Status",
      "Replied at",
      "Notes",
      "Message",
    ].join(","),
    ...leads.map((lead) =>
      [
        lead.createdAt.toISOString(),
        lead.name,
        lead.email,
        lead.organization ?? "",
        lead.source,
        lead.inquiryType ?? "",
        lead.status,
        lead.repliedAt?.toISOString() ?? "",
        lead.notes ?? "",
        lead.message.replace(/\r\n/g, "\n"),
      ]
        .map(escape)
        .join(","),
    ),
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="codetherapy-messages.csv"',
    },
  });
}
