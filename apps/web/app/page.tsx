import Link from "next/link";
import { Card, Button } from "@/components/ui";

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto py-16 px-6">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">DataSleuth</h1>
        <p className="mt-2 text-slate-400">
          Local-first CSV analytics with a SQL console.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/upload" className="card hover:border-indigo-500 transition-colors">
          <h2 className="text-xl font-semibold mb-2">Upload CSV</h2>
          <p className="text-slate-400 text-sm">
            Drag and drop a CSV file to preview and import it into the local
            database.
          </p>
        </Link>
        <Link href="/sql" className="card hover:border-indigo-500 transition-colors">
          <h2 className="text-xl font-semibold mb-2">SQL Console</h2>
          <p className="text-slate-400 text-sm">
            Run safe, read-only SQL queries against your imported datasets.
          </p>
        </Link>
      </div>
    </main>
  );
}