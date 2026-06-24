import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CompaniesProvider } from "../../context/companiescontext";
import { pageTransition } from "../../lib/motion";
import Sidebar from "./sidebar";
import Topbar from "./topbar";
import CommandPalette from "./commandpalette";

export default function AppShell() {
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  return (
    <CompaniesProvider>
      <div className="app-shell">
        <Sidebar open={drawer} onNavigate={() => setDrawer(false)} />

        <AnimatePresence>
          {drawer && (
            <motion.div
              className="drawer-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawer(false)}
            />
          )}
        </AnimatePresence>

        <div className="main-area">
          <Topbar onMenu={() => setDrawer(true)} />
          <main className="main-content">
            <div className="page-frame">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  variants={pageTransition}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>

        <CommandPalette />
      </div>
    </CompaniesProvider>
  );
}
