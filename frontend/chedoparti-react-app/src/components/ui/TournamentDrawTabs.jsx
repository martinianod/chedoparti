import React from 'react';
import Tabs from './Tabs';
import TennisBracket from './TennisBracket';

export default function TournamentDrawTabs({ t, drawDetails }) {
  return (
    <>
      <Tabs tabs={[{ label: t('tournaments.groups') }, { label: t('tournaments.mainDraw') }]}>
        {/* Tab 1: Grupos */}
        <div>
          <ul className="mb-2 list-disc pl-4">
            {(drawDetails?.groups || []).map((group, idx) => (
              <li key={idx}>
                <span className="font-bold">{group.name}:</span> {group.players.join(', ')}
              </li>
            ))}
            {(!drawDetails || (drawDetails?.groups || []).length === 0) && (
              <li className="text-gray-400">{t('tournaments.noGroups')}</li>
            )}
          </ul>
        </div>
        {/* Tab 2: Cuadro principal */}
        <div>
          {Array.isArray(drawDetails?.mainDraw) && drawDetails.mainDraw.length > 0 ? (
            <TennisBracket mainDraw={drawDetails.mainDraw} />
          ) : (
            <div className="text-gray-400">{t('tournaments.noMainDraw')}</div>
          )}
        </div>
      </Tabs>
    </>
  );
}
