import { useMemo } from "react";

interface PerformanceChartProps {
  timeframe: "7d" | "30d" | "90d";
}

export default function PerformanceChart({ timeframe }: PerformanceChartProps) {
  // Generate mock data based on timeframe
  const chartData = useMemo(() => {
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    const data = [];
    
    for (let i = 0; i < days; i++) {
      const baseEngagement = 100 + Math.random() * 200;
      const weeklyPattern = Math.sin((i % 7) * Math.PI / 3.5) * 50;
      const growth = (i / days) * 30;
      const noise = (Math.random() - 0.5) * 40;
      
      data.push({
        day: i,
        engagement: Math.max(0, baseEngagement + weeklyPattern + growth + noise),
        reach: Math.max(0, (baseEngagement + weeklyPattern + growth + noise) * (2 + Math.random())),
      });
    }
    
    return data;
  }, [timeframe]);

  const maxEngagement = Math.max(...chartData.map(d => d.engagement));
  const maxReach = Math.max(...chartData.map(d => d.reach));

  const getBarHeight = (value: number, max: number) => {
    return Math.max(5, (value / max) * 100);
  };

  const getDateLabel = (index: number) => {
    const date = new Date();
    date.setDate(date.getDate() - (chartData.length - index - 1));
    
    if (timeframe === "7d") {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else if (timeframe === "30d") {
      return date.getDate().toString();
    } else {
      if (index % 7 === 0) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      return '';
    }
  };

  return (
    <div className="space-y-4" data-testid="performance-chart">
      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-primary-600 rounded"></div>
          <span className="text-dark-300">Engagement</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-dark-300">Reach</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-64 bg-dark-900/50 rounded-lg p-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-dark-400 pr-2">
          <span>{Math.round(maxEngagement)}</span>
          <span>{Math.round(maxEngagement * 0.75)}</span>
          <span>{Math.round(maxEngagement * 0.5)}</span>
          <span>{Math.round(maxEngagement * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart bars */}
        <div className="ml-8 h-full flex items-end justify-between space-x-1">
          {chartData.map((data, index) => (
            <div
              key={index}
              className="flex-1 flex items-end space-x-1 max-w-8"
              data-testid={`chart-bar-${index}`}
            >
              {/* Engagement bar */}
              <div
                className="bg-primary-600 rounded-t transition-all duration-300 hover:bg-primary-500 cursor-pointer flex-1"
                style={{ height: `${getBarHeight(data.engagement, maxEngagement)}%` }}
                title={`Engagement: ${Math.round(data.engagement)}`}
              ></div>
              {/* Reach bar */}
              <div
                className="bg-green-500 rounded-t transition-all duration-300 hover:bg-green-400 cursor-pointer flex-1"
                style={{ height: `${getBarHeight(data.reach, maxReach)}%` }}
                title={`Reach: ${Math.round(data.reach)}`}
              ></div>
            </div>
          ))}
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 ml-8 pointer-events-none">
          {[0, 25, 50, 75, 100].map((percentage) => (
            <div
              key={percentage}
              className="absolute w-full border-t border-dark-700 opacity-30"
              style={{ bottom: `${percentage}%` }}
            ></div>
          ))}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="ml-8 flex justify-between text-xs text-dark-400">
        {chartData.map((_, index) => {
          const label = getDateLabel(index);
          return (
            <span
              key={index}
              className={`flex-1 text-center ${!label ? 'invisible' : ''}`}
            >
              {label}
            </span>
          );
        })}
      </div>

      {/* Chart insights */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
        <div className="text-center">
          <p className="text-lg font-semibold text-white" data-testid="avg-engagement">
            {Math.round(chartData.reduce((sum, d) => sum + d.engagement, 0) / chartData.length)}
          </p>
          <p className="text-sm text-dark-400">Avg Engagement</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white" data-testid="avg-reach">
            {Math.round(chartData.reduce((sum, d) => sum + d.reach, 0) / chartData.length).toLocaleString()}
          </p>
          <p className="text-sm text-dark-400">Avg Reach</p>
        </div>
      </div>
    </div>
  );
}
