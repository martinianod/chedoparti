import { useEffect, useState } from 'react';
import { statsApi } from '../../services/api';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '../../components/ui/Card';

export default function StatsOverview() {
  const [data, setData] = useState([]);

  useEffect(() => {
    statsApi
      .overview()
      .then((res) => setData(Array.isArray(res.data) ? res.data : demo()))
      .catch(() => setData(demo()));
  }, []);

  return (
    <div>
      <div className="mx-auto max-w-5xl">
        <Card>
          <h1 className="mb-4 text-xl font-semibold">Estadísticas</h1>
          <div className="h-80 w-full">
            {Array.isArray(data) && data.length === 0 ? (
              <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                No hay datos disponibles.
              </div>
            ) : (
              <ResponsiveContainer>
                <LineChart data={data}>
                  <Line type="monotone" dataKey="reservas" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function demo() {
  return [
    { mes: 'Ene', reservas: 32 },
    { mes: 'Feb', reservas: 44 },
    { mes: 'Mar', reservas: 51 },
    { mes: 'Abr', reservas: 39 },
    { mes: 'May', reservas: 65 },
    { mes: 'Jun', reservas: 72 },
  ];
}
