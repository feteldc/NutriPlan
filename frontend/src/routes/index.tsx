import { createBrowserRouter } from 'react-router-dom';
import { UserForm } from '../components/forms/UserForm';
import { MenuView } from '../components/menu/MenuView';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UserForm />,
  },
  {
    path: '/menu/:userId',
    element: <MenuView />,
  },
]); 