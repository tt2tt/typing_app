import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fafbfc", color: "#222" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.05em" }}>
        {"Loading".split("").map((ch, i) => (
          <span
            key={i}
            className="loading-bounce"
            style={{
              display: "inline-block",
              animationDelay: `${i * 0.1}s`,
              marginRight: ch === "g" ? 0 : 2,
            }}
          >
            {ch}
          </span>
        ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
