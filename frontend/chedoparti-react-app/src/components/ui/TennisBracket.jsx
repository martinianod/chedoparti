import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function TennisBracket({ mainDraw = [] }) {
  const { t } = useTranslation();
  const scrollRef = useRef(null);
  const matchRefs = useRef({});
  const headerRefs = useRef({});
  const [lines, setLines] = useState([]);
  const [titleHeights, setTitleHeights] = useState({});
  const [svgHeight, setSvgHeight] = useState(800); // se ajusta dinámicamente

  if (
    !Array.isArray(mainDraw) ||
    mainDraw.length === 0 ||
    !mainDraw[0] ||
    !Array.isArray(mainDraw[0].matches) ||
    mainDraw[0].matches.length === 0
  ) {
    return <div className="text-gray-400 text-center py-4">{t('tournaments.no_matches')}</div>;
  }

  // ⚙️ Configuración de layout
  const matchBoxWidth = 180;
  const matchBoxHeight = 100;
  const colGap = 80;
  const verticalGap = 40;

  // 📏 Medir títulos
  useEffect(() => {
    const heights = {};
    Object.keys(headerRefs.current).forEach((idx) => {
      const el = headerRefs.current[idx];
      if (el) heights[idx] = el.getBoundingClientRect().height + 16;
    });
    setTitleHeights(heights);
  }, [mainDraw]);

  // 📐 Posiciones verticales
  const matchPositions = [];
  if (
    Object.keys(titleHeights).length > 0 &&
    Array.isArray(mainDraw) &&
    mainDraw.length > 0 &&
    mainDraw[0] &&
    Array.isArray(mainDraw[0].matches)
  ) {
    const firstOffset = titleHeights[0] || 0;
    matchPositions[0] = mainDraw[0].matches.map(
      (_, i) => firstOffset + i * (matchBoxHeight + verticalGap)
    );

    for (let r = 1; r < mainDraw.length; r++) {
      const prev = matchPositions[r - 1];
      const offset = titleHeights[r] || 0;
      matchPositions[r] = [];
      if (mainDraw[r] && Array.isArray(mainDraw[r].matches)) {
        for (let m = 0; m < mainDraw[r].matches.length; m++) {
          const prev1 = prev[m * 2];
          const prev2 = prev[m * 2 + 1];
          const center = (prev1 + prev2) / 2;
          matchPositions[r].push(Math.max(center, offset));
        }
      }
    }
  }

  // 🔗 Calcular líneas
  const calculateLines = () => {
    if (!scrollRef.current) return;
    const svgRect = scrollRef.current.getBoundingClientRect();
    const newLines = [];
    let maxY = 0; // para calcular el final más bajo del cuadro

    for (let r = 0; r < mainDraw.length - 1; r++) {
      const nextMatches = mainDraw[r + 1].matches;
      for (let i = 0; i < nextMatches.length; i++) {
        const destEl = matchRefs.current[`${r + 1}-${i}`];
        if (!destEl) continue;
        const destRect = destEl.getBoundingClientRect();
        const destY = destRect.top + destRect.height / 2 - svgRect.top;
        const destX = destRect.left - svgRect.left;
        maxY = Math.max(maxY, destY);

        for (let j = 0; j < 2; j++) {
          const fromIdx = i * 2 + j;
          const fromEl = matchRefs.current[`${r}-${fromIdx}`];
          if (!fromEl) continue;

          const fromRect = fromEl.getBoundingClientRect();
          const fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
          const fromX = fromRect.right - svgRect.left;
          const midX = (fromX + destX) / 2;
          maxY = Math.max(maxY, fromY);

          newLines.push({
            key: `line-${r}-${i}-${j}`,
            d: `M${fromX},${fromY} C${midX},${fromY} ${midX},${destY} ${destX},${destY}`,
          });
        }
      }
    }

    setLines(newLines);
    setSvgHeight(maxY + matchBoxHeight + 60); // ajusta margen inferior dinámicamente
  };

  // ♻️ Recalcular al cambiar tamaño o estructura
  useEffect(() => {
    calculateLines();
    const observer = new ResizeObserver(() => calculateLines());
    const scrollEl = scrollRef.current;
    if (scrollEl) observer.observe(scrollEl);
    Object.values(matchRefs.current).forEach((el) => el && observer.observe(el));
    window.addEventListener('resize', calculateLines);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', calculateLines);
    };
  }, [mainDraw, titleHeights]);

  const totalWidth = mainDraw.length * (matchBoxWidth + colGap) + 200;

  return (
    <div
      ref={scrollRef}
      className="relative overflow-auto cursor-grab bg-white dark:bg-gray-900 w-full h-[80vh]"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* SVG dinámico */}
      <svg
        className="absolute left-0 top-0 pointer-events-none z-10"
        style={{
          width: `${totalWidth}px`,
          height: `${svgHeight}px`,
        }}
      >
        {lines.map((line) => (
          <path
            key={line.key}
            d={line.d}
            stroke="#FFD700"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </svg>

      {/* Columnas y partidos */}
      <div
        className="flex gap-[80px] p-8 relative"
        style={{
          width: `${totalWidth}px`,
          height: `${svgHeight}px`,
        }}
      >
        {mainDraw.map((round, rIdx) => (
          <div key={rIdx} className="relative min-w-[200px]">
            <h4
              ref={(el) => (headerRefs.current[rIdx] = el)}
              className="text-center font-semibold mb-4 text-yellow-500"
            >
              {t(`tournaments.rounds.${round.round}`) !== `tournaments.rounds.${round.round}`
                ? t(`tournaments.rounds.${round.round}`)
                : round.round}
            </h4>

            {matchPositions[rIdx] &&
              round.matches.map((match, mIdx) => (
                <div
                  key={match.id}
                  ref={(el) => (matchRefs.current[`${rIdx}-${mIdx}`] = el)}
                  className="border border-yellow-400 rounded-lg p-3 bg-white dark:bg-gray-800 shadow absolute w-[180px]"
                  style={{
                    top: `${matchPositions[rIdx][mIdx]}px`,
                    height: `${matchBoxHeight}px`,
                  }}
                >
                  <div className="flex flex-col gap-1 text-sm">
                    <div
                      className={`flex justify-between items-center ${
                        match.winner === match.player1
                          ? 'font-bold text-green-700 dark:text-green-400'
                          : ''
                      }`}
                    >
                      <span>{match.player1}</span>
                      {match.winner === match.player1 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                          {t('tournaments.winner_icon', '✔')}
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex justify-between items-center ${
                        match.winner === match.player2
                          ? 'font-bold text-green-700 dark:text-green-400'
                          : ''
                      }`}
                    >
                      <span>{match.player2}</span>
                      {match.winner === match.player2 && (
                        <span className="text-xs bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                          {t('tournaments.winner_icon', '✔')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                      {match.score}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
