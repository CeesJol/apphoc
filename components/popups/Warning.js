import React, { useContext } from "react";
import { UserContext } from "../../contexts/userContext";
import Button from "../general/Button";
import ReactModal from "react-modal";
import { toast } from "react-toastify";
ReactModal.setAppElement("#__next");

const Warning = () => {
  const { warning, setWarning, resetPopups } = useContext(UserContext);
  const handleYes = async () => {
    if (warning.fn) await warning.fn();
    resetPopups();
  };
  const handleCancel = () => {
    setWarning(false);
  };
  return (
    <ReactModal
      className="popup popup--medium"
      isOpen={true}
      overlayClassName="popup-container"
      onRequestClose={handleCancel}
    >
      <p>
        <b>{warning.text}</b>
      </p>
      <form>
        <Button text="Yes" fn={handleYes} />
        <Button text="Cancel" color="red" fn={handleCancel} />
      </form>
    </ReactModal>
  );
};

export default Warning;
