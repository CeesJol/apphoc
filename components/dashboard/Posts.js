import React, { useContext, useEffect } from "react";
import Post from "./Post";
import { fauna } from "../../lib/api";
import { UserContext } from "../../contexts/userContext";
import { toast } from "react-toastify";

const Posts = () => {
  const { posts, setPosts } = useContext(UserContext);
  useEffect(async () => {
    if (!posts) {
      await fauna({ type: "GET_POSTS" }).then(
        (data) => {
          setPosts(data.posts.data);
        },
        (err) => {
          toast.error("Could not retrieve posts. Please try again");
          console.error("Failed getting posts", err);
        }
      );
    }
  }, [posts]);
  if (!posts) return <p>Loading...</p>;
  return posts.map((post) => <Post post={post} key={post._id} />);
};

export default Posts;
