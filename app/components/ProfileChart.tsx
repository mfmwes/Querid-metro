"use client";

// Define a estrutura do Voto que o componente vai receber
type Vote = {
  id: string;
  emoji: string;
  createdAt: string;
};

// Dicionário de Cores atualizado com TODOS os seus emojis novos
const EMOJI_COLORS: Record<string, string> = {
  "❤️": "#ef4444", // Red 500 (Coração)
  "💣": "#71717a", // Zinc 500 (Bomba - Cinza para não sumir no fundo preto)
  "🍪": "#f59e0b", // Amber 500 (Biscoito)
  "🌱": "#22c55e", // Green 500 (Planta)
  "🤢": "#84cc16", // Lime 500 (Nojo)
  "🎯": "#3b82f6", // Blue 500 (Alvo)
  "💔": "#be123c", // Rose 700 (Coração Partido)
  "🤥": "#a1a1aa", // Zinc 400 (Pinóquio)
  "💼": "#6366f1", // Indigo 500 (Maleta)
  "🐍": "#15803d", // Green 700 (Cobra)
  "🤬": "#991b1b", // Red 800 (Raiva)
  "🍌": "#facc15", // Yellow 400 (Banana)
};

export default function ProfileChart({ votes }: { votes: Vote[] }) {
  // 1. Agrupa e conta a quantidade de votos por emoji
  const counts: Record<string, number> = {};
  votes.forEach((vote) => {
    counts[vote.emoji] = (counts[vote.emoji] || 0) + 1;
  });

  // 2. Transforma em array e ordena do mais votado para o menos votado
  const data = Object.entries(counts)
    .map(([emoji, count]) => ({ emoji, count }))
    .sort((a, b) => b.count - a.count);

  // 3. Define o teto (valor máximo) para calcular a altura percentual das barras
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex flex-col h-full min-h-[250px]">
      <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
        Visão Geral de Reações
      </h3>
      
      {data.length === 0 ? (
        // Tela vazia caso o usuário não tenha recebido nenhum voto ainda
        <div className="flex-1 flex items-center justify-center border border-zinc-800/50 border-dashed rounded-xl">
          <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">
            Nenhuma reação ainda
          </span>
        </div>
      ) : (
        // Gráfico de Barras Verticais
        <div className="flex-1 flex items-end justify-center gap-6 md:gap-8 pb-4">
          {data.map((item) => {
            // Calcula a altura da barra (mínimo de 15% para não sumir se tiver só 1 voto)
            const heightPercent = Math.max((item.count / maxCount) * 100, 15);
            
            // Pega a cor correspondente ou usa um cinza padrão se o emoji for desconhecido
            const color = EMOJI_COLORS[item.emoji] || "#52525b"; 

            return (
              <div key={item.emoji} className="flex flex-col items-center gap-3 group">
                {/* Número de votos que aparece ao passar o mouse (Hover Effect) */}
                <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.count}
                </span>
                
                {/* Barra Vertical */}
                <div 
                  className="w-10 rounded-t-lg transition-all duration-500 ease-out"
                  style={{ 
                    height: `${heightPercent}%`, 
                    backgroundColor: color,
                    minHeight: '40px' 
                  }}
                />
                
                {/* O Emoji */}
                <span className="text-2xl drop-shadow-md cursor-default">
                  {item.emoji}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}