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
    alergias: '',
    nivelActividad: 'moderado',
    preferenciasDieteticas: [],
    horarioComida: 'normal'
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

  const handlePreferenciaChange = (preferencia: string) => {
    setFormData(prev => ({
      ...prev,
      preferenciasDieteticas: prev.preferenciasDieteticas.includes(preferencia)
        ? prev.preferenciasDieteticas.filter(p => p !== preferencia)
        : [...prev.preferenciasDieteticas, preferencia]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            NutriPlan
          </h1>
          <p className="text-gray-600 text-lg">
            Tu Planificador de Comidas Personalizado
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          </div>

          {/* Nivel de actividad */}
          <div>
            <label htmlFor="nivelActividad" className="block text-sm font-medium text-gray-700 mb-1">
              Nivel de Actividad Física
            </label>
            <select
              id="nivelActividad"
              name="nivelActividad"
              value={formData.nivelActividad}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="sedentario">Sedentario (poco ejercicio)</option>
              <option value="ligero">Ligero (1-3 días/semana)</option>
              <option value="moderado">Moderado (3-5 días/semana)</option>
              <option value="activo">Activo (6-7 días/semana)</option>
              <option value="muy-activo">Muy activo (ejercicio intenso diario)</option>
            </select>
          </div>

          {/* Preferencias dietéticas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferencias Dietéticas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Vegetariano', 'Vegano', 'Sin gluten', 'Bajo en carbohidratos', 'Alto en proteínas', 'Sin lactosa'].map(preferencia => (
                <label key={preferencia} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferenciasDieteticas.includes(preferencia)}
                    onChange={() => handlePreferenciaChange(preferencia)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{preferencia}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Horario de comida */}
          <div>
            <label htmlFor="horarioComida" className="block text-sm font-medium text-gray-700 mb-1">
              Horario de Comida Preferido
            </label>
            <select
              id="horarioComida"
              name="horarioComida"
              value={formData.horarioComida}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="normal">Normal (desayuno, almuerzo, cena)</option>
              <option value="intermitente">Ayuno intermitente</option>
              <option value="frecuente">Comidas frecuentes (5-6 al día)</option>
            </select>
          </div>

          {/* Alergias */}
          <div>
            <label htmlFor="alergias" className="block text-sm font-medium text-gray-700 mb-1">
              Alergias e Intolerancias (opcional)
            </label>
            <textarea
              id="alergias"
              name="alergias"
              value={formData.alergias}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Lista tus alergias o intolerancias separadas por comas"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generando plan personalizado...
              </span>
            ) : (
              'Generar Plan de Comidas Personalizado'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}; 