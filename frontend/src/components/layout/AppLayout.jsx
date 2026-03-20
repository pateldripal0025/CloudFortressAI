import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout = () => {
  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#030711] text-slate-200">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative h-full overflow-hidden">
        {/* Global Ambient Depth */}
        <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full -mr-96 -mt-96 pointer-events-none z-0" />
        <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full -ml-48 -mb-48 pointer-events-none z-0" />

        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 lg:ml-72 transition-all duration-500 ease-in-out">
          <div className="max-w-[1440px] mx-auto w-full px-4 md:px-8 py-6 md:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};


export default AppLayout;

