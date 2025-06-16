import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserForm } from './components/forms/UserForm'
import { MenuView } from './components/menu/MenuView'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<UserForm />} />
          <Route path="/menu/:userId" element={<MenuView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
