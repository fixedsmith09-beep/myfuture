"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CumulativePoint } from "@/types/life";
import SectionCard from "./SectionCard";

interface LifeChartProps {
  points: CumulativePoint[];
}

export default function LifeChart({ points }: LifeChartProps) {
  return (
    <SectionCard title="인생 그래프" subtitle="X축은 시간(나이), Y축은 누적 점수입니다.">
      <div className="h-80 w-full">
        <ResponsiveContainer minHeight={320}>
          <LineChart data={points} margin={{ left: 8, right: 8, top: 10, bottom: 10 }}>
            <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "#09090b",
                borderRadius: 12,
                border: "1px solid #27272a",
              }}
              labelStyle={{ color: "#e4e4e7" }}
              formatter={(value, key) => [
                Number(value ?? 0),
                key === "cumulativeScore" ? "누적 점수" : "기록 점수",
              ]}
            />
            <Line
              type="monotone"
              dataKey="cumulativeScore"
              stroke="#818cf8"
              strokeWidth={3}
              dot={{ fill: "#818cf8", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
