// Dependencies
import React from "react";
import { Outlet } from "react-router-dom";

// ShadCN Ui
import Header from "@/components/ui/Header";

function AppLayout() {
  return (
    <div>
      <div className="grid-background"></div>

      <main className="min-h-screen container">
        <Header />
        <Outlet />
      </main>

      <div className="p-10 text-center bg-gray-800 mt-10">Techlead-ANKAN</div>
    </div>
  );
}

export default AppLayout;
