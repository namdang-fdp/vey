"use client";
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#f8f7f3",
          color: "#1d211c",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100dvh",
            boxSizing: "border-box",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "400px",
              boxSizing: "border-box",
              border: "1px solid #d9dad2",
              borderRadius: "24px",
              background: "#fff",
              padding: "32px",
            }}
          >
            <p
              style={{
                fontSize: "12px",
                letterSpacing: "0.12em",
                color: "#49614d",
                fontWeight: 700,
              }}
            >
              VEY
            </p>
            <h1
              style={{
                fontSize: "28px",
                letterSpacing: "-0.03em",
                lineHeight: 1.2,
              }}
            >
              Something went wrong
            </h1>
            <p style={{ color: "#5e645c", lineHeight: 1.6 }}>
              The application could not load. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                width: "100%",
                minHeight: "48px",
                marginTop: "16px",
                border: 0,
                borderRadius: "12px",
                background: "#49614d",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
