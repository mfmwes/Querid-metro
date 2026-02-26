"use client";

type Vote = {
  id: string;
  emoji: string;
  createdAt: string;
};

const ALL_EMOJIS = ["❤️", "💣", "🍪", "🌱", "🤢", "🎯", "💔", "🤥", "💼", "🐍", "🤬", "🍌"];

const EMOJI_COLORS: Record<string, string> = {
  "❤️": "#ef4444",
  "💣": "#a1a1aa", // Cinza para a bomba aparecer bem no fundo escuro
  "🍪": "#f59e0b",
  "🌱": "#22c55e",
  "🤢": "#84cc16",
  "🎯": "#3b82f6",
  "💔": "#be123c",
  "🤥": "#d4d4d8",
  "💼": "#6366f1",
  "🐍": "#15803d",
  "🤬": "#991b1b",
  "🍌": "#facc15",
};

export default function ProfileChart({ votes }: { votes: Vote[] }) {
  const counts: Record<string, number> = {};
  votes.forEach((vote) => {
    counts[vote.emoji] = (counts[vote.emoji] || 0) + 1;
  });

  const data = ALL_EMOJIS.map(emoji => ({
    emoji,
    count: counts[emoji] || 0
  }));

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col w-full h-full pt-4">
      {/* Título normal, sem forçar a largura, para não quebrar o celular */}
      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
        Visão Geral de Reações
      </h3>

      {/* Caixa de rolagem isolada! Apenas o gráfico rola horizontalmente no telemóvel */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
        
        {/* A MÁGICA AQUI: min-w-[500px] + min-h-[160px]/[200px] + flex e items-end */}
        {/* Adicionei 'flex items-end' e defini a altura mínima para as barras voltarem a aparecer */}
        <div className="flex items-end justify-between gap-2 min-w-[500px] sm:min-w-full min-h-[160px] sm:min-h-[200px] relative mt-4">
          
          {/* Linhas horizontais de fundo */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.05] pb-10 z-0">
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
            <div className="w-full h-px bg-white"></div>
          </div>

          {data.map((item) => {
            const isZero = item.count === 0;
            const heightPercent = isZero ? 0 : (item.count / maxCount) * 100;
            const color = EMOJI_COLORS[item.emoji] || "#52525b";

            return (
              <div key={item.emoji} className="flex flex-col items-center gap-3 group relative z-10 w-full flex-1">
                
                {/* Contador de votos */}
                <span className={`text-xs font-black transition-all duration-300 ${
                  isZero ? 'text-zinc-600 opacity-0 group-hover:opacity-100' : 'text-white drop-shadow-md'
                }`}>
                  {item.count}
                </span>

                {/* Trilho da barra (background escuro) */}
                <div className="w-full max-w-[2rem] sm:max-w-[2.5rem] flex items-end justify-center h-full rounded-t-lg bg-zinc-800/50 relative overflow-hidden">
                   
                   {/* A BARRA COLORIDA! Ela precisa de um pai com 'flex items-end' e altura definida para aparecer */}
                   <div
                     className="w-full rounded-t-lg transition-all duration-1000 ease-out absolute bottom-0"
                     style={{
                       height: isZero ? '4px' : `${heightPercent}%`,
                       backgroundColor: isZero ? '#3f3f46' : color, // Cinza médio para zero votos
                       opacity: isZero ? 0.3 : 1,
                       boxShadow: isZero ? 'none' : `0 -4px 15px -4px ${color}` // Brilho colorido
                     }}
                   />
                </div>

                {/* Emoji na base */}
                <span className={`text-xl sm:text-2xl transition-all duration-300 ${
                  isZero ? 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 cursor-default' : 'drop-shadow-md scale-110'
                }`}>
                  {item.emoji}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}