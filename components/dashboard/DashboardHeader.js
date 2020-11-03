import React, { useContext, useState } from "react";
import Router from "next/router";
import { UserContext } from "../../contexts/userContext";
import { fauna } from "../../lib/api";

const DashboardHeader = () => {
  const {
    userExists,
    getUser,
    clearUser,
    setLoggingOut,
    setAuth,
    reset,
  } = useContext(UserContext);
  const handleLogout = async () => {
    setLoggingOut(true);
    setAuth(false);
    await fauna({ type: "LOGOUT_USER" });
    clearUser();
  };
  const handleGoBack = () => {
    reset();
  };
  return (
    <header className="header">
      <div className="header__content header__content--dashboard">
        <div className="header__left">
          <div className="icon-container">
            <h3>
              <a className="header__title" onClick={handleGoBack}>
                <img className="icon--large" src="../jc.png" />
                <span className="header__title--text">
                  {userExists() ? getUser().username : process.env.APP_NAME}
                </span>
              </a>
            </h3>
          </div>
        </div>
        <div className="header__right">
          <a onClick={handleLogout}>Log out</a>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
