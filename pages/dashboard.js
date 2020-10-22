import React, { useContext, useEffect, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Nav from "../components/dashboard/Nav";
import { UserContext } from "../contexts/userContext";
import LoadingPopup from "../components/popups/LoadingPopup";

const Dashboard = () => {
  const { auth, nav, loggingOut } = useContext(UserContext);
  if (loggingOut) return <LoadingPopup text={`Logging out...`} />;
  if (!auth) return <LoadingPopup text={`Authenticating...`} />;
  return (
    <div className="dashboard-container">
      <div>
        <DashboardHeader />
        <Nav />
      </div>
      <main>
        <div className="dashboard">
          <div className="dashboard__main">
            <div className="dashboard__main__content">
              {nav == 0 && <p>Whaddup</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
