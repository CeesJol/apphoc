import React, { useContext } from "react";
import { UserContext } from "../contexts/userContext";
import Link from "next/link";

const IndexPage = () => {
  const { auth } = useContext(UserContext);
  return (
    <>
      <h1>Welcome to {process.env.APP_NAME}</h1>
      <p>This page will be the landing page in the future.</p>
      {auth ? (
        <p>
          Since you're logged in, click
          <Link href="/dashboard">
            <a> here </a>
          </Link>
          to go to the dashboard!
        </p>
      ) : (
        <p>
          Click
          <Link href="/signup">
            <a> here </a>
          </Link>
          to create an account, or
          <Link href="/login">
            <a> here </a>
          </Link>
          to log in if you already have one.
        </p>
      )}
    </>
  );
};

export default IndexPage;
