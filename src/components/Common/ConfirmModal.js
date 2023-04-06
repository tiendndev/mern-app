import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import HTMLReactParser from "html-react-parser";

import "./ConfirmModal.scss";
import { MODAL_ACTION_CONFIRM, MODAL_ACTION_CLOSE } from "utilities/constants";

function ConfirmModal(props) {
   const { title, message, show, onAction } = props;

   return (
      <Modal
         show={show}
         onHide={() => onAction("close")}
         // backdrop giúp click chuột ra window sẽ ko ẩn modal
         backdrop="static"
         // keyboard giúp ấn phím sẽ không ẩn modal
         keyboard={false}
      >
         {/* Nếu console báo lỗi bởi strictMode thì thêm animation={false} */}
         <Modal.Header closeButton>
            <Modal.Title>{HTMLReactParser(title)}</Modal.Title>
         </Modal.Header>

         <Modal.Body className="modal-message">
            {HTMLReactParser(message)}
         </Modal.Body>

         <Modal.Footer>
            <Button variant="secondary" onClick={() => onAction("close")}>
               {MODAL_ACTION_CLOSE}
            </Button>

            <Button variant="primary" onClick={() => onAction("confirm")}>
               {MODAL_ACTION_CONFIRM}
            </Button>
         </Modal.Footer>
      </Modal>
   );
}

export default ConfirmModal;
