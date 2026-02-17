"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts";

export default function QueridometroChart({ data }: { data: any[] }) {
  return (
    // O container define a altura do gráfico
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          
          {/* Eixo X: Mostra os emojis na base das barras */}
          <XAxis 
            dataKey="emoji" 
            tick={{ fill: '#71717a', fontSize: 24 }} 
            tickLine={false}
            axisLine={false}
            interval={0} 
          />
          
          {/* Eixo Y: Escondido para limpar o visual */}
          <YAxis hide />

          {/* REMOVIDO: <Tooltip /> 
             Isso garante que o balão não apareça mais ao passar o mouse.
          */}

          {/* Barras do gráfico */}
          <Bar 
            dataKey="count" 
            fill="#ef4444" 
            radius={[8, 8, 8, 8]} // Bordas arredondadas
            barSize={40} // Largura da barra
          >
            {/* Opcional: Cores diferentes para cada barra se quiser (descomente abaixo) */}
            {/* {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ef4444' : '#f87171'} />
            ))} */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}