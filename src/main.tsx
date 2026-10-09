import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import { DataProvider } from './store'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Vehicles from './pages/Vehicles'
import Drivers from './pages/Drivers'
import Shipments from './pages/Shipments'
import Tracking from './pages/Tracking'
import Search from './pages/Search'
import Notifications from './pages/Notifications'

createRoot(document.getElementById('root')!).render(
  <StrictMode><DataProvider><BrowserRouter><Routes><Route element={<Layout />}>
    <Route index element={<Dashboard />} /><Route path="vehicles" element={<Vehicles />} /><Route path="drivers" element={<Drivers />} />
    <Route path="shipments" element={<Shipments />} /><Route path="tracking" element={<Tracking />} /><Route path="search" element={<Search />} /><Route path="notifications" element={<Notifications />} />
  </Route></Routes></BrowserRouter></DataProvider></StrictMode>,
)
