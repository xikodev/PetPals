import { Link, Outlet, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RequireLogin from './components/RequireLogin.jsx'

function Layout() {
  return (
    <>
      <nav>
        <Link to="/">PetPals</Link>{' | '}
        <Link to="/login">Prijava</Link>{' | '}
        <Link to="/profile">Moj profil</Link>{' | '}
        <Link to="/my-listings">Moji oglasi</Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />

        <Route element={<RequireLogin />}>
          <Route path="profile" element={<h1>Moj profil</h1>} />
          <Route path="my-listings" element={<h1>Moji oglasi</h1>} />
        </Route>
      </Route>
    </Routes>
  )
}