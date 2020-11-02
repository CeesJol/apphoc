import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import Button from "../general/Button";
import { toast } from "react-toastify";
import { fauna } from "../../lib/api";
import ReactModal from "react-modal";
import "react-datepicker/dist/react-datepicker.css";
ReactModal.setAppElement("#__next");

const PostPopup = () => {
  const { storePost, viewingOffer, resetPopups } = useContext(UserContext);
  const handleAcceptOffer = async () => {
    await fauna({
      type: "ACCEPT_OFFER",
      postId: viewingOffer.postId,
      userId: viewingOffer._id,
    }).then(
      (data) => {
        console.log("data.updatePost:", data.updatePost);
        storePost(data.updatePost, {});
        toast.success("Offer accepted successfully!");
        resetPopups();
      },
      (err) => toast.error(`Error: failed to accept offer: ${err}`)
    );
  };
  const handleCancelOffer = async () => {
    await fauna({
      type: "CANCEL_OFFER",
      postId: viewingOffer.postId,
      userId: viewingOffer._id,
    }).then(
      (data) => {
        console.log("data.updatePost:", data.updatePost);
        storePost(data.updatePost, {});
        toast.success("Offer cancelled successfully!");
        resetPopups();
      },
      (err) => toast.error(`Error: failed to cancel offer: ${err}`)
    );
  };
  return (
    <ReactModal
      className="popup"
      isOpen={true}
      overlayClassName="popup-container"
      onRequestClose={resetPopups}
    >
      <div className="popup__header">
        <h4 className="popup__header--title">View offer</h4>
        <i
          onClick={resetPopups}
          className={`fa fa-close popup__header--close`}
        ></i>
      </div>
      <form>
        <div>
          <p>This offer is from {viewingOffer.username}.</p>
          {!viewingOffer.active ? (
            <>
              <Button
                text="Accept offer"
                altText="Accepting offer..."
                fn={handleAcceptOffer}
              />
            </>
          ) : (
            <>
              <Button
                text="Cancel offer"
                altText="Cancelling offer..."
                fn={handleCancelOffer}
                color="red"
              />
            </>
          )}
        </div>
      </form>
    </ReactModal>
  );
};

export default PostPopup;
