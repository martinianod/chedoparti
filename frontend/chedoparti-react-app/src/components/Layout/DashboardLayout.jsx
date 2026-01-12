import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../../context/UIContext.jsx';

export default function DashboardLayout() {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${collapsed ? 'md:ml-20' : 'md:ml-64'}`}
      >
        <Topbar />
        <main className="p-6 md:p-8 lg:p-10 w-full">
          <div className="mx-auto max-w-screen-2xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
