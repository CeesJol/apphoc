import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../../contexts/userContext";
import Button from "../general/Button";
import { toast } from "react-toastify";
import { fauna } from "../../lib/api";
import randomId from "../../lib/randomId";
import ReactModal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
ReactModal.setAppElement("#__next");

const PostPopup = () => {
  const {
    editingOffer,
    storePost,
    getUser,
    setWarning,
    resetPopups,
  } = useContext(UserContext);
  const [filled, setFilled] = useState(false);
  const [userMadeChanges, setUserMadeChanges] = useState(false);
  const [fields, setFields] = useState({
    title: "",
    location: "",
    date: "",
    description: "",
  });
  const handleChange = (event) => {
    setFields({
      ...fields,
      [event.target.name]: event.target.value,
    });
    if (!userMadeChanges) setUserMadeChanges(true);
  };
  const handleChangeDate = (date) => {
    setFields({
      ...fields,
      date,
    });
    if (!userMadeChanges) setUserMadeChanges(true);
  };
  const validateInput = () => {
    if (!fields.title) return "Please provide a title";
    if (!fields.location) return "Please provide a location";
    if (!fields.date) return "Please provide a date";
    if (!fields.description) return "Please provide a description";

    return false;
  };
  const handleCreateOffer = async () => {
    await fauna({
      type: "CREATE_OFFER",
      userId: getUser()._id,
      postId: editingOffer._id,
    }).then(
      (data) => {
        storePost(data.updatePost, {});
        toast.success("Offer created successfully!");
        resetPopups();
      },
      (err) => toast.error(`Error: failed to create offer: ${err}`)
    );
  };
  const handleCancelOffer = async (event) => {
    if (event) event.preventDefault();

    await fauna({
      type: "REMOVE_OFFER",
      postId: editingOffer._id,
      userId: getUser()._id,
    }).then(
      (data) => {
        storePost(data.updatePost, {});
        toast.success("Offer removed successfully!");
        resetPopups();
      },
      (err) => toast.error(`Error: failed to remove offer: ${err}`)
    );
  };
  useEffect(() => {
    if (!filled) {
      // Updating post
      setFilled(true);

      if (editingOffer.title) {
        setFields({
          title: editingOffer.title || "",
          location: editingOffer.location || "",
          date: editingOffer.date || "",
        });
      }
    }
  });
  return (
    <ReactModal
      className="popup"
      isOpen={true}
      overlayClassName="popup-container"
      onRequestClose={resetPopups}
    >
      <div className="popup__header">
        <h4 className="popup__header--title">Create offer</h4>
        <i
          onClick={resetPopups}
          className={`fa fa-close popup__header--close`}
        ></i>
      </div>
      <form>
        <div>
          {/* <p>Click below to create an offer for this post!</p> */}
          {editingOffer.offers.data.find(
            (offer) => offer._id === getUser()._id
          ) ? (
            // User has already made an offer
            <Button
              text="Cancel offer"
              altText="Canceling offer..."
              color="red"
              fn={handleCancelOffer}
            />
          ) : (
            // User has not made offer yet
            <Button
              text="Create offer"
              altText="Creating offer..."
              fn={handleCreateOffer}
            />
          )}
        </div>
      </form>
    </ReactModal>
  );
};

export default PostPopup;
