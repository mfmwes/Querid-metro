"use client";

type Vote = {
  id: string;
  emoji: string;
  createdAt: string;
};

// 1. Trazemos a lista de TODOS os emojis para cá, para o eixo X ficar sempre fixo
const ALL_EMOJIS = ["❤️", "💣", "🍪", "🌱", "🤢", "🎯", "💔", "🤥", "💼", "🐍", "🤬", "🍌"];

const EMOJI_COLORS: Record<string, string> = {
  "❤️": "#ef4444",
  "💣": "#71717a",
  "🍪": "#f59e0b",
  "🌱": "#22c55e",
  "🤢": "#84cc16",
  "🎯": "#3b82f6",
  "💔": "#be123c",
  "🤥": "#a1a1aa",
  "💼": "#6366f1",
  "🐍": "#15803d",
  "🤬": "#991b1b",
  "🍌": "#facc15",
};

export default function ProfileChart({ votes }: { votes: Vote[] }) {
  // 2. Conta a quantidade de votos
  const counts: Record<string, number> = {};
  votes.forEach((vote) => {
    counts[vote.emoji] = (counts[vote.emoji] || 0) + 1;
  });

  // 3. Mapeia TODOS os emojis (mesmo os zerados) para não deformar o gráfico
  const data = ALL_EMOJIS.map(emoji => ({
    emoji,
    count: counts[emoji] || 0
  }));

  // 4. Define o teto (valor máximo). O Math.max(..., 1) garante que nunca divide por 0
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col h-full w-full pt-4">
      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-8">
        Visão Geral de Reações
      </h3>

      {/* O container principal do gráfico */}
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 w-full pb-2 relative mt-4">
        
        {/* Linhas horizontais de fundo para dar proporção */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] pb-10">
          <div className="w-full h-px bg-white"></div>
          <div className="w-full h-px bg-white"></div>
          <div className="w-full h-px bg-white"></div>
          <div className="w-full h-px bg-white"></div>
        </div>

        {/* Mapeando os 12 slots */}
        {data.map((item) => {
          const isZero = item.count === 0;
          const heightPercent = isZero ? 0 : (item.count / maxCount) * 100;
          const color = EMOJI_COLORS[item.emoji] || "#52525b";

          return (
            <div key={item.emoji} className="flex flex-col items-center gap-3 group relative z-10 w-full">
              
              {/* Número de votos no topo (Fica invisível se for 0, mas aparece no hover) */}
              <span className={`text-xs font-black transition-all duration-300 ${
                isZero ? 'text-zinc-700 opacity-0 group-hover:opacity-100' : 'text-white'
              }`}>
                {item.count}
              </span>

              {/* O "Trilho" escuro de fundo da barra */}
              <div className="w-full max-w-[2.5rem] flex items-end justify-center h-[120px] sm:h-[180px] rounded-t-lg bg-zinc-900/40 relative">
                 
                 {/* A Barra Colorida que sobe */}
                 <div
                   className={`w-full rounded-t-lg transition-all duration-1000 ease-out absolute bottom-0`}
                   style={{
                     height: isZero ? '4px' : `${heightPercent}%`,
                     backgroundColor: isZero ? '#27272a' : color, // Fica cinza escuro se for 0
                     opacity: isZero ? 0.5 : 1,
                     boxShadow: isZero ? 'none' : `0 -4px 20px -5px ${color}80` // Glow colorido
                   }}
                 />
              </div>

              {/* Emoji na base */}
              <span className={`text-xl sm:text-2xl transition-all duration-300 ${
                isZero ? 'opacity-20 grayscale group-hover:grayscale-0 group-hover:opacity-100 cursor-default' : 'drop-shadow-md scale-110'
              }`}>
                {item.emoji}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}