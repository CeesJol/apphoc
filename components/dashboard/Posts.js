import React, { useContext } from "react";
import Post from "./Post";
import { UserContext } from "../../contexts/userContext";

const Posts = () => {
  const { posts } = useContext(UserContext);
  if (!posts) return <p>Loading...</p>;
  if (posts.length === 0)
    return <p>There are no posts yet. Create one above!</p>;
  return posts.map((post) => <Post post={post} key={post._id} />);
};

export default Posts;
