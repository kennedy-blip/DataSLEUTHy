"use client";

import { useState } from "react";
import { Card, Textarea, Button, Input } from "@/components/ui";

interface QueryResult {
  columns: string[];
  rows: any[][];
  row_count: number;
}

export default function SQLConsolePage() {
  const [query, setQuery] = useState("SELECT * FROM datasets LIMIT 10");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch("/api/datasets/test/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.detail || "Query failed");
        return;
      }
      setResult(data);
    } catch (err) {
      setError("Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">SQL Console</h1>
      
      <Card>
        <Textarea
          rows={4}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SELECT * FROM table_name"
          className="w-full font-mono"
        />
        <Button onClick={runQuery} disabled={loading} className="mt-4">
          {loading ? "Running…" : "Run Query"}
        </Button>
      </Card>
      
      {error && <p className="mt-4 text-red-400">{error}</p>}
      
      {result && (
        <Card className="mt-8">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400 mb-4">
            Results ({result.row_count} rows)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {result.columns.map((col) => (
                    <th key={col} className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2">{String(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </main>
  );
}