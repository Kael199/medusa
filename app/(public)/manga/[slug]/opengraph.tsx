import { ImageResponse } from "next/og";
import { connect } from "@/lib/db/mongoose";
import "@/models";
import { Manga } from "@/models";
import { getSettings } from "@/lib/query/get-settings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// Mongoose requires the Node runtime (not edge), so we intentionally do NOT
// set `runtime = "edge"` here; the OG route uses the default Node runtime.

interface OGProps {
  params: Promise<{ slug: string }>;
}

export default async function OpengraphImage({ params }: OGProps) {
  // Inside an edge runtime we still need the DB lookup for the title.
  await connect();
  const settings = await getSettings();
  const { slug } = await params;
  const manga = await Manga.findOne({ slug, isPublished: true, isHidden: { $ne: true } })
    .select("title author type status")
    .lean() as unknown as { title: string; author?: string; type?: string; status: string } | null;

  if (!manga) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            background: "linear-gradient(135deg, #f97316, #ea580c)",
            color: "white",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ fontSize: 56, fontWeight: 700 }}>{settings.siteName}</div>
          <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12 }}>Series not found</div>
        </div>
      ),
      { ...size }
    );
  }

  const subtitle = [
    manga.type ? manga.type.toUpperCase() : "",
    STATUS_LABEL[manga.status] ?? "",
    manga.author ? `by ${manga.author}` : "",
  ].filter(Boolean).join("  ·  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #7c2d12 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, fontWeight: 600, opacity: 0.95 }}>
          {settings.siteName}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, maxWidth: 1000 }}>
            {manga.title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 30, opacity: 0.92, marginTop: 24 }}>{subtitle}</div>
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}

const STATUS_LABEL: Record<string, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
};
