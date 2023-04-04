import React, { useEffect, useRef, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import { Form, Button } from "react-bootstrap";
import { Container, Draggable } from "react-smooth-dnd";
import { cloneDeep } from "lodash";

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
   const cards = mapOrder(column.cards, column.cardOrder, "_id");

   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const toggleShowConfirmModal = () => setShowConfirmModal(!showConfirmModal);

   const [columnTitle, setColumnTitle] = useState("");
   const handleColumnTitleChange = (e) => setColumnTitle(e.target.value);

   const [openNewCardForm, setOpenNewCardForm] = useState(false);
   const toggleOpenNewCardForm = () => {
      setOpenNewCardForm(!openNewCardForm);
   };

   const newCardTextAreaRef = useRef(null);
   useEffect(() => {
      if (newCardTextAreaRef && newCardTextAreaRef.current) {
         newCardTextAreaRef.current.focus();
         newCardTextAreaRef.current.select();
      }
   }, [openNewCardForm]);

   const [newCardTitle, setNewCardTitle] = useState("");
   const handleNewCardTitleChange = (e) => {
      setNewCardTitle(e.target.value);
   };

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

   const handleColumnTitleBlur = () => {
      console.log(columnTitle);
      const newColumn = {
         ...column,
         title: columnTitle,
      };
      onUpdateColumn(newColumn);
   };

   /* Focus into "Add another card" input when press "Add card" */
   const addNewCard = () => {
      if (!newCardTitle) {
         newCardTextAreaRef.current.focus();
         return;
      }

      /* One way binding the data when edit */
      const newCardToAdd = {
         id: Math.random().toString(36).substring(2, 5),
         boardId: column.boardId,
         columnId: column._id,
         title: newCardTitle.trim(),
         cover: null,
      };
      let newColumn = cloneDeep(column);
      newColumn.cards.push(newCardToAdd);
      newColumn.cardOrder.push(newCardToAdd._id);
      onUpdateColumn(newColumn);
      setNewCardTitle("");
      toggleOpenNewCardForm(true);
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
                     <Dropdown.Item onClick={toggleOpenNewCardForm}>
                        Add card...
                     </Dropdown.Item>
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
               onDrop={(dropResult) => onCardDrop(column._id, dropResult)}
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

            {openNewCardForm && (
               <div className="add-new-card-area">
                  <Form.Control
                     size="large"
                     as="textarea"
                     rows="3"
                     placeholder="Enter a title for this card..."
                     className="textarea-enter-new-card"
                     ref={newCardTextAreaRef}
                     value={newCardTitle}
                     onChange={handleNewCardTitleChange}
                     onKeyDown={(event) =>
                        event.key === "Enter" && addNewCard()
                     }
                  />
               </div>
            )}
         </div>

         <footer>
            {openNewCardForm && (
               <div className="add-new-card-actions">
                  <Button variant="success" size="lg" onClick={addNewCard}>
                     Add card
                  </Button>
                  <span className="cancel-icon" onClick={toggleOpenNewCardForm}>
                     <i className="fa fa-trash icon" />
                  </span>
               </div>
            )}
            {!openNewCardForm && (
               <div className="footer-actions" onClick={toggleOpenNewCardForm}>
                  <i className="fa fa-plus icon" />
                  Add another card
               </div>
            )}
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
