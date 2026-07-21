import { Brain, Sparkles, TrendingUp } from 'lucide-react';
import type { AiRecommendation } from '../../types/parent.types';
import GlassCard from '../shared/GlassCard';
import Badge from '../shared/Badge';

interface AiRecommendationCardProps {
  recommendation: AiRecommendation;
}

export default function AiRecommendationCard({
  recommendation,
}: AiRecommendationCardProps) {
  const grouped = recommendation.forecasts.reduce<
    Record<string, typeof recommendation.forecasts>
  >((acc, item) => {
    if (!acc[item.week]) acc[item.week] = [];
    acc[item.week].push(item);
    return acc;
  }, {});

  return (
    <GlassCard className="overflow-hidden">
      <div className="bg-gradient-to-r from-tl-primary-dark via-tl-primary to-tl-primary-light p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">AI Learning Insights</h3>
              <Badge variant="info">Powered by AI</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              {recommendation.summary}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-2">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-4 w-4 text-tl-primary" />
            <h4 className="text-sm font-bold text-tl-text">Recommendations</h4>
          </div>
          <ul className="space-y-3">
            {recommendation.tips.map((tip, index) => (
              <li
                key={index}
                className="flex gap-3 rounded-xl border border-tl-border bg-tl-surface-muted/40 p-3 text-sm text-tl-text dark:bg-tl-surface-muted/60"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-xs font-bold text-tl-primary dark:bg-violet-950/40">
                  {index + 1}
                </span>
                <span className="leading-relaxed text-tl-text-muted">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-tl-primary" />
            <h4 className="text-sm font-bold text-tl-text">Upcoming Weeks Forecast</h4>
          </div>
          <div className="space-y-4">
            {Object.entries(grouped).map(([week, items]) => (
              <div
                key={week}
                className="rounded-xl border border-tl-border p-4"
              >
                <p className="mb-3 text-xs font-bold uppercase tracking-wide text-tl-primary">
                  {week}
                </p>
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={`${week}-${item.childName}-${idx}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-tl-text">
                          {item.childName}
                        </p>
                        <p className="mt-0.5 text-xs text-tl-text-muted">
                          {item.focus}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-extrabold text-tl-primary">
                          {item.projectedScore}%
                        </p>
                        <p className="text-[10px] text-tl-text-muted">
                          {item.confidence}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
