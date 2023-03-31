import React, { useEffect, useRef, useState } from "react";
import { isEmpty } from "lodash";
import { Container, Draggable } from "react-smooth-dnd";
import {
   Container as BoostrapContainer,
   Row,
   Col,
   Form,
   Button,
} from "react-bootstrap";

import "./BoardContent.scss";
import Column from "components/Column/Column";
import { mapOrder } from "utilities/sorts";
import { applyDrag } from "utilities/dragDrop";
import { initialData } from "actions/initialData";

function BoardContent() {
   const [board, setBoard] = useState({});
   const [columns, setColumns] = useState([]);
   const [openNewColumnForm, setOpenNewColumnForm] = useState(false);

   const newColumnInputRef = useRef(null);

   const [newColumnTitle, setNewColumnTitle] = useState("");
   const handleNewColumnTitleChange = (e) => {
      setNewColumnTitle(e.target.value);
   };

   useEffect(() => {
      const boardFromDB = initialData.boards.find(
         (board) => board.id === "board-1"
      );

      if (boardFromDB) {
         setBoard(boardFromDB);
         setColumns(
            mapOrder(boardFromDB.columns, boardFromDB.columnOrder, "id")
         );
      }
   }, []);

   useEffect(() => {
      if (newColumnInputRef && newColumnInputRef.current) {
         newColumnInputRef.current.focus();
      }
   }, [openNewColumnForm]);

   useEffect(() => {
      if (newColumnInputRef && newColumnInputRef.current) {
         newColumnInputRef.current.focus();
         newColumnInputRef.current.select();
      }
   }, [openNewColumnForm]);

   if (isEmpty(board)) {
      return (
         <div className="not-found" style={{ color: "white" }}>
            Board not found
         </div>
      );
   }

   const onColumnDrop = (dropResult) => {
      // Clone newColumn array with new order when drag column
      let newColumns = [...columns];
      newColumns = applyDrag(newColumns, dropResult);

      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map((col) => col.id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);
   };

   // Truyền data từ Component Column (con) lên Component BoardContent (cha)
   const onCardDrop = (columnId, dropResult) => {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
         let newColumns = [...columns];
         let currentColumn = newColumns.find((col) => col.id === columnId);
         currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
         currentColumn.cardOrder = currentColumn.cards.map((card) => card.id);

         setColumns(newColumns);
      }
   };

   const toggleOpenNewColumnForm = () => {
      setOpenNewColumnForm(!openNewColumnForm);
   };

   const handleAddNewColumn = () => {
      if (!newColumnTitle) {
         newColumnInputRef.current.focus();
         return;
      }

      const newColumnToAdd = {
         id: Math.random().toString(36).substring(2, 5),
         boardId: board.id,
         title: newColumnTitle.trim(),
         cardOrder: [],
         cards: [],
      };

      let newColumns = [...columns];
      newColumns.push(newColumnToAdd);

      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map((col) => col.id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);
      setNewColumnTitle("");
      toggleOpenNewColumnForm();
   };

   const onUpdateColumn = (newColumnToUpdate) => {
      const columnIdToUpdate = newColumnToUpdate.id;

      let newColumns = [...columns];
      const columnIndexToUpdate = newColumns.findIndex(
         (item) => item.id === columnIdToUpdate
      );

      if (newColumnToUpdate._destroy) {
         /* Remove Column */
         newColumns.splice(columnIndexToUpdate, 1);
      } else {
         /* Update Column */
         newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate);
      }
      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map((col) => col.id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);
   };

   return (
      <div className="board-content">
         <Container
            orientation="horizontal"
            onDrop={onColumnDrop}
            getChildPayload={(index) => columns[index]}
            dragHandleSelector=".column-drag-handle"
            dropPlaceholder={{
               animationDuration: 150,
               showOnTop: true,
               className: "column-drop-preview",
            }}
         >
            {columns.map((column, index) => {
               return (
                  <Draggable key={index}>
                     <Column
                        column={column}
                        onCardDrop={onCardDrop}
                        onUpdateColumn={onUpdateColumn}
                     />
                  </Draggable>
               );
            })}
         </Container>

         <BoostrapContainer className="mern-app-container">
            {!openNewColumnForm && (
               <Row>
                  <Col
                     className="add-new-column"
                     onClick={toggleOpenNewColumnForm}
                  >
                     <i className="fa fa-plus icon" />
                     Add another column
                  </Col>
               </Row>
            )}

            {openNewColumnForm && (
               <Row>
                  <Col className="enter-new-column">
                     <Form.Control
                        size="large"
                        type="text"
                        placeholder="Enter column title"
                        className="input-enter-new-column"
                        ref={newColumnInputRef}
                        value={newColumnTitle}
                        onChange={handleNewColumnTitleChange}
                        onKeyDown={(event) => {
                           event.key === "Enter" && handleAddNewColumn();
                        }}
                     />
                     <Button
                        variant="success"
                        size="sm"
                        onClick={handleAddNewColumn}
                     >
                        Add column
                     </Button>
                     <span
                        className="cancel-new-column"
                        onClick={toggleOpenNewColumnForm}
                     >
                        <i className="fa fa-trash icon" />
                     </span>
                  </Col>
               </Row>
            )}
         </BoostrapContainer>
      </div>
   );
}

export default BoardContent;
