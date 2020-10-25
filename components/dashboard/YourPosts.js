import React, { useContext } from "react";
import Post from "./Post";
import { UserContext } from "../../contexts/userContext";

const Posts = () => {
  const { posts, getUser } = useContext(UserContext);
  let yourPosts = posts.filter((post) => post.user._id === getUser()._id);
  if (!yourPosts) return <p>Loading...</p>;
  if (yourPosts.length === 0)
    return <p>You don't have any posts yet. Create one above!</p>;
  return yourPosts.map((post) => <Post post={post} key={post._id} />);
};

export default Posts;
