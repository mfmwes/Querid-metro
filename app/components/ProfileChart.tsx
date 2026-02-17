"use client";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, Tooltip } from "recharts";

// Mapeamento de Cores por Emoji
const EMOJI_COLORS: Record<string, string> = {
  "❤️": "#ef4444", // Red
  "🧩": "#a855f7", // Purple
  "🍪": "#f59e0b", // Amber
  "🌱": "#22c55e", // Green
  "🤢": "#84cc16", // Lime
  "🎯": "#3b82f6", // Blue
  "🏳️‍🌈": "#ec4899", // Pink
  "🤥": "#71717a", // Zinc
  "💼": "#6366f1", // Indigo
};

export default function ProfileChart({ data }: { data: any[] }) {
  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="emoji" 
            tick={{ fill: '#71717a', fontSize: 20 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            tick={{ fill: '#52525b', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
            {/* Aqui a mágica acontece: Pintamos cada barra com sua cor */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={EMOJI_COLORS[entry.emoji] || "#71717a"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}