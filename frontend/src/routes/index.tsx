import { createBrowserRouter } from 'react-router-dom';
import { UserForm } from '../components/forms/UserForm';
import { MenuSemanalView, ListaComprasView } from '../components/menu/MenuView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UserForm />,
  },
  {
    path: '/menu/:userId',
    element: <MenuSemanalView />,
  },
  {
    path: '/compras/:userId',
    element: <ListaComprasView />,
  },
]); 