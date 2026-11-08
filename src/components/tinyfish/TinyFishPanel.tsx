import React, { useState, useEffect } from "react";
import {
  searchInternshipsWithTinyFish,
  fetchJobFromUrlWithTinyFish,
  testTinyFishConnection,
  getStoredTinyFishKey,
  saveStoredTinyFishKey,
  type TinyFishSearchResult,
  type ExtractedJob
} from "../../utils/tinyfish";
import type { InternshipRecord } from "../../types";
import {
  Globe,
  Search,
  Sparkles,
  Link,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Key,
  BookmarkPlus,
  RefreshCw,
  Loader2
} from "lucide-react";

interface TinyFishPanelProps {
  tracker: InternshipRecord[];
  onImportToTracker: (record: InternshipRecord) => void;
  onShowToast: (msg: string, type: "success" | "warning" | "info") => void;
}

const createRecordId = () => `track-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const getIsoTimestamp = () => new Date().toISOString();

export const TinyFishPanel: React.FC<TinyFishPanelProps> = ({
  tracker,
  onImportToTracker,
  onShowToast
}) => {
  const [apiKey, setApiKey] = useState<string>(() => getStoredTinyFishKey());
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success?: boolean;
    latencyMs?: number;
    error?: string;
  }>({ tested: false });
  const [isTesting, setIsTesting] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("Software Engineering Intern Summer 2027");
  const [searchResults, setSearchResults] = useState<TinyFishSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // URL Extract State
  const [customUrl, setCustomUrl] = useState("http://job-boards.greenhouse.io/pdtpartners/jobs/8077685");
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [extractedJob, setExtractedJob] = useState<ExtractedJob | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Initial connection test & default search
  useEffect(() => {
    let mounted = true;

    const runInit = async () => {
      setIsTesting(true);
      const res = await testTinyFishConnection(apiKey);
      if (!mounted) return;
      setConnectionStatus({
        tested: true,
        success: res.success,
        latencyMs: res.latencyMs,
        error: res.error
      });
      setIsTesting(false);

      setIsSearching(true);
      try {
        const results = await searchInternshipsWithTinyFish("Software Engineering Intern Summer 2027", apiKey);
        if (mounted) setSearchResults(results);
      } catch (err: any) {
        if (mounted) setSearchError(err?.message || "Search failed");
      } finally {
        if (mounted) setIsSearching(false);
      }
    };

    runInit();
    return () => {
      mounted = false;
    };
  }, [apiKey]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const res = await testTinyFishConnection(apiKey);
    setConnectionStatus({
      tested: true,
      success: res.success,
      latencyMs: res.latencyMs,
      error: res.error
    });
    setIsTesting(false);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredTinyFishKey(apiKey);
    handleTestConnection();
    onShowToast("TinyFish API key updated", "success");
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchInternshipsWithTinyFish(searchQuery, apiKey);
      setSearchResults(results);
    } catch (err: any) {
      setSearchError(err?.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customUrl.trim()) return;

    setIsFetchingUrl(true);
    setFetchError(null);
    setExtractedJob(null);
    try {
      const job = await fetchJobFromUrlWithTinyFish(customUrl.trim(), apiKey);
      setExtractedJob(job);
      onShowToast(`Successfully extracted "${job.title}"!`, "success");
    } catch (err: any) {
      setFetchError(err?.message || "Failed to fetch and parse URL via TinyFish cloud browser.");
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleImportExtracted = (job: ExtractedJob) => {
    const isDuplicate = tracker.some((r) => r.url === job.url);
    if (isDuplicate) {
      onShowToast(`Duplicate protection: "${job.title}" is already in your tracker.`, "info");
      return;
    }

    const newRecord: InternshipRecord = {
      id: createRecordId(),
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.url,
      savedAt: getIsoTimestamp(),
      status: "Saved",
      notes: `Imported via TinyFish Cloud Fetcher. ${job.descriptionSnippet.slice(0, 100)}...`,
      isDemo: false
    };

    onImportToTracker(newRecord);
    onShowToast(`Added "${job.title}" to your tracker!`, "success");
  };

  const handleImportSearchResult = (item: TinyFishSearchResult) => {
    const isDuplicate = tracker.some((r) => r.url === item.url);
    if (isDuplicate) {
      onShowToast(`Duplicate protection: "${item.title}" is already in your tracker.`, "info");
      return;
    }

    // Parse company from title or site_name
    let company = item.site_name || "Tech Employer";
    if (item.title.includes(" at ")) {
      company = item.title.split(" at ")[1].split(/[-–|,]/)[0].trim();
    } else if (item.title.includes(" - ")) {
      company = item.title.split(" - ")[0].trim();
    }

    const newRecord: InternshipRecord = {
      id: createRecordId(),
      title: item.title.replace(/ at .*$/, "").replace(/ - .*$/, "").trim(),
      company,
      location: "United States (Hybrid / Remote)",
      url: item.url,
      savedAt: getIsoTimestamp(),
      status: "Saved",
      notes: item.snippet.slice(0, 120),
      isDemo: false
    };

    onImportToTracker(newRecord);
    onShowToast(`Saved "${newRecord.title}" to tracker!`, "success");
  };

  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{
        padding: "24px 28px",
        background: "#ffffff",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-card)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11.5,
                fontWeight: 600,
                color: "var(--primary)",
                background: "var(--status-ready-bg)",
                padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                border: "1px solid var(--status-ready-border)"
              }}>
                <Zap size={12} /> TinyFish Cloud Engine
              </span>
              <span className="badge-demo">Live Web Automation</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.3px" }}>
              Live Opportunity Radar & Web Extractor
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              Powered by TinyFish headless Chromium cloud runners. Search real internship portals or extract details from any live URL.
            </p>
          </div>

          {/* Connection Status Pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              background: connectionStatus.success ? "var(--status-success-bg)" : "var(--status-failed-bg)",
              border: `1px solid ${connectionStatus.success ? "var(--status-success-border)" : "var(--status-failed-border)"}`,
              fontSize: 12.5,
              fontWeight: 500,
              color: connectionStatus.success ? "var(--status-success)" : "var(--status-failed)"
            }}>
              {connectionStatus.success ? (
                <>
                  <CheckCircle2 size={14} />
                  <span>TinyFish Connected ({connectionStatus.latencyMs}ms)</span>
                </>
              ) : (
                <>
                  <AlertCircle size={14} />
                  <span>{connectionStatus.error || "Connecting..."}</span>
                </>
              )}
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn btn-secondary"
              style={{ padding: "6px 12px", fontSize: 12 }}
              title="Test TinyFish API connection latency"
            >
              {isTesting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              <span>Test</span>
            </button>
          </div>
        </div>

        {/* API Key Drawer */}
        <form onSubmit={handleSaveApiKey} style={{
          marginTop: 18,
          paddingTop: 16,
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap"
        }}>
          <Key size={15} color="var(--text-faint)" />
          <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 500 }}>
            API Key:
          </span>
          <input
            type="password"
            className="input-field"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ maxWidth: 360, height: 34, fontSize: 12.5, fontFamily: "var(--font-mono)" }}
          />
          <button type="submit" className="btn btn-secondary" style={{ height: 34, padding: "0 14px", fontSize: 12 }}>
            Save Key
          </button>
          <span style={{ fontSize: 11.5, color: "var(--text-faint)" }}>
            Persisted securely in local storage.
          </span>
        </form>
      </div>

      {/* Two Column Section: 1. Extract from URL, 2. Live Job Radar Search */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(460px, 1fr))", gap: 20 }}>
        {/* Section 1: Live Web URL Extractor */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>
              Extract From Any Job URL
            </h3>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
            Paste any Greenhouse, Lever, LinkedIn, or company career page URL. TinyFish renders the live DOM and extracts clean opportunity fields.
          </p>

          <form onSubmit={handleFetchUrl} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <input
              type="url"
              required
              className="input-field"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://job-boards.greenhouse.io/company/jobs/..."
              style={{ height: 40, fontSize: 13 }}
            />
            <button
              type="submit"
              disabled={isFetchingUrl}
              className="btn btn-primary"
              style={{ height: 40, padding: "0 16px", fontSize: 13 }}
            >
              {isFetchingUrl ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Fetching...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Extract</span>
                </>
              )}
            </button>
          </form>

          {fetchError && (
            <div style={{
              padding: "10px 14px",
              background: "var(--status-failed-bg)",
              border: "1px solid var(--status-failed-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--status-failed)",
              fontSize: 12.5,
              marginBottom: 16
            }}>
              {fetchError}
            </div>
          )}

          {extractedJob && (
            <div style={{
              padding: "16px 18px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              boxShadow: "var(--shadow-sm)"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <div>
                  <span className="badge-demo" style={{ marginBottom: 4 }}>Extracted via TinyFish</span>
                  <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1d1d1f" }}>
                    {extractedJob.title}
                  </h4>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                    <strong style={{ color: "#1d1d1f" }}>{extractedJob.company}</strong> • {extractedJob.location}
                  </div>
                </div>

                <button
                  onClick={() => handleImportExtracted(extractedJob)}
                  className="btn btn-blue"
                  style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}
                >
                  <BookmarkPlus size={14} />
                  <span>Add to Tracker</span>
                </button>
              </div>

              <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 8 }}>
                {extractedJob.descriptionSnippet}...
              </p>

              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, color: "var(--text-faint)" }}>
                <ShieldCheck size={13} color="var(--status-success)" />
                <span>Verified live extraction • Duplicate check ready</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Live Job Radar Search */}
        <div className="glass-panel" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Globe size={16} color="var(--primary)" />
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1d1d1f" }}>
              Live Opportunity Radar
            </h3>
          </div>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
            Search live opportunities indexed across Greenhouse, Lever, and leading engineering portals.
          </p>

          <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={15} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)" }} />
              <input
                type="text"
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Software Engineer Intern 2027..."
                style={{ paddingLeft: 34, height: 40, fontSize: 13 }}
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="btn btn-primary"
              style={{ height: 40, padding: "0 16px", fontSize: 13 }}
            >
              {isSearching ? <Loader2 size={14} className="animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {searchError && (
            <div style={{
              padding: "10px 14px",
              background: "var(--status-failed-bg)",
              border: "1px solid var(--status-failed-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--status-failed)",
              fontSize: 12.5,
              marginBottom: 16
            }}>
              {searchError}
            </div>
          )}

          {/* Results list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto", paddingRight: 4 }}>
            {searchResults.map((item, idx) => {
              const isSaved = tracker.some((r) => r.url === item.url);
              return (
                <div
                  key={idx}
                  style={{
                    padding: "12px 14px",
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1d1d1f" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                      {item.site_name || "Job Board"} • {item.snippet.slice(0, 90)}...
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: "5px 8px", fontSize: 11.5 }}
                      title="Open job posting"
                    >
                      <ExternalLink size={12} />
                    </a>

                    <button
                      onClick={() => handleImportSearchResult(item)}
                      disabled={isSaved}
                      className={`btn ${isSaved ? "btn-secondary" : "btn-blue"}`}
                      style={{ padding: "5px 10px", fontSize: 11.5 }}
                    >
                      {isSaved ? "Saved" : "+ Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
