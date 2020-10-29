import React, { useContext, useEffect, useState } from "react";
import Post from "./Post";
import { UserContext } from "../../contexts/userContext";

const YourOffers = () => {
  const { posts, getUser } = useContext(UserContext);
  const [yourOffers, setYourOffers] = useState(null);
  useEffect(() => {
    if (!yourOffers) {
      try {
        setYourOffers(
          posts.filter(
            (post) =>
              post.offers.data.filter((offer) => offer._id === getUser()._id)
                .length > 0
          )
        );
      } catch (e) {
        setYourOffers([]);
      }
    }
  });
  if (!yourOffers) return <p>Loading...</p>;
  if (yourOffers.length === 0) return <p>You don't have any offers yet.</p>;
  return yourOffers.map((post) => <Post post={post} key={post._id} />);
};

export default YourOffers;
