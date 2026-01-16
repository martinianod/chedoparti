import React, { useState } from 'react';

import EditButton from './EditButton';
import DeleteButton from './DeleteButton';
import Accordion from './Accordion';

import Tabs from './Tabs';
import TournamentDrawTabs from './TournamentDrawTabs';
import ModalBackdrop from './ModalBackdrop';

export default function TournamentTable({
  tournaments,
  t,
  handleEdit,
  handleDelete,
  mobile = false,
}) {
  const [inscriptosModal, setInscriptosModal] = useState(null);
  const [drawModal, setDrawModal] = useState(null);

  // Busca los detalles del torneo por id (now will fetch from backend when needed)
  const getDetails = (id) => {
    // TODO: Fetch tournament details from backend API
    return null;
  };

  if (tournaments.length === 0) {
    return <div className="text-gray-500 p-4 text-center">{t('tournaments.empty')}</div>;
  }

  return (
    <>
      {/* Vista de tarjetas para móvil */}
      <div className="block md:hidden space-y-4">
        {tournaments.map((tournament) => (
          <div
            key={tournament.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-navy dark:text-gold text-lg">
                  {tournament.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tournament.sport}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    tournament.inscription === 'Abierta'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {tournament.inscription}
                </span>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    tournament.status === 'Programado'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : tournament.status === 'En curso'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                >
                  {tournament.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                <div className="mt-1">
                  {Array.isArray(tournament.category) ? (
                    tournament.category.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tournament.category.map((cat) => (
                          <span
                            key={cat}
                            className="inline-block bg-brand/10 dark:bg-gold/20 text-brand dark:text-gold px-2 py-0.5 rounded text-xs font-semibold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  ) : (
                    <span className="inline-block bg-brand/10 dark:bg-gold/20 text-brand dark:text-gold px-2 py-0.5 rounded text-xs font-semibold">
                      {tournament.category}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Género:</span>
                <div className="mt-1">
                  {Array.isArray(tournament.gender) ? (
                    tournament.gender.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tournament.gender.map((gen) => (
                          <span
                            key={gen}
                            className="inline-block bg-navy/10 dark:bg-gold/10 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold"
                          >
                            {gen}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  ) : (
                    <span className="inline-block bg-navy/10 dark:bg-gold/10 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold">
                      {tournament.gender}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Edad:</span>
                <div className="mt-1">
                  {Array.isArray(tournament.ageRange) ? (
                    tournament.ageRange.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {tournament.ageRange.map((age) => (
                          <span
                            key={age}
                            className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-2 py-0.5 rounded text-xs font-semibold"
                          >
                            {age}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )
                  ) : (
                    <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 px-2 py-0.5 rounded text-xs font-semibold">
                      {tournament.ageRange}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                <span className="ml-2 font-medium">{tournament.date}</span>
              </div>
            </div>

            <div className="text-center mb-4">
              <span className="text-gray-500 dark:text-gray-400">Participantes: </span>
              <span className="font-semibold text-navy dark:text-gold text-lg">
                {tournament.participants}
              </span>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <button
                className="w-full px-4 py-2 bg-gold text-navy hover:bg-yellow-300 dark:bg-gold dark:text-navy dark:hover:bg-gold/80 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gold/40"
                onClick={() => setInscriptosModal(tournament.id)}
              >
                {t('tournaments.showInscriptos')}
              </button>
              <button
                className="w-full px-4 py-2 bg-navy text-white hover:bg-navy/90 dark:bg-brand dark:text-gold dark:hover:bg-brand/80 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-navy/30 dark:focus:ring-brand/40"
                onClick={() => setDrawModal(tournament.id)}
              >
                {t('tournaments.showDraw')}
              </button>
            </div>

            <div className="flex gap-2">
              <EditButton onClick={() => handleEdit(tournament)} className="flex-1 justify-center">
                {t('common.edit')}
              </EditButton>
              <DeleteButton
                onClick={() => handleDelete(tournament.id)}
                className="flex-1 justify-center"
              >
                {t('common.delete')}
              </DeleteButton>
            </div>
          </div>
        ))}
      </div>

      {/* Vista de tabla con scroll horizontal para tablet y desktop */}
      <div className="hidden md:block">
        <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <table className="min-w-[1000px] w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 font-medium">{t('tournaments.name')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.sport')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.category')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.gender')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.ageRange')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.date')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.participants')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.inscription')}</th>
                <th className="px-4 py-3 font-medium">{t('tournaments.status')}</th>
                <th className="px-4 py-3 font-medium">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map((tournament) => (
                <Accordion
                  key={tournament.id}
                  summary={
                    <>
                      <td className="px-4 py-3 align-middle font-semibold text-navy dark:text-gold">
                        {tournament.name}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span className="inline-block px-3 py-1 rounded-full bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold text-xs font-semibold">
                          {tournament.sport}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {Array.isArray(tournament.category) ? (
                          tournament.category.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {tournament.category.map((cat) => (
                                <span
                                  key={cat}
                                  className="inline-block bg-brand/10 dark:bg-gold/20 text-brand dark:text-gold px-2 py-0.5 rounded text-xs font-semibold"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="inline-block bg-brand/10 dark:bg-gold/20 text-brand dark:text-gold px-2 py-0.5 rounded text-xs font-semibold">
                            {tournament.category}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {Array.isArray(tournament.gender) ? (
                          tournament.gender.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {tournament.gender.map((gen) => (
                                <span
                                  key={gen}
                                  className="inline-block bg-navy/10 dark:bg-gold/10 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold"
                                >
                                  {gen}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="inline-block bg-navy/10 dark:bg-gold/10 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold">
                            {tournament.gender}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        {Array.isArray(tournament.ageRange) ? (
                          tournament.ageRange.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {tournament.ageRange.map((age) => (
                                <span
                                  key={age}
                                  className="inline-block bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold"
                                >
                                  {age}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )
                        ) : (
                          <span className="inline-block bg-navy/10 dark:bg-gold/20 text-navy dark:text-gold px-2 py-0.5 rounded text-xs font-semibold">
                            {tournament.ageRange}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono text-sm">
                        {tournament.date}
                      </td>
                      <td className="px-4 py-3 align-middle text-center font-semibold text-navy dark:text-gold">
                        {tournament.participants}
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            tournament.inscription === 'Abierta'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {tournament.inscription}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            tournament.status === 'Programado'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                              : tournament.status === 'En curso'
                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {tournament.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-middle">
                        <div className="flex gap-2 whitespace-nowrap">
                          <EditButton
                            onClick={() => handleEdit(tournament)}
                            aria-label={t('common.edit')}
                          >
                            {t('common.edit')}
                          </EditButton>
                          <DeleteButton
                            onClick={() => handleDelete(tournament.id)}
                            aria-label={t('common.delete')}
                          >
                            {t('common.delete')}
                          </DeleteButton>
                        </div>
                      </td>
                    </>
                  }
                >
                  <div className="p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-900 rounded-b-lg">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors
                          bg-gold text-navy hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-gold border border-gold dark:bg-gold dark:text-navy dark:hover:bg-gold/80 dark:focus:ring-gold/40"
                        onClick={() => setInscriptosModal(tournament.id)}
                      >
                        {t('tournaments.showInscriptos')}
                      </button>
                      <button
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors
                          bg-navy text-white hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-navy/30
                          border border-navy/30 dark:bg-brand dark:text-gold dark:hover:bg-brand/80 dark:focus:ring-brand/40"
                        onClick={() => setDrawModal(tournament.id)}
                      >
                        {t('tournaments.showDraw')}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {t('tournaments.accordionHint')}
                    </div>
                  </div>
                </Accordion>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modales */}
      {inscriptosModal && (
        <ModalBackdrop onClose={() => setInscriptosModal(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-lg p-6 min-w-[300px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{t('tournaments.inscriptosModalTitle')}</h2>
            <ul className="mb-4 list-disc pl-4">
              {(getDetails(inscriptosModal)?.users || []).map((user) => (
                <li key={user.id} className="py-0.5 text-base dark:text-gray-100">
                  {user.name}
                </li>
              ))}
              {(!getDetails(inscriptosModal) ||
                (getDetails(inscriptosModal)?.users || []).length === 0) && (
                <li className="text-gray-400">{t('tournaments.noInscriptos')}</li>
              )}
            </ul>
            <button
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors bg-gold text-navy hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-gold border border-gold dark:bg-gold dark:text-navy dark:hover:bg-gold/80 dark:focus:ring-gold/40"
              onClick={() => setInscriptosModal(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </ModalBackdrop>
      )}

      {drawModal && (
        <ModalBackdrop onClose={() => setDrawModal(null)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-lg p-6 min-w-[300px] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{t('tournaments.drawModalTitle')}</h2>
            <TournamentDrawTabs
              t={t}
              drawDetails={
                getDetails(drawModal)?.sport === 'Tenis' &&
                getDetails(drawModal)?.tournamentId === 1
                  ? { mainDraw: tennisBracketMock.mainDraw }
                  : getDetails(drawModal)?.draw
              }
            />
            <button
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold shadow-sm transition-colors bg-navy text-white hover:bg-navy/90 focus:outline-none focus:ring-2 focus:ring-navy/30 border border-navy/30 dark:bg-brand dark:text-gold dark:hover:bg-brand/80 dark:focus:ring-brand/40"
              onClick={() => setDrawModal(null)}
            >
              {t('common.close')}
            </button>
          </div>
        </ModalBackdrop>
      )}
    </>
  );
}
