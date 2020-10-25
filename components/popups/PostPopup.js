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
    editingPost,
    storePost,
    getUser,
    setWarning,
    resetPopups,
    posts,
  } = useContext(UserContext);
  const [filled, setFilled] = useState(false);
  const [userMadeChanges, setUserMadeChanges] = useState(false);
  const [fields, setFields] = useState({
    title: "",
    location: "",
    date: "",
    description: "",
    offers: {
      data: [],
    },
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
  const handleCreate = () => {
    const validationError = validateInput();
    if (validationError) {
      toast.error(`⚠️ ${validationError}`);
      return;
    }

    // Get relevant data
    const tempId = randomId();

    let myData = {
      ...editingPost,
      ...fields,
      date: fields.date.toString(),
      status: "OPEN",
      _id: tempId,
    };

    // Create local copy
    storePost(
      {
        ...myData,
        user: {
          _id: getUser()._id,
        },
      },
      { add: true }
    );
    fauna({
      type: "CREATE_POST",
      userId: getUser()._id,
      data: myData,
    }).then(
      (data) => {
        // Remove temp (local)
        storePost({ _id: tempId }, { del: true });
        // Create data based on db
        storePost(data.createPost, { add: true });
        console.info("Post created successfully!");
      },
      (err) => toast.error(`Error: failed to save: ${err}`)
    );
  };
  const handleUpdate = () => {
    const validationError = validateInput();
    if (validationError) {
      toast.error(`⚠️ ${validationError}`);
      return;
    }

    // Get relevant data
    let myData = { ...editingPost, ...fields };
    storePost(myData, {});
    fauna({
      type: "UPDATE_POST",
      id: myData._id,
      data: myData,
    }).then(
      () => console.info("Post updated successfully!"),
      (err) => toast.error(`Error: failed to save: ${err}`)
    );
  };
  const handleDelete = (event) => {
    if (event) event.preventDefault();
    setWarning({
      text: "Are you sure you want to delete this post?",
      fn: () => {
        storePost(editingPost, { del: true });

        fauna({ type: "DELETE_POST", id: editingPost._id }).then(
          () => console.info("Post deleted successfully!"),
          (err) => toast.error(`Error: failed to save: ${err}`)
        );
      },
    });
  };
  const handleCancel = () => {
    if (userMadeChanges) {
      setWarning({
        text:
          "Are you sure you want to cancel editing? All unsaved changes will be lost.",
      });
    } else {
      resetPopups();
    }
  };
  useEffect(() => {
    if (!filled) {
      // Updating post
      setFilled(true);

      if (editingPost.title) {
        setFields({
          title: editingPost.title || "",
          location: editingPost.location || "",
          date: editingPost.date || "",
          description: editingPost.description || "",
        });
      }
    }
  });
  return (
    <ReactModal
      className="popup"
      isOpen={true}
      overlayClassName="popup-container"
      onRequestClose={handleCancel}
    >
      <div className="popup__header">
        <h4 className="popup__header--title">
          {editingPost.title ? "Edit post" : "Create post"}
        </h4>
        <i
          onClick={handleCancel}
          className={`fa fa-close popup__header--close`}
        ></i>
      </div>
      <form>
        <div>
          <label>Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={fields.title}
            onChange={handleChange}
          />

          <label>Location</label>
          <input
            type="text"
            id="location"
            name="location"
            value={fields.location}
            onChange={handleChange}
          />

          <label>Before when?</label>
          <DatePicker
            selected={Date.parse(fields.date)}
            onChange={(date) => handleChangeDate(date)}
          />

          <label>Description</label>
          <textarea
            type="text"
            id="description"
            name="description"
            value={fields.description}
            onChange={handleChange}
          />

          {editingPost.title ? (
            <>
              <Button text="Save" altText="Saving..." fn={handleUpdate} />
              <Button
                text="Delete"
                altText="Deleting..."
                color="red"
                fn={handleDelete}
              />
            </>
          ) : (
            <Button text="Create" altText="Creating..." fn={handleCreate} />
          )}
        </div>
      </form>
    </ReactModal>
  );
};

export default PostPopup;
