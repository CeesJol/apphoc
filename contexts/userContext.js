import React, { createContext, useState, useEffect } from "react";
import { fauna } from "../lib/api";
import { toast } from "react-toastify";
import Router from "next/router";

export const UserContext = createContext();

const UserContextProvider = (props) => {
  /**
   * USER
   */
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const [nav, setNav] = useState(0);
  const [loggingOut, setLoggingOut] = useState(null);
  const getUser = () => {
    return user;
  };
  const clearUser = () => {
    console.info("clearUser");

    const userId = JSON.parse(localStorage.getItem("userId"));
    console.info("userId", userId);

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
  const [editingOffer, setEditingOffer] = useState(null);
  const [viewingOffer, setViewingOffer] = useState(null);
  const resetPopups = () => {
    setEditingPost(null);
    setEditingOffer(null);
    setViewingOffer(null);
    setWarning(false);
  };
  const storePost = (postData, { add, del, newId }) => {
    if (del) {
      // Delete post
      let newPosts = posts.filter((x) => x._id !== postData._id);
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
          console.info("newPost:", newPost);
          forceRender();
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
  const [dummy, setDummy] = useState(false);
  const forceRender = () => {
    setDummy(!dummy);
  };
  useEffect(() => {
    // Authenticate user
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
            console.info("readUser");
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
        console.info("No user data");
        clearUser();
      }
    }
    // Load posts
    if (!posts) {
      fauna({ type: "GET_POSTS" }).then(
        (data) => {
          console.log("data.posts.data:", data.posts.data);
          setPosts(data.posts.data);
        },
        (err) => {
          toast.error("Could not retrieve posts. Please try again");
          console.error("Failed getting posts", err);
        }
      );
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
        editingOffer,
        setEditingOffer,
        viewingOffer,
        setViewingOffer,
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
