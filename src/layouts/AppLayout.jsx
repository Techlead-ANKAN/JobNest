// Dependencies
import React from "react";
import { Outlet } from "react-router-dom";

// ShadCN Ui
import Header from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";

function AppLayout() {
  return (
    <div>
      <div className="grid-background"></div>

      <main className="min-h-screen ">
        <Header />
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default AppLayout;
