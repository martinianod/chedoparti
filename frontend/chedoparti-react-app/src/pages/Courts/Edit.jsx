import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { courtsApi, institutionsApi } from '../../services/api';
import { useForm } from 'react-hook-form';
import Card from '../../components/ui/Card';
import DeleteButton from '../../components/ui/DeleteButton';
import SaveButton from '../../components/ui/SaveButton';
import courtsConfig from '../../config/courts.json';
import SportIcon from '../../components/ui/SportIcon';

export default function CourtEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';
  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      name: '',
      type: '',
      sport: 'Padel',
      indoor: false,
      surface: '',
      lights: false,
      net: false,
      size: '',
    },
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [institutionId, setInstitutionId] = useState(1);
  const sportsList = Object.keys(courtsConfig);
  const [currentSport, setCurrentSport] = useState('Padel');
  const sport = watch('sport');
  const fields = courtsConfig[currentSport]?.fields || [];
  const iconName = courtsConfig[currentSport]?.icon || '';

  // Get institution ID
  useEffect(() => {
    const getInstitutionId = async () => {
      try {
        const response = await institutionsApi.list();
        const institutions = response?.data || [];
        if (institutions.length > 0) {
          setInstitutionId(institutions[0].id);
        }
      } catch (error) {
        console.warn('Could not fetch institutions, using default ID 1');
        setInstitutionId(1);
      }
    };
    getInstitutionId();
  }, []);

  useEffect(() => {
    if (!isNew && institutionId) {
      courtsApi
        .get(institutionId, id)
        .then((r) => {
          const data = r.data || {
            name: '',
            type: '',
            sport: 'Padel',
            indoor: false,
            surface: '',
            lights: false,
            net: false,
            size: '',
          };
          reset(data);
          setCurrentSport(data.sport || 'Padel');
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, isNew, reset, institutionId]);

  // Actualizar el deporte local si el usuario lo cambia al crear
  useEffect(() => {
    if (isNew) setCurrentSport(sport);
  }, [sport, isNew]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (isNew) await courtsApi.create(institutionId, data);
      else await courtsApi.update(institutionId, id, data);
      navigate('/courts');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isNew && confirm('¿Eliminar cancha?')) {
      await courtsApi.remove(institutionId, id);
      navigate('/courts');
    }
  };

  if (loading)
    return (
      <div className="p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100">
        Cargando...
      </div>
    );
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-xl">
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <h1 className="mb-4 text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-blue-100">
            <SportIcon name={iconName} className="w-6 h-6" />
            {isNew ? 'Nueva cancha' : 'Editar cancha'}
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label text-gray-700 dark:text-blue-200">Deporte</label>
              <select
                className="input bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-400"
                {...register('sport')}
                disabled={!isNew}
              >
                {sportsList.map((s) => (
                  <option
                    key={s}
                    value={s}
                    className="bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100"
                  >
                    {courtsConfig[s]?.icon ? `${courtsConfig[s].icon} ` : ''}
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label text-gray-700 dark:text-blue-200">Nombre</label>
              <input
                className="input bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-400"
                {...register('name', { required: true })}
              />
            </div>
            <div>
              <label className="label text-gray-700 dark:text-blue-200">Tipo</label>
              <input
                className="input bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-400"
                {...register('type')}
                placeholder="blanda / dura / césped..."
              />
            </div>
            {/* Campos dinámicos desde config */}
            {fields.map((field) => {
              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="flex gap-6 items-center">
                    <label className="flex items-center gap-2 text-gray-700 dark:text-blue-200">
                      <input
                        type="checkbox"
                        {...register(field.name)}
                        className="form-checkbox h-5 w-5 text-green-600 border-gray-300 dark:border-blue-400"
                      />
                      <span>{field.label}</span>
                    </label>
                  </div>
                );
              }
              if (field.type === 'select') {
                return (
                  <div key={field.name}>
                    <label className="label text-gray-700 dark:text-blue-200">{field.label}</label>
                    <select
                      className="input bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-400"
                      {...register(field.name)}
                    >
                      <option
                        value=""
                        className="bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100"
                      >
                        Selecciona {field.label.toLowerCase()}
                      </option>
                      {field.options.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100"
                        >
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }
              if (field.type === 'text') {
                return (
                  <div key={field.name}>
                    <label className="label text-gray-700 dark:text-blue-200">{field.label}</label>
                    <input
                      className="input bg-white dark:bg-gray-900 text-gray-800 dark:text-blue-100 border border-gray-300 dark:border-blue-400"
                      {...register(field.name)}
                      placeholder={field.placeholder || ''}
                    />
                  </div>
                );
              }
              return null;
            })}
            <div className="flex gap-3">
              <SaveButton disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</SaveButton>
              {!isNew && <DeleteButton onClick={remove}>Eliminar</DeleteButton>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
