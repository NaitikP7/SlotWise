import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background-light font-display text-text-main flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
}
