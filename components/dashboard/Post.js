import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

const Post = ({ post }) => {
  const { getUser, setEditingPost } = useContext(UserContext);
  const handleEditPost = () => {
    setEditingPost(post);
  };
  const getReadableDate = (date) => {
    // I don't know why this is necessary
    if (date.toString().includes(" ")) {
      var month = date.getUTCMonth() + 1; //months from 1-12
      var day = date.getUTCDate();
      var year = date.getUTCFullYear();

      return year + "/" + month + "/" + day;
    }
    return date.substring(0, 10);
  };
  return (
    <div className="dashboard__item">
      <h4 className="dashboard__item--title">{post.title}</h4>
      <i>
        Before {getReadableDate(post.date)} - {post.location}
      </i>
      <p>{post.description}</p>
      {post.user._id === getUser()._id && (
        <a onClick={handleEditPost}>Edit this post</a>
      )}
    </div>
  );
};

export default Post;
