import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

const Post = ({ post }) => {
  const { getUser, setEditingPost, setEditingOffer } = useContext(UserContext);
  const handleEditPost = () => {
    setEditingPost(post);
  };
  const handleMakeOffer = () => {
    setEditingOffer(post);
  };
  const handleCancelOffer = () => {
    setEditingOffer(post);
  };
  const getReadableDate = (date) => {
    return new Date(date).toDateString();
  };
  const drawStatus = (status) => {
    switch (status) {
      case "OPEN":
        return <p style={{ color: "green" }}>Status: open</p>;
      case "TAKEN":
        return <p style={{ color: "orange" }}>Status: taken</p>;
      case "COMPLETED":
        return <p style={{ color: "red" }}>Status: completed</p>;
      default:
        return <></>;
    }
  };
  const drawOffer = (offer, index) => {
    return offer.username + (index < post.offers.data.length - 1 ? ", " : "");
  };
  return (
    <div className="dashboard__item">
      <h4 className="dashboard__item--title">{post.title}</h4>
      {drawStatus(post.status)}
      <i>
        Before {getReadableDate(post.date)} - {post.location}
      </i>
      <p>{post.description}</p>

      {post.offers && post.offers.data.length > 0 ? (
        <p>
          Offers from: {post.offers.data.map((offer, i) => drawOffer(offer, i))}
        </p>
      ) : (
        <p>
          <i>No offers have been placed yet</i>
        </p>
      )}
      {post.user._id === getUser()._id ? (
        // This is your own post
        <a onClick={handleEditPost}>Edit this post</a>
      ) : post.offers.data.find((offer) => offer._id === getUser()._id) ? (
        // You have already made an offer
        <a onClick={handleCancelOffer}>Cancel offer</a>
      ) : (
        // You haven't made an offer yet
        <a onClick={handleMakeOffer}>Make offer</a>
      )}
    </div>
  );
};

export default Post;
