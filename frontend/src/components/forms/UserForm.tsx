import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserFormData } from '../../types/user';
import { api } from '../../services/api';

export const UserForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    edad: 0,
    peso: 0,
    objetivo: 'mantener',
    alergias: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      console.log('Enviando datos:', formData);
      // Guardar usuario
      const { userId } = await api.guardarUsuario(formData);
      console.log('Usuario guardado con ID:', userId);
      
      // Generar menú
      await api.generarMenu({ userId });

      // Redirigir a la vista del menú
      navigate(`/menu/${userId}`);
    } catch (err) {
      console.error('Error completo:', err);
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'edad' || name === 'peso' ? Number(value) : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NutriPlan
          </h1>
          <p className="text-gray-600">
            Tu Planificador de Comidas Personalizado
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
              Edad
            </label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              min="1"
              max="120"
              placeholder="Tu edad"
            />
          </div>

          <div>
            <label htmlFor="peso" className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
            </label>
            <input
              type="number"
              id="peso"
              name="peso"
              value={formData.peso || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
              min="20"
              max="300"
              placeholder="Tu peso en kilogramos"
            />
          </div>

          <div>
            <label htmlFor="objetivo" className="block text-sm font-medium text-gray-700 mb-1">
              Objetivo
            </label>
            <select
              id="objetivo"
              name="objetivo"
              value={formData.objetivo}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            >
              <option value="perder peso">Perder peso</option>
              <option value="mantener">Mantener peso</option>
              <option value="ganar masa">Ganar masa</option>
            </select>
          </div>

          <div>
            <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
              Alergias (opcional)
            </label>
            <textarea
              id="alergias"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Lista tus alergias separadas por comas"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando plan...
              </span>
            ) : (
              'Generar Plan de Comidas'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}; 