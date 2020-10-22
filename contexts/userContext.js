import React, { createContext, useState, useEffect } from "react";
import { fauna } from "../lib/api";
import { toast } from "react-toastify";
import Router from "next/router";

export const UserContext = createContext();

const UserContextProvider = (props) => {
  /**
   * USER
   */
  const [dummy, setDummy] = useState(false);
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [nav, setNav] = useState(0);
  const [loggingOut, setLoggingOut] = useState(null);
  const getUser = () => {
    return user;
  };
  const clearUser = () => {
    console.log("clearUser");

    const userId = JSON.parse(localStorage.getItem("userId"));
    console.log("userId", userId);

    // Get user away from dashboard
    if (Router.pathname.startsWith("/dashboard")) {
      Router.push("/login");
    }

    // Reset localstorage
    localStorage.removeItem("userId");

    // Reset state
    setUser(null);
    reset();
  };
  const userExists = () => {
    return !!user && user.username;
  };
  const storeUser = (data) => {
    setUser((prevUser) => ({ ...prevUser, ...data }));
  };
  /**
   * POSTS
   */
  const [posts, setPosts] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const resetPopups = () => {
    setEditingPost(null);
    setWarning(false);
  };
  const storePost = (postData, { add, del, newId }) => {
    if (del) {
      // Delete post
      let newPosts = posts.filter((x) => x._id !== postData._id);
      reset();
      setPosts(newPosts);
      resetPopups();
      return;
    } else if (add) {
      // Add post
      setPosts([...posts, postData]);
      resetPopups();
      return;
    }

    posts.forEach((post, r) => {
      if (post._id === postData._id) {
        if (newId) {
          posts[r]._id = newId;
          setEditingPost(posts[r]);
        } else {
          const newPost = { ...post, ...postData };
          posts[r] = newPost;
          setEditingPost(newPost);
        }
      }
    });

    resetPopups();
  };
  /**
   * MISC
   */
  const [warning, setWarning] = useState(false);
  const reset = () => {
    setNav(0);
  };
  useEffect(() => {
    if (user == null) {
      const userId = JSON.parse(localStorage.getItem("userId"));
      if (userId != null) {
        fauna({ type: "READ_USER", id: userId }).then(
          (data) => {
            if (!data.findUserByID) {
              console.error("Unauthenticated. Data:", data);
              toast.error(`⚠️ Unauthenticated`);
              clearUser();
              return;
            }
            storeUser(data.findUserByID);
            console.log("readUser");
            console.table(data.findUserByID);

            setAuth(true);
          },
          (err) => {
            toast.error(`⚠️ ${err}`);
            console.error("Failed getting the user data:", err);
            clearUser();
          }
        );
      } else {
        // There is no user data
        console.log("No user data");
        clearUser();
      }
    }
  }, [user]);
  return (
    <UserContext.Provider
      value={{
        loggingOut,
        setLoggingOut,
        getUser,
        clearUser,
        userExists,
        dummy,
        setDummy,
        user,
        storeUser,
        auth,
        setAuth,
        nav,
        setNav,
        reset,
        editingPost,
        setEditingPost,
        storePost,
        posts,
        setPosts,
        warning,
        setWarning,
        resetPopups,
      }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
