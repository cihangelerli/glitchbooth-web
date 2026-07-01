import { useEffect, useState } from "react";
import {
  BarChart3,
  Activity,
  ShieldCheck,
  Zap,
  HardDrive,
  Sliders,
  Clock,
} from "lucide-react";
import { motion } from "motion/react";

interface TelemetryData {
  total_captures: number;
  successful_uploads: number;
  failed_uploads: number;
  prints_completed: number;
  uptime_hours: number;
  most_popular_combo: string;
  effects_popularity: Record<string, number>;
  first_capture_iso: string | null;
  last_capture_iso: string | null;
}

export default function StatsDashboard() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchCloudTelemetry() {
      try {
        // CHANGED: Changed to "/stats.json" to natively match local public folder files.
        // NOTE: When deploying live, change this string to your absolute ImageKit URL:
        // "https://ik.imagekit.io/w6lsfsw8j/telemetry/stats.json"
        // const response = await fetch("/stats.json"); // LOCAL
        // const response = await fetch("https://ik.imagekit.io/w6lsfsw8j/telemetry/stats.json"); // DEPLOY
        const response = await fetch(
          "https://ik.imagekit.io/w6lsfsw8j/telemetry/stats.json",
        );

        if (!response.ok) {
          throw new Error(
            `HTTP network fault error status: ${response.status}`,
          );
        }

        const json = await response.json();
        setData(json);
        setError(false);
      } catch (err) {
        console.error("Failed to parse cloud telemetry records:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchCloudTelemetry();
    const interval = setInterval(fetchCloudTelemetry, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (isoString: string | null) => {
    if (!isoString) return "NO_RECORDS_FOUND";
    try {
      const date = new Date(isoString);
      return (
        date.toLocaleTimeString("en-US", { hour12: false }) +
        " " +
        date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" })
      );
    } catch {
      return "TIME_PARSE_FAULT";
    }
  };

  const totalUploads = data ? data.successful_uploads + data.failed_uploads : 0;
  const successRate =
    totalUploads > 0 && data
      ? Math.round((data.successful_uploads / totalUploads) * 100)
      : 100;

  return (
    // FIX: The ID is now placed on this persistent outer section tag.
    // Navigation will now slide here smoothly regardless of loading or error state loops.
    <section
      id="stats-section"
      className="relative w-full max-w-[1200px] mx-auto px-4 py-16 border-t border-matrix/20 text-left select-none scroll-mt-20"
    >
      {/* Section Header */}
      <div className="flex items-center space-x-2 mb-12 border-b border-matrix/20 pb-4">
        <div className="bg-[#00ff41] p-1.5 text-black">
          <BarChart3 size={16} />
        </div>
        <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold tracking-widest text-[#00ff41] uppercase">
          OPERATIONAL_ANALYTICS
        </h2>
      </div>

      {/* Conditional State Intercept Rendering Blocks */}
      {loading && (
        <div className="font-mono text-xs text-[#00ff41] tracking-widest animate-pulse py-12">
          &gt; ACCESSING_IMAGEKIT_TELEMETRY_STREAM...
        </div>
      )}

      {error && !loading && (
        <div className="border border-magenta/30 bg-black/50 font-mono text-xs text-[#fe00fe] tracking-wider p-6">
          [!] ERROR: TELEMETRY_MATRIX_OFFLINE // FILE_NOT_FOUND_IN_PUBLIC_DIR
          <div className="text-[10px] text-magenta/60 mt-2 normal-case font-sans">
            Ensure your file is placed exactly at:{" "}
            <code className="bg-black px-1 py-0.5 border border-magenta/20 font-mono">
              public/stats.json
            </code>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* Analytics Main Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="border border-matrix/20 bg-[#161616] p-6 relative group overflow-hidden">
              <div className="text-[10px] font-mono text-[#84967e] mb-1">
                TOTAL_CAPTURES
              </div>
              <div className="text-3xl font-display font-bold text-[#00ff41] tracking-tight">
                {String(data.total_captures || 0).padStart(4, "0")}
              </div>
              <Activity
                size={14}
                className="absolute bottom-4 right-4 text-matrix/20 group-hover:text-[#00ff41]/40 transition-colors"
              />
            </div>

            <div className="border border-matrix/20 bg-[#161616] p-6 relative group overflow-hidden">
              <div className="text-[10px] font-mono text-[#84967e] mb-1">
                THERMAL_PRINTS
              </div>
              <div className="text-3xl font-display font-bold text-[#00ff41] tracking-tight">
                {String(data.prints_completed || 0).padStart(4, "0")}
              </div>
              <HardDrive
                size={14}
                className="absolute bottom-4 right-4 text-matrix/20 group-hover:text-[#00ff41]/40 transition-colors"
              />
            </div>

            <div className="border border-matrix/20 bg-[#161616] p-6 relative group overflow-hidden">
              <div className="text-[10px] font-mono text-[#84967e] mb-1">
                UPLOAD_STABILITY
              </div>
              <div className="text-3xl font-display font-bold text-[#00daf8] tracking-tight">
                {successRate}%
              </div>
              <ShieldCheck
                size={14}
                className="absolute bottom-4 right-4 text-matrix/20 group-hover:text-[#00daf8]/40 transition-colors"
              />
            </div>

            <div className="border border-matrix/20 bg-[#161616] p-6 relative group overflow-hidden">
              <div className="text-[10px] font-mono text-[#84967e] mb-1">
                SESSION_UPTIME
              </div>
              <div className="text-3xl font-display font-bold text-[#00ff41] tracking-tight">
                {data.uptime_hours || 0}h
              </div>
              <Zap
                size={14}
                className="absolute bottom-4 right-4 text-matrix/20 group-hover:text-[#00ff41]/40 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Left Aspect: Knob Usage Bars */}
            <div className="lg:col-span-2 space-y-6 border border-matrix/20 bg-black/40 p-6 md:p-8">
              <h3 className="font-mono text-xs font-bold text-[#00ff41] tracking-wider uppercase flex items-center space-x-2 mb-4">
                <Sliders size={14} />
                <span>&gt; SIGNAL_MANIPULATION_POPULARITY</span>
              </h3>

              <div className="space-y-4 font-mono text-xs">
                {Object.entries(data.effects_popularity || {}).map(
                  ([key, percentage]) => {
                    const cleanLabel = key
                      .replace("_usage_pct", "")
                      .replace(/_/g, " ")
                      .toUpperCase();
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex justify-between text-[#b9ccb2] text-[11px]">
                          <span>{cleanLabel}</span>
                          <span className="text-[#00ff41]">{percentage}%</span>
                        </div>
                        <div className="h-2 bg-[#1b1b1b] border border-matrix/10 relative overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-[#00ff41]/40 to-[#00ff41] shadow-[0_0_6px_#00ff41]"
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Right Aspect: Core Details */}
            <div className="space-y-6">
              <div className="border border-matrix/20 bg-[#1b1b1b] p-6 font-mono text-xs space-y-3 relative">
                <div className="absolute top-0 right-0 p-1 px-2 text-[9px] bg-[#00ff41]/10 text-[#00ff41] border-l border-b border-matrix/20 font-bold">
                  CLOUD_SNAPSHOT
                </div>
                <h4 className="text-[#84967e] text-[10px] uppercase tracking-widest">
                  // DOMINANT_ALGORITHM_PROFILE
                </h4>
                <div className="text-sm font-bold text-white uppercase tracking-wide leading-snug border-b border-matrix/10 pb-3">
                  {data.most_popular_combo || "RAW_CAPTURE_FLOW"}
                </div>

                <div className="space-y-2 pt-2 text-[11px]">
                  <div className="flex justify-between border-b border-[#3b4b37]/20 pb-2 items-center">
                    <span className="text-[#84967e] flex items-center">
                      <Clock size={12} className="mr-1.5 shrink-0" /> First Log:
                    </span>
                    <span className="text-[#b9ccb2] font-semibold">
                      {formatTimestamp(data.first_capture_iso)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#3b4b37]/20 pb-2 items-center">
                    <span className="text-[#84967e] flex items-center">
                      <Clock size={12} className="mr-1.5 shrink-0" /> Latest
                      Log:
                    </span>
                    <span className="text-[#00ff41] font-semibold">
                      {formatTimestamp(data.last_capture_iso)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 items-center">
                    <span className="text-[#84967e]">Pipeline Node:</span>
                    <span className="text-[#00daf8] font-bold">
                      IMAGEKIT // CDN
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-matrix/40 tracking-wide leading-relaxed">
                * PIPELINE_NOTE: Analytics compilation aggregates operational
                log sequences generated locally across bare-metal matrices and
                structured within the ImageKit telemetry cloud node ecosystem.
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
