import React, { useContext, useState, useEffect } from "react";
import Post from "./Post";
import { UserContext } from "../../contexts/userContext";

const YourOffers = () => {
  const { posts, getUser } = useContext(UserContext);
  const [yourPosts, setYourPosts] = useState(null);
  useEffect(() => {
    if (!yourPosts)
      setYourPosts(posts.filter((post) => post.user._id === getUser()._id));
  });

  if (!yourPosts) return <p>Loading...</p>;
  if (yourPosts.length === 0)
    return <p>You don't have any posts yet. Create one above!</p>;
  return yourPosts.map((post) => <Post post={post} key={post._id} />);
};

export default YourOffers;
