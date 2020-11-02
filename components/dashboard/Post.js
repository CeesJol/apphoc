import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";

const Post = ({ post }) => {
  const {
    getUser,
    setEditingPost,
    setEditingOffer,
    setViewingOffer,
  } = useContext(UserContext);
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
      case "open":
        return <p style={{ color: "green" }}>Status: open</p>;
      case "taken":
        return <p style={{ color: "orange" }}>Status: taken</p>;
      case "completed":
        return <p style={{ color: "red" }}>Status: completed</p>;
      default:
        return <></>;
    }
  };
  const drawOffer = (offer) => {
    return (
      <li>
        <a
          onClick={() =>
            setViewingOffer({ ...offer, postId: post._id, active: false })
          }
        >
          {offer.username}
        </a>
      </li>
    );
  };
  const drawOffers = () => {
    if (!post.offers || !post.offers.data.length) {
      return (
        // There are no offers
        <p>
          <i>No offers have been placed yet</i>
        </p>
      );
    }

    if (post.user._id === getUser()._id) {
      // This is your own post
      if (post.status === "taken") {
        // Show the offer that you chose
        return (
          <p>
            <i>
              Task has been connected to {post.acceptedOffer.username}. (
              <a
                onClick={() =>
                  setViewingOffer({
                    ...post.acceptedOffer,
                    postId: post._id,
                    active: true,
                  })
                }
              >
                view offer
              </a>
              )
            </i>
          </p>
        );
      }

      return (
        // Show the offers
        <>
          <p>
            <i>Offers from:</i>
          </p>
          <ul>{post.offers.data.map((offer) => drawOffer(offer))}</ul>
        </>
      );
    }

    // This is someone else's post
    if (post.status === "taken") {
      if (post.acceptedOffer._id === getUser()._id) {
        return (
          // Show that you have been chosen
          <p style={{ color: "green" }}>
            <i>Customer chose you for this job</i>
          </p>
        );
      }

      // Show the offer that the customer chose
      return (
        <p>
          <i>Task has been connected to someone already.</i>
        </p>
      );
    }

    if (
      post.offers.data.filter((offer) => offer._id === getUser()._id).length > 0
    ) {
      if (post.offers.data.length === 1) {
        // You are the only offer
        return (
          // Show the number of offers
          <p>
            <i>Number of offers: 1 (you)</i>
          </p>
        );
      }

      return (
        // Show the number of offers, and your name
        <p>
          <i>Offers from: you and {post.offers.data.length - 1} others</i>
        </p>
      );
    }

    return (
      // Show the number of offers
      <p>
        <i>Number of offers: {post.offers.data.length}</i>
      </p>
    );
  };
  return (
    <div className="dashboard__item">
      <h4 className="dashboard__item--title">{post.title}</h4>
      {drawStatus(post.status)}
      <i>
        Before {getReadableDate(post.date)} - {post.location}
      </i>
      <p>{post.description}</p>

      {drawOffers()}

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
