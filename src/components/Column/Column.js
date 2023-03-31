import React, { useCallback, useEffect, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Form } from "react-bootstrap";
import { Container, Draggable } from "react-smooth-dnd";

import "./Column.scss";
import { mapOrder } from "utilities/sorts";
import Card from "components/Card/Card";
import ConfirmModal from "components/Common/ConfirmModal";
import { MODAL_ACTION_CONFIRM, MODAL_ACTION_CLOSE } from "utilities/constants";
import {
   handleSaveContentAfterPressEnter,
   selectAllInLineText,
} from "utilities/contentEditable";

function Column(props) {
   const { column, onCardDrop, onUpdateColumn } = props;
   const cards = mapOrder(column.cards, column.cardOrder, "id");

   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

   const [columnTitle, setColumnTitle] = useState("");
   useEffect(() => {
      setColumnTitle(column.title);
   }, [column.title]);

   const handleConfirmModalAction = (type) => {
      if (type === MODAL_ACTION_CONFIRM) {
         const newColumn = {
            ...column,
            _destroy: true,
         };
         onUpdateColumn(newColumn);
      }
      toggleShowConfirmModal();
   };

   const handleColumnTitleChange = useCallback((e) => {
      setColumnTitle(e.target.value);
   }, []);

   const handleColumnTitleBlur = () => {
      console.log(columnTitle);
      const newColumn = {
         ...column,
         title: columnTitle,
      };
      onUpdateColumn(newColumn);
   };

   return (
      <div className="column">
         <header className="column-drag-handle">
            <div className="column-title">
               <Form.Control
                  size="large"
                  type="text"
                  className="mern-app-content-editable"
                  value={columnTitle}
                  onClick={selectAllInLineText}
                  onMouseDown={(e) => {
                     e.preventDefault();
                  }}
                  onChange={handleColumnTitleChange}
                  onBlur={handleColumnTitleBlur}
                  onKeyDown={handleSaveContentAfterPressEnter}
                  spellCheck="false"
               />
            </div>
            <div className="column-dropdown-actions">
               <Dropdown>
                  <Dropdown.Toggle
                     id="dropdown-basic"
                     className="dropdown-btn"
                  />
                  <Dropdown.Menu>
                     <Dropdown.Item>Add card...</Dropdown.Item>
                     <Dropdown.Item onClick={toggleShowConfirmModal}>
                        Remove column
                     </Dropdown.Item>
                     <Dropdown.Item>
                        Move all cards in this column (beta)...
                     </Dropdown.Item>
                     <Dropdown.Item>
                        Archive all cards in this column (beta)...
                     </Dropdown.Item>
                  </Dropdown.Menu>
               </Dropdown>
            </div>
         </header>
         <div className="card-list">
            <Container
               groupName="col"
               orientation="vertical"
               // Truyền ngược data từ con lên cha bằng cách gọi lại hàm onCardrop() từ cha truyền xuống con
               onDrop={(dropResult) => onCardDrop(column.id, dropResult)}
               getChildPayload={(index) => cards[index]}
               dragClass="card-ghost"
               dropClass="card-ghost-drop"
               dropPlaceholder={{
                  animationDuration: 150,
                  showOnTop: true,
                  className: "card-drop-preview",
               }}
               dropPlaceholderAnimationDuration={200}
            >
               {cards.map((card, index) => (
                  <Draggable key={index}>
                     <Card card={card} />
                  </Draggable>
               ))}
            </Container>
         </div>
         <footer>
            <div className="footer-actions">
               <i className="fa fa-plus icon" />
               Add another column
            </div>
         </footer>

         <ConfirmModal
            show={showConfirmModal}
            onAction={handleConfirmModalAction}
            title="Remove column"
            message={`Are you sure you want to remove <strong>${column.title}</strong>. <br /> All related cards will alse be removed!`}
         />
      </div>
   );
}

export default Column;
