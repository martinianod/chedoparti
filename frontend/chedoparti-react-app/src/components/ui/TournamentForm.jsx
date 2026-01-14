import React from 'react';
import { useTranslation } from 'react-i18next';
import AddButton from './AddButton';
import SaveButton from './SaveButton';
import Button from './Button';
import tournamentOptions from '../../config/tournamentOptions.json';

// Tournament types - moved from mock to inline
const tournamentTypes = [
  { id: 1, name: 'Americano', description: 'Formato de juego rotativo donde todos juegan con todos' },
  { id: 2, name: 'Eliminación Directa', description: 'Formato de eliminación simple' },
  { id: 3, name: 'Round Robin', description: 'Todos contra todos en rondas' }
];

// Inscription options - moved from mock to inline
const inscriptionOptions = [
  { value: 'Abierta', label: 'Abierta' },
  { value: 'Cerrada', label: 'Cerrada' },
  { value: 'Próximamente', label: 'Próximamente' }
];

export default function TournamentForm({ form, onChange, onSubmit, editing, onCancel }) {
  const { t } = useTranslation();
  // Fallback to default value if form is undefined
  const safeForm =
    form !== undefined && form !== null
      ? form
      : {
          name: '',
          sport: 'Padel',
          category: [],
          gender: [],
          ageRange: [],
          date: '',
          inscription: 'Abierta',
          status: 'Programado',
          participants: 0,
        };

  // Defensive fallback for tournamentOptions
  const sports = Array.isArray(tournamentOptions?.sports) ? tournamentOptions.sports : [];
  const categories = Array.isArray(tournamentOptions?.categories)
    ? tournamentOptions.categories
    : [];
  // Mapea genderOptions y ageOptions a objetos { value, label }
  const genders = Array.isArray(tournamentOptions?.genderOptions)
    ? tournamentOptions.genderOptions.map((g) => ({ value: g, label: g }))
    : [];
  const ages = Array.isArray(tournamentOptions?.ageOptions)
    ? tournamentOptions.ageOptions.map((a) => ({ value: a, label: a }))
    : [];
  // Opciones de tipo de torneo desde mock
  const tournamentTypeOptions = Array.isArray(tournamentTypes) ? tournamentTypes : [];

  // Handlers for multi-select fields
  const handleMultiSelect = (field, value, checked) => {
    let current = Array.isArray(safeForm[field]) ? [...safeForm[field]] : [];
    if (checked) {
      if (!current.includes(value)) current.push(value);
    } else {
      current = current.filter((v) => v !== value);
    }
    onChange({ target: { name: field, value: current } });
  };
  // Handler for paid inscription checkbox
  const handlePaidInscription = (e) => {
    onChange({ target: { name: 'paidInscription', value: e.target.checked } });
    if (!e.target.checked) {
      onChange({ target: { name: 'inscriptionPrice', value: '' } });
    }
  };
  return (
    <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Tipo de torneo */}
      <div className="flex flex-col">
        <label
          htmlFor="tournamentType"
          className="mb-1 text-sm font-medium text-navy dark:text-gold"
        >
          {t('tournaments.type.label', 'Tipo de torneo')}
        </label>
        <select
          id="tournamentType"
          name="tournamentType"
          value={safeForm.tournamentType || ''}
          onChange={(e) => onChange({ target: { name: 'tournamentType', value: e.target.value } })}
          className="input"
          required
        >
          <option value="" disabled>
            {t('tournaments.type.select', 'Selecciona tipo')}
          </option>
          {tournamentTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label, opt.label)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label htmlFor="name" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.name')}
        </label>
        <input
          id="name"
          name="name"
          value={safeForm.name}
          onChange={(e) => onChange({ target: { name: 'name', value: e.target.value } })}
          placeholder={t('tournaments.name')}
          className="input"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="sport" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.sport')}
        </label>
        <select
          id="sport"
          name="sport"
          value={safeForm.sport}
          onChange={(e) => onChange({ target: { name: 'sport', value: e.target.value } })}
          className="input"
        >
          {sports.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.category')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {categories.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="category"
                value={opt.value}
                checked={
                  Array.isArray(safeForm.category) ? safeForm.category.includes(opt.value) : false
                }
                onChange={(e) => handleMultiSelect('category', opt.value, e.target.checked)}
              />
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.gender')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {genders.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="gender"
                value={opt.value}
                checked={
                  Array.isArray(safeForm.gender) ? safeForm.gender.includes(opt.value) : false
                }
                onChange={(e) => handleMultiSelect('gender', opt.value, e.target.checked)}
              />
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.ageRange', 'Rango de edad')}
        </label>
        <div className="flex gap-2 flex-wrap">
          {ages.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                name="ageRange"
                value={opt.value}
                checked={
                  Array.isArray(safeForm.ageRange) ? safeForm.ageRange.includes(opt.value) : false
                }
                onChange={(e) => handleMultiSelect('ageRange', opt.value, e.target.checked)}
              />
              {opt.labelKey ? t(opt.labelKey) : opt.label}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <label htmlFor="date" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.date')}
        </label>
        <input
          id="date"
          name="date"
          type="date"
          value={safeForm.date}
          onChange={(e) => onChange({ target: { name: 'date', value: e.target.value } })}
          className="input"
          required
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="participants" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.participants')}
        </label>
        <input
          id="participants"
          name="participants"
          type="number"
          min={0}
          value={safeForm.participants}
          onChange={(e) =>
            onChange({ target: { name: 'participants', value: Number(e.target.value) } })
          }
          placeholder={t('tournaments.participants')}
          className="input"
        />
      </div>
      <div className="flex flex-col">
        <label htmlFor="inscription" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.inscription')}
        </label>
        <select
          id="inscription"
          name="inscription"
          value={safeForm.inscription}
          onChange={(e) => onChange({ target: { name: 'inscription', value: e.target.value } })}
          className="input"
        >
          {Array.isArray(inscriptionOptions)
            ? inscriptionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.labelKey ? t(opt.labelKey) : opt.value}
                </option>
              ))
            : null}
        </select>
        {/* Checkbox para pago de inscripción */}
        <label className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            name="paidInscription"
            checked={!!safeForm.paidInscription}
            onChange={handlePaidInscription}
          />
          {t('tournaments.paidInscription', '¿Se paga inscripción?')}
        </label>
        {/* Campo para precio de inscripción si corresponde */}
        {safeForm.paidInscription && (
          <div className="mt-2 flex flex-col">
            <label
              htmlFor="inscriptionPrice"
              className="mb-1 text-sm font-medium text-navy dark:text-gold"
            >
              {t('tournaments.inscriptionPrice', 'Precio de inscripción')}
            </label>
            <input
              id="inscriptionPrice"
              name="inscriptionPrice"
              type="number"
              min={0}
              value={safeForm.inscriptionPrice || ''}
              onChange={(e) =>
                onChange({ target: { name: 'inscriptionPrice', value: e.target.value } })
              }
              placeholder={t('tournaments.inscriptionPrice', 'Precio de inscripción')}
              className="input"
              required={!!safeForm.paidInscription}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <label htmlFor="status" className="mb-1 text-sm font-medium text-navy dark:text-gold">
          {t('tournaments.status')}
        </label>
        <select
          id="status"
          name="status"
          value={safeForm.status}
          onChange={(e) => onChange({ target: { name: 'status', value: e.target.value } })}
          className="input"
        >
          <option value="Programado">{t('tournaments.scheduled')}</option>
          <option value="En curso">{t('tournaments.ongoing')}</option>
          <option value="Finalizado">{t('tournaments.finished')}</option>
        </select>
      </div>
      <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2 mt-6 justify-end items-center">
        {!editing ? (
          <AddButton type="submit" className="w-full md:w-auto">
            {t('tournaments.create')}
          </AddButton>
        ) : (
          <SaveButton type="submit" className="w-full md:w-auto">
            {t('common.save')}
          </SaveButton>
        )}
        <Button type="button" variant="outline" onClick={onCancel} className="w-full md:w-auto">
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  );
}
