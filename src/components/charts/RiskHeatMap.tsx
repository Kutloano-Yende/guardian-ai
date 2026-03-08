import { motion } from "framer-motion";
import { Risk } from "@/lib/grc-store";

interface RiskHeatMapProps {
  risks: Risk[];
}

const IMPACT_LABELS = ["Negligible", "Minor", "Moderate", "Major", "Severe"];
const PROB_LABELS = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];

function getCellColor(prob: number, impact: number) {
  const score = prob * impact;
  if (score >= 20) return "rgba(220, 38, 38, 0.7)";    // critical
  if (score >= 15) return "rgba(234, 88, 12, 0.65)";    // high
  if (score >= 10) return "rgba(234, 179, 8, 0.55)";    // medium
  if (score >= 5) return "rgba(45, 150, 120, 0.45)";    // low
  return "rgba(45, 150, 120, 0.25)";                     // minimal
}

export function RiskHeatMap({ risks }: RiskHeatMapProps) {
  // Build matrix: rows=probability(5→1), cols=impact(1→5)
  const matrix: Risk[][][] = Array.from({ length: 5 }, () =>
    Array.from({ length: 5 }, () => [])
  );
  risks.forEach((r) => {
    const pi = Math.min(5, Math.max(1, r.probability)) - 1;
    const ii = Math.min(5, Math.max(1, r.impact)) - 1;
    matrix[pi][ii].push(r);
  });

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-foreground mb-4">Risk Heat Map</h3>
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex flex-col justify-between pr-2 py-1">
          {[...PROB_LABELS].reverse().map((l) => (
            <span key={l} className="text-[10px] text-muted-foreground text-right leading-none h-full flex items-center justify-end">
              {l}
            </span>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-5 gap-1">
            {[4, 3, 2, 1, 0].map((probIdx) =>
              [0, 1, 2, 3, 4].map((impIdx) => {
                const count = matrix[probIdx][impIdx].length;
                const prob = probIdx + 1;
                const imp = impIdx + 1;
                return (
                  <motion.div
                    key={`${probIdx}-${impIdx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (probIdx * 5 + impIdx) * 0.02, duration: 0.3 }}
                    className="aspect-square rounded-lg flex items-center justify-center relative cursor-default group"
                    style={{ background: getCellColor(prob, imp) }}
                    title={`P:${prob} × I:${imp} = ${prob * imp} | ${count} risk(s)`}
                  >
                    {count > 0 && (
                      <span className="text-xs font-bold text-white drop-shadow-sm">{count}</span>
                    )}
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-50 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-white shadow-lg"
                      style={{ background: "rgba(15, 23, 42, 0.9)", backdropFilter: "blur(8px)" }}>
                      Score: {prob * imp} · {count} risk{count !== 1 ? "s" : ""}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
          {/* X-axis */}
          <div className="grid grid-cols-5 gap-1 mt-1">
            {IMPACT_LABELS.map((l) => (
              <span key={l} className="text-[10px] text-muted-foreground text-center">{l}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground">
        <span>← Probability</span>
        <span>Impact →</span>
      </div>
    </div>
  );
}
