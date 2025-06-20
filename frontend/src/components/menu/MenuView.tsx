import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import type { MenuResponse } from '../../types/menu';

interface Comidas {
  desayuno: string;
  almuerzo: string;
  cena: string;
  snacks?: string;
}

interface Menu {
  [key: string]: Comidas;
}

export const MenuSemanalView = () => {
  const { userId } = useParams<{ userId: string }>();
  const [menu, setMenu] = useState<MenuResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemsComprados, setItemsComprados] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    navigate('/');
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (!userId) {
          throw new Error('No se proporcionó un ID de usuario');
        }

        const userDoc = await getDoc(doc(db, 'usuarios', userId));
        if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado');
        }

        const userData = userDoc.data();
        setMenu({
          menu: userData.menu,
          lista_compras: userData.lista_compras
        });

        // Cargar estado de items comprados si existe
        if (userData.items_comprados) {
          setItemsComprados(new Set(userData.items_comprados));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el menú');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [userId]);

  const handleItemToggle = async (index: number) => {
    if (!userId) return;

    try {
      const newItemsComprados = new Set(itemsComprados);
      if (newItemsComprados.has(index)) {
        newItemsComprados.delete(index);
      } else {
        newItemsComprados.add(index);
      }
      setItemsComprados(newItemsComprados);

      await updateDoc(doc(db, 'usuarios', userId), {
        items_comprados: Array.from(newItemsComprados)
      });
    } catch (err) {
      console.error('Error al actualizar estado de compra:', err);
      // Revertir el cambio en el estado local
      setItemsComprados(itemsComprados);
    }
  };

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
          <div className="flex justify-center gap-4 mt-4">
            {userId && (
              <Link
                to={`/compras/${userId}`}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Ver Lista de Compras Completa
              </Link>
            )}
            <button
              onClick={handleCerrarSesion}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Estadísticas del Usuario */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Tu Perfil Nutricional</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">{menu.menu.lunes?.desayuno ? '✅' : '⏳'}</div>
              <div className="text-sm text-gray-600">Plan Generado</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-1">{itemsComprados.size}</div>
              <div className="text-sm text-gray-600">Items Comprados</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">{menu.lista_compras.length}</div>
              <div className="text-sm text-gray-600">Total Items</div>
            </div>
          </div>
        </div>

        {/* Menú Semanal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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

        {/* Lista de Compras */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Compras</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.lista_compras.map((item, index) => (
              <div
                key={index}
                onClick={() => handleItemToggle(index)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  itemsComprados.has(index) 
                    ? 'bg-green-50 border-2 border-green-200' 
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    itemsComprados.has(index) 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400'
                  }`}>
                    {itemsComprados.has(index) && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-gray-700 font-medium ${
                    itemsComprados.has(index) ? 'line-through text-gray-500' : ''
                  }`}>
                    {item}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Estadísticas de compras */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-blue-800 font-medium">
                Progreso de compras: {itemsComprados.size} de {menu.lista_compras.length} items
              </span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(itemsComprados.size / menu.lista_compras.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
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
  const [itemsComprados, setItemsComprados] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        if (!userId) {
          throw new Error('No se proporcionó un ID de usuario');
        }

        const userDoc = await getDoc(doc(db, 'usuarios', userId));
        if (!userDoc.exists()) {
          throw new Error('Usuario no encontrado');
        }

        const userData = userDoc.data();
        setMenu({
          menu: userData.menu,
          lista_compras: userData.lista_compras
        });

        // Cargar estado de items comprados si existe
        if (userData.items_comprados) {
          setItemsComprados(new Set(userData.items_comprados));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar la lista de compras');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [userId]);

  const handleItemToggle = (index: number) => {
    const newItemsComprados = new Set(itemsComprados);
    if (newItemsComprados.has(index)) {
      newItemsComprados.delete(index);
    } else {
      newItemsComprados.add(index);
    }
    setItemsComprados(newItemsComprados);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      if (!userId) return;
      
      setIsSaving(true);
      setError(null);
      
      await updateDoc(doc(db, 'usuarios', userId), {
        items_comprados: Array.from(itemsComprados)
      });
      
      setSaveSuccess(true);
    } catch (err) {
      console.error('Error al guardar:', err);
      setError('Error al guardar los cambios');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = () => {
    setItemsComprados(new Set());
    setSaveSuccess(false);
  };

  const handleMarkAllComplete = () => {
    if (!menu) return;
    const allItems = new Set(menu.lista_compras.map((_, index) => index));
    setItemsComprados(allItems);
    setSaveSuccess(false);
  };

  // Filtrar items según búsqueda y estado
  const filteredItems = menu?.lista_compras.filter((item, index) => {
    const matchesSearch = item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = showCompleted || !itemsComprados.has(index);
    return matchesSearch && matchesFilter;
  }) || [];

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No se encontró información del menú</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Lista de Compras</h1>
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link
              to={`/menu/${userId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver al Menú
            </Link>
          </div>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            Cambios guardados exitosamente
          </div>
        )}

        {/* Controles de filtro y búsqueda */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar ingredientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mostrar completados</span>
              </label>
              <button
                onClick={handleMarkAllComplete}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                Marcar todo
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Limpiar todo
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{menu.lista_compras.length}</div>
              <div className="text-sm text-gray-600">Total items</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{itemsComprados.size}</div>
              <div className="text-sm text-gray-600">Completados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{menu.lista_compras.length - itemsComprados.size}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((itemsComprados.size / menu.lista_compras.length) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Progreso</div>
            </div>
          </div>
        </div>

        {/* Lista de items */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No se encontraron items que coincidan con tu búsqueda</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredItems.map((item, index) => {
                const originalIndex = menu.lista_compras.indexOf(item);
                return (
                  <li 
                    key={originalIndex} 
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      itemsComprados.has(originalIndex) ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={itemsComprados.has(originalIndex)}
                      onChange={() => handleItemToggle(originalIndex)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className={`text-gray-700 flex-1 ${
                      itemsComprados.has(originalIndex) ? 'line-through text-gray-500' : ''
                    }`}>
                      {item}
                    </span>
                    {itemsComprados.has(originalIndex) && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Completado
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}; 