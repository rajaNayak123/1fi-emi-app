import { Routes, Route, Link } from "react-router-dom";
import ProductList from "./pages/ProductList.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss-500 font-display text-sm font-semibold text-paper">
            1Fi
          </span>
          <span className="hidden font-display text-lg tracking-tight sm:inline">
            Buy now, invest the difference
          </span>
        </Link>
        <span className="rounded-full border border-moss-500/30 bg-moss-50 px-3 py-1 text-xs font-medium text-moss-600">
          EMI plans backed by mutual funds
        </span>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-ink/10 py-10">
      <div className="mx-auto max-w-6xl px-5 text-sm text-ink/50">
        Built for the 1Fi SDE1 assignment — product data, pricing, and EMI plans are served
        dynamically from a database via a REST API.
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-6xl px-5 py-24 text-center">
                <p className="font-display text-2xl">Page not found</p>
                <Link to="/" className="mt-4 inline-block text-moss-600 underline">
                  Back to catalog
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
