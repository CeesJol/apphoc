import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

const Post = ({ post }) => {
  const { getUser, setEditingPost } = useContext(UserContext);
  const handleEditPost = () => {
    setEditingPost(post);
  };
  return (
    <div className="dashboard__item">
      <h4 className="dashboard__item--title">{post.title}</h4>
      <i>
        {post.date} - {post.location}
      </i>
      <p>{post.description}</p>
      {post.user._id === getUser()._id && (
        <a onClick={handleEditPost}>Edit this post</a>
      )}
    </div>
  );
};

export default Post;
