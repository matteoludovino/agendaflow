import { ImageResponse } from "next/og"
import { type NextRequest } from "next/server"

export const runtime = "edge"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const name  = searchParams.get("name")  ?? "Profissional"
  const bio   = searchParams.get("bio")   ?? "Agende um horário"
  const slug  = searchParams.get("slug")  ?? ""

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("")

  const truncatedBio = bio.length > 80 ? bio.slice(0, 80) + "…" : bio

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#09090b",
          padding: "64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "auto" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              backgroundColor: "#f4f4f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
            }}
          >
            📅
          </div>
          <span style={{ color: "#f4f4f5", fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>
            AgendaFlow
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {initials}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                color: "#f4f4f5",
                fontSize: "52px",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              {name}
            </span>
            {truncatedBio && (
              <span style={{ color: "#71717a", fontSize: "22px", lineHeight: 1.4 }}>
                {truncatedBio}
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "48px",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ color: "#52525b", fontSize: "18px" }}>
            agendaflow.com.br/{slug}
          </span>
          <div
            style={{
              backgroundColor: "#6366f1",
              color: "#fff",
              borderRadius: "12px",
              padding: "12px 28px",
              fontSize: "18px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
            }}
          >
            Agendar agora →
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
