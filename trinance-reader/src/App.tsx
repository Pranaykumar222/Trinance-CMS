import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Clock,
  Lock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// Types mapping matching CMS models
interface ContentBlock {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface Newsletter {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  template: string;
  authorId: string;
  coverImage: string;
  readingTime: number;
  status: string;
  visibility: string;
  blocks: ContentBlock[];
  createdAt: string;
  updatedAt: string;
  publishDate: string | null;
  scheduledFor: string | null;
  stats: Record<string, any>;
}

interface User {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
}

// ----------------------------------------------------
// Formatting Helper
// ----------------------------------------------------
const formatDate = (isoStr: string | null) => {
  if (!isoStr) return "";
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// ----------------------------------------------------
// Navigation Component
// ----------------------------------------------------
function Layout({
  children,
  userPlan,
  onPlanChange,
}: {
  children: React.ReactNode;
  userPlan: string;
  onPlanChange: (plan: string) => void;
}) {
  return (
    <div className="app-container">
      <header className="navbar">
        <Link to="/" className="nav-brand">
          <div className="brand-icon">T</div>
          <span>Trinance Newsletters</span>
        </Link>
        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link to="/" className="nav-link">Home</Link>
          <a href="#" className="nav-link">Archive</a>
          <div className="user-plan-selector" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>Member Level:</span>
            <select
              value={userPlan}
              onChange={(e) => onPlanChange(e.target.value)}
              style={{
                padding: "0.3rem 0.6rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
                fontWeight: 650,
                fontSize: "0.85rem",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="free">Free Reader</option>
              <option value="monthly">Monthly Member</option>
              <option value="quarterly">Quarterly Member</option>
              <option value="yearly">Yearly Member</option>
            </select>
          </div>
        </nav>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-logo">Trinance</div>
        <p>Premium daily insights on markets, crypto, IPOs, and financial macro.</p>
        <p style={{ marginTop: "1rem", opacity: 0.6, fontSize: "0.8rem" }}>
          &copy; {new Date().getFullYear()} Trinance. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

// ----------------------------------------------------
// Rich Content Block Renderer
// ----------------------------------------------------
function BlockRenderer({ block }: { block: ContentBlock }) {
  const { type, data } = block;

  switch (type) {
    case "heading": {
      const Level = data.level === 3 ? "h3" : "h2";
      const cls = data.level === 3 ? "block-heading-3" : "block-heading-2";
      return <Level className={cls}>{data.text}</Level>;
    }
    case "paragraph":
      return <p className="block-paragraph">{data.text}</p>;

    case "quote":
      return (
        <blockquote className="block-quote">
          <p className="quote-text">"{data.text}"</p>
          {data.cite && <cite className="quote-cite">— {data.cite}</cite>}
        </blockquote>
      );

    case "divider":
      return <hr className="block-divider" />;

    case "callout": {
      const toneClass = `callout-${data.tone || "info"}`;
      return (
        <div className={`block-callout ${toneClass}`}>
          {data.title && <div className="callout-title">{data.title}</div>}
          <div>{data.text}</div>
        </div>
      );
    }

    case "image":
      return (
        <figure style={{ margin: "2rem 0", textAlign: "center" }}>
          {data.url ? (
            <img
              src={data.url}
              alt={data.caption || ""}
              style={{
                width: "100%",
                maxHeight: "450px",
                objectFit: "cover",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
              }}
            />
          ) : (
            <div style={{ padding: "3rem", backgroundColor: "var(--bg-primary)", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              [Image Placeholder]
            </div>
          )}
          {data.caption && (
            <figcaption style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "0.5rem" }}>
              {data.caption}
            </figcaption>
          )}
        </figure>
      );

    case "cta-button":
      return (
        <div style={{ textAlign: "center", margin: "2rem 0" }}>
          <a
            href={data.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              backgroundColor: "var(--primary)",
              color: "#fff",
              padding: "0.75rem 2rem",
              fontWeight: 700,
              borderRadius: "var(--radius-sm)",
              textDecoration: "none",
              boxShadow: "var(--shadow-md)",
            }}
          >
            {data.label || "Click here"}
          </a>
        </div>
      );

    case "number-highlight": {
      const isUp = data.trend === "up";
      const isDown = data.trend === "down";
      const trendClass = isUp ? "up" : isDown ? "down" : "neutral";
      return (
        <div className="block-number-highlight">
          <div className={`highlight-value ${trendClass}`}>
            {isUp && "+"}
            {data.value}
          </div>
          <div className="highlight-label">{data.label}</div>
        </div>
      );
    }

    case "stocks-to-watch":
      return (
        <div className="stocks-container">
          <div className="stocks-title">Stocks to Watch</div>
          {data.items?.map((item: any, i: number) => {
            const isUp = !String(item.change).startsWith("-");
            const changeClass = isUp ? "up" : "down";
            return (
              <div className="stock-row" key={i}>
                <div className="stock-info">
                  <span className="stock-ticker">₹{item.ticker}</span>
                  <span className="stock-note">{item.note}</span>
                </div>
                <span className={`stock-change ${changeClass}`}>{item.change}</span>
              </div>
            );
          })}
        </div>
      );

    case "market-summary":
      return (
        <div className="market-summary-grid">
          {data.indices?.map((idx: any, i: number) => {
            const isUp = !String(idx.change).startsWith("-");
            const changeClass = isUp ? "up" : "down";
            return (
              <div className="market-index-card" key={i}>
                <span className="index-name">{idx.name}</span>
                <div className="index-numbers">
                  <div className="index-value">{idx.value}</div>
                  <span className={`index-change ${changeClass}`}>
                    {isUp ? <TrendingUp size={12} style={{ display: "inline", marginRight: "2px" }} /> : <TrendingDown size={12} style={{ display: "inline", marginRight: "2px" }} />}
                    {idx.change}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      );

    case "table":
      return (
        <table className="block-table">
          <thead>
            <tr>
              {data.headers?.map((h: string, i: number) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows?.map((row: string[], rIdx: number) => (
              <tr key={rIdx}>
                {row.map((cell: string, cIdx: number) => (
                  <td key={cIdx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );

    case "chart": {
      const series: number[] = data.series ?? [];
      if (series.length === 0) return null;
      const max = Math.max(...series, 1);
      const min = Math.min(...series, 0);
      const pts = series
        .map(
          (v, i) =>
            `${(i / (series.length - 1)) * 100},${40 - ((v - min) / (max - min || 1)) * 36}`
        )
        .join(" ");

      return (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            padding: "1.5rem",
            margin: "1.5rem 0",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {data.title && (
            <h4
              style={{
                fontWeight: 750,
                fontSize: "1rem",
                margin: "0 0 1rem",
                color: "var(--text-primary)",
              }}
            >
              {data.title}
            </h4>
          )}
          <svg viewBox="0 0 100 40" style={{ width: "100%", height: "120px" }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={`M 0 40 L ${pts} L 100 40 Z`} fill="url(#chart-grad)" />
            <polyline
              points={pts}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      );
    }

    case "economic-calendar":
      return (
        <div
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-md)",
            margin: "1.5rem 0",
            overflow: "hidden",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              padding: "0.75rem 1rem",
              fontWeight: 700,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              borderBottom: "1px solid var(--border-color)",
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            Economic Calendar
          </div>
          {data.events?.map((e: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem 1rem",
                borderBottom: i === data.events.length - 1 ? "0" : "1px solid var(--border-color)",
              }}
            >
              <span style={{ width: "70px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", flexShrink: 0 }}>
                {e.time}
              </span>
              <span style={{ flex: 1, fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>
                {e.label}
              </span>
              <span
                style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "20px",
                  backgroundColor: e.impact === "high" ? "var(--danger-light)" : "var(--warning-light)",
                  color: e.impact === "high" ? "var(--danger)" : "var(--warning)",
                  flexShrink: 0,
                }}
              >
                {e.impact}
              </span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// ----------------------------------------------------
// Home Page: List Published Newsletters
// ----------------------------------------------------
function Home() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [newslettersRes, usersRes] = await Promise.all([
          fetch(`http://localhost:3000/api/newsletters/published?_t=${Date.now()}`),
          fetch(`http://localhost:3000/api/users?_t=${Date.now()}`),
        ]);
        if (!newslettersRes.ok || !usersRes.ok) throw new Error();
        setNewsletters(await newslettersRes.json());
        setUsers(await usersRes.json());
        setError("");
      } catch (err) {
        setError("Could not load published newsletters. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const getAuthor = (id: string) => {
    return users.find((u) => u.id === id) || { name: "Trinance Editor", avatarColor: "#4f46e5" };
  };

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <p style={{ color: "var(--danger)", fontSize: "1.1rem", marginBottom: "1rem" }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            backgroundColor: "var(--primary)",
            color: "#fff",
            border: "0",
            borderRadius: "var(--radius-sm)",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">Financial Insights That Matter</h1>
        <p className="hero-subtitle">
          Market intelligence, macroeconomic analysis, and investment thesis, written and updated daily by the Trinance research desk.
        </p>
      </section>

      <h2 className="grid-title">Published Briefings</h2>
      {newsletters.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", border: "1px dashed var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <p style={{ color: "var(--text-secondary)" }}>No published briefings are currently online. Check back shortly!</p>
        </div>
      ) : (
        <div className="newsletter-grid">
          {newsletters.map((n) => {
            const author = getAuthor(n.authorId);
            const isPremium = n.visibility !== "free";
            return (
              <Link to={`/post/${n.slug}`} className="newsletter-card" key={n.id}>
                <div
                  className="card-cover"
                  style={{
                    backgroundImage: n.coverImage ? `url(${n.coverImage})` : "none",
                  }}
                >
                  <span className="card-category">{n.category}</span>
                  {isPremium && (
                    <span className="card-premium-badge">
                      <Lock size={10} style={{ marginRight: "0.25rem" }} />
                      {n.visibility}
                    </span>
                  )}
                </div>
                <div className="card-content">
                  <h3 className="card-title">{n.title}</h3>
                  <p className="card-subtitle">{n.subtitle || "A detailed briefing of recent market shifts."}</p>
                  <div className="card-footer">
                    <div className="card-author">
                      <div className="author-avatar" style={{ backgroundColor: author.avatarColor }}>
                        {getInitials(author.name)}
                      </div>
                      <span>{author.name}</span>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <Clock size={12} />
                      <span>{n.readingTime}m read</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Post Page: Single Article Viewer
// ----------------------------------------------------
function PostDetail({ userPlan }: { userPlan: string }) {
  const { slug } = useParams();
  const [newsletter, setNewsletter] = useState<Newsletter | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`http://localhost:3000/api/newsletters/${slug}?_t=${Date.now()}`);
        if (!res.ok) throw new Error("Article not found");
        const data = await res.json();
        setNewsletter(data);

        // Fetch author
        const authRes = await fetch(`http://localhost:3000/api/users`);
        if (authRes.ok) {
          const users: User[] = await authRes.json();
          const match = users.find((u) => u.id === data.authorId);
          if (match) setAuthor(match);
        }
        setError("");
      } catch (err: any) {
        setError(err.message || "Failed to load newsletter");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
    const interval = setInterval(loadPost, 3000);
    return () => clearInterval(interval);
  }, [slug]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !newsletter) {
    return (
      <div className="post-container" style={{ textAlign: "center", padding: "4rem 0" }}>
        <p style={{ color: "var(--danger)", fontSize: "1.15rem", marginBottom: "1.5rem" }}>{error || "Newsletter not found"}</p>
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </div>
    );
  }

  // Release check: scheduled date must have arrived or state must be published
  const isPublished = newsletter.status === "published" || 
    (newsletter.status === "scheduled" && newsletter.scheduledFor && new Date(newsletter.scheduledFor) <= new Date());

  if (!isPublished) {
    return (
      <div className="post-container" style={{ textAlign: "center", padding: "4rem 0" }}>
        <Lock size={32} style={{ color: "var(--warning)", marginBottom: "1rem" }} />
        <p style={{ color: "var(--warning)", fontSize: "1.15rem", marginBottom: "1.5rem", fontWeight: 605 }}>
          This briefing has not been published yet.
        </p>
        {newsletter.scheduledFor && (
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            Scheduled release: {new Date(newsletter.scheduledFor).toLocaleString()}
          </p>
        )}
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Homepage
        </Link>
      </div>
    );
  }

  // Handle Paywall / Gated premium visibility hierarchy
  const PLAN_HIERARCHY: Record<string, number> = {
    free: 0,
    monthly: 1,
    quarterly: 2,
    yearly: 3,
  };

  const userLevel = PLAN_HIERARCHY[userPlan] ?? 0;
  const requiredLevel = PLAN_HIERARCHY[newsletter.visibility] ?? 0;
  const hasAccess = userLevel >= requiredLevel;
  const isPremium = newsletter.visibility !== "free";

  return (
    <div className="post-container">
      <Link to="/" className="back-link">
        <ArrowLeft size={16} /> Back to briefings
      </Link>

      <article className="post-header">
        <div className="post-meta">
          <span className="badge">{newsletter.category}</span>
          <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
            <Clock size={14} />
            <span>{newsletter.readingTime} min read</span>
          </div>
          {isPremium && (
            <span className="badge" style={{ backgroundColor: "var(--warning-light)", color: "var(--warning)" }}>
              {newsletter.visibility} Tier
            </span>
          )}
        </div>

        <h1 className="post-title">{newsletter.title}</h1>
        {newsletter.subtitle && <p className="post-subtitle">{newsletter.subtitle}</p>}

        <div className="post-author-box">
          <div
            className="author-avatar"
            style={{
              backgroundColor: author?.avatarColor || "#4f46e5",
              width: "2.5rem",
              height: "2.5rem",
              fontSize: "0.9rem",
            }}
          >
            {getInitials(author?.name || "Trinance Editor")}
          </div>
          <div className="author-info">
            <div className="author-name">{author?.name || "Trinance Editor"}</div>
            <div className="post-date">Published on {formatDate(newsletter.publishDate)}</div>
          </div>
        </div>
      </article>

      {newsletter.coverImage && (
        <img className="post-cover-image" src={newsletter.coverImage} alt={newsletter.title} />
      )}

      <div className="post-content">
        {hasAccess ? (
          newsletter.blocks?.map((block) => (
            <BlockRenderer key={block.id} block={block} />
          ))
        ) : (
          <div>
            {newsletter.blocks && newsletter.blocks.length > 0 && (
              <div style={{ opacity: 0.25, filter: "blur(4px)", pointerEvents: "none", marginBottom: "2rem" }}>
                <BlockRenderer block={newsletter.blocks[0]} />
              </div>
            )}
            <div
              style={{
                marginTop: "2rem",
                padding: "2.5rem 2rem",
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <Lock size={32} style={{ color: "var(--warning)", marginBottom: "1rem" }} />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 750, margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
                Enjoying Trinance Premium?
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem", maxWidth: "480px", marginInline: "auto" }}>
                This newsletter is part of our restricted <strong>{newsletter.visibility}</strong> plan. Upgrade your current <strong>{userPlan}</strong> subscription to unlock this briefing.
              </p>
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                <a
                  href="#"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "var(--primary)",
                    color: "#fff",
                    padding: "0.6rem 1.25rem",
                    fontWeight: 600,
                    borderRadius: "var(--radius-sm)",
                    textDecoration: "none",
                  }}
                >
                  Upgrade Now <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Main Router
// ----------------------------------------------------
export default function App() {
  const [userPlan, setUserPlan] = useState(() => localStorage.getItem("trinance_reader_plan") || "free");

  const handlePlanChange = (plan: string) => {
    setUserPlan(plan);
    localStorage.setItem("trinance_reader_plan", plan);
  };

  return (
    <BrowserRouter>
      <Layout userPlan={userPlan} onPlanChange={handlePlanChange}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post/:slug" element={<PostDetail userPlan={userPlan} />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
