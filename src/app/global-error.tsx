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
          fontFamily: "ui-monospace, monospace",
          background: "#2a1b3d",
          color: "#fff8e7",
          padding: "4rem 1rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "2rem" }}>Something went wrong</h1>
        <p>Please reload the page to try again.</p>
        <button
          onClick={() => reset()}
          style={{
            minHeight: 48,
            padding: "0 1.5rem",
            marginTop: "1rem",
            background: "#ffc21e",
            color: "#2a1b3d",
            border: "4px solid #fff8e7",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
