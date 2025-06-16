import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Comidas {
  desayuno: string;
  almuerzo: string;
  cena: string;
  snacks?: string;
}

interface Menu {
  [key: string]: Comidas;
}

interface MenuResponse {
  menu: Menu;
  lista_compras: string[];
}

export const MenuSemanalView = () => {
  const { userId } = useParams<{ userId: string }>();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/menu/${userId}`);
        if (!response.ok) {
          throw new Error('Error al cargar el menú');
        }
        const data = await response.json();
        setMenu(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el menú');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchMenu();
    } else {
      setError('No se proporcionó un ID de usuario');
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando tu plan de comidas...</p>
        </div>
      </div>
    );
  }
  if (error || !menu || !menu.menu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'No se encontró el menú'}</p>
        </div>
      </div>
    );
  }
  const dias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Tu Plan de Comidas Semanal</h1>
          <p className="text-gray-600">Plan personalizado para alcanzar tus objetivos</p>
          {userId && (
            <Link
              to={`/compras/${userId}`}
              className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Ver Lista de Compras
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dias.map((dia) => {
            const comidasDelDia = menu.menu[dia];
            if (!comidasDelDia) return null;
            return (
              <div key={dia} className="bg-white rounded-xl shadow p-4 flex flex-col">
                <h3 className="text-xl font-medium text-gray-700 mb-2 capitalize text-center">{dia}</h3>
                <div className="flex-1 space-y-2">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="font-medium text-blue-800 mb-1">Desayuno</p>
                    <p className="text-gray-700">{comidasDelDia.desayuno}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="font-medium text-green-800 mb-1">Almuerzo</p>
                    <p className="text-gray-700">{comidasDelDia.almuerzo}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="font-medium text-purple-800 mb-1">Cena</p>
                    <p className="text-gray-700">{comidasDelDia.cena}</p>
                  </div>
                  {comidasDelDia.snacks && (
                    <div className="bg-yellow-50 rounded-lg p-2">
                      <p className="font-medium text-yellow-800 mb-1">Snacks</p>
                      <p className="text-gray-700">{comidasDelDia.snacks}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ListaComprasView = () => {
  const { userId } = useParams<{ userId: string }>();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/menu/${userId}`);
        if (!response.ok) {
          throw new Error('Error al cargar la lista de compras');
        }
        const data = await response.json();
        setMenu(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la lista de compras');
      } finally {
        setIsLoading(false);
      }
    };
    if (userId) {
      fetchMenu();
    } else {
      setError('No se proporcionó un ID de usuario');
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando la lista de compras...</p>
        </div>
      </div>
    );
  }
  if (error || !menu || !menu.lista_compras) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'No se encontró la lista de compras'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Lista de Compras</h1>
          <p className="text-gray-600">Todo lo que necesitas para tu semana</p>
          {userId && (
            <Link
              to={`/menu/${userId}`}
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Ver Menú Semanal
            </Link>
          )}
        </div>
        <div className="space-y-3">
          {menu.lista_compras.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                id={`item-${index}`}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`item-${index}`} className="text-gray-700 flex-1">
                {item}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 