import React, { useContext, useEffect, useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import Nav from "../components/dashboard/Nav";
import Posts from "../components/dashboard/Posts";
import YourPosts from "../components/dashboard/YourPosts";
import { UserContext } from "../contexts/userContext";
import LoadingPopup from "../components/popups/LoadingPopup";
import PostPopup from "../components/popups/PostPopup";
import OfferPopup from "../components/popups/OfferPopup";
import Warning from "../components/popups/Warning";
import Button from "../components/general/Button";

const Dashboard = () => {
  const {
    auth,
    nav,
    loggingOut,
    editingPost,
    setEditingPost,
    editingOffer,
    warning,
  } = useContext(UserContext);
  if (loggingOut) return <LoadingPopup text={`Logging out...`} />;
  if (!auth) return <LoadingPopup text={`Authenticating...`} />;
  const handleCreatePost = () => {
    setEditingPost({});
  };
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
              <Button text="Create post" fn={handleCreatePost} />
              {nav == 0 && <Posts />}
              {nav == 1 && <YourPosts />}
            </div>
          </div>
        </div>
      </main>
      {editingPost && <PostPopup />}
      {editingOffer && <OfferPopup />}
      {warning && <Warning />}
    </div>
  );
};

export default Dashboard;
