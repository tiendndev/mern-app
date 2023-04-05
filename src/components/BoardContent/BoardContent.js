import React, { useEffect, useRef, useState } from "react";
import { isEmpty, cloneDeep } from "lodash";
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
import {
   fetchBoardDetails,
   createNewColumn,
   updateBoard,
   updateColumn,
   updateCard,
} from "actions/ApiCall";

function BoardContent() {
   const [board, setBoard] = useState({});
   const [columns, setColumns] = useState([]);
   const newColumnInputRef = useRef(null);

   const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
   const toggleOpenNewColumnForm = () => {
      setOpenNewColumnForm(!openNewColumnForm);
   };

   const [newColumnTitle, setNewColumnTitle] = useState("");
   const handleNewColumnTitleChange = (e) => {
      setNewColumnTitle(e.target.value);
   };

   useEffect(() => {
      const boardId = "642be1fd123f85b5487ae3ee";
      fetchBoardDetails(boardId).then((board) => {
         setBoard(board);
         setColumns(mapOrder(board.columns, board.columnOrder, "_id"));
      });
   }, []);

   /* Focus into content and select all content
      when press Add another column */
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
      /* Clone newColumn array with "new order" when drag column */
      let newColumns = [...columns];
      newColumns = applyDrag(newColumns, dropResult);

      let newBoard = cloneDeep(board);
      newBoard.columnOrder = newColumns.map((col) => col._id);
      newBoard.columns = newColumns;

      setColumns(newColumns);
      setBoard(newBoard);

      /* Call API update columnOrder in board details */
      updateBoard(newBoard._id, newBoard).catch(() => {
         setColumns(columns);
         setBoard(board);
      });
   };

   // Transmit data from "Column" (child) into "BoardContent" (parent)
   const onCardDrop = (columnId, dropResult) => {
      if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
         let newColumns = [...columns];

         let currentColumn = newColumns.find((col) => col._id === columnId);
         currentColumn.cards = applyDrag(currentColumn.cards, dropResult);
         currentColumn.cardOrder = currentColumn.cards.map((i) => i._id);

         setColumns(newColumns);
         if (
            dropResult.removedIndex !== null &&
            dropResult.addedIndex !== null
         ) {
            /**
             * Action: move card inside its column
             * 1 - Call API update cardOrder in current column
             */
            updateColumn(currentColumn._id, currentColumn).catch(() =>
               setColumns(columns)
            );
         } else {
            /* Action: move card betweeen two column */
            /* 1 - Call API update cardOrder in current column */
            updateColumn(currentColumn._id, currentColumn).catch(() =>
               setColumns(columns)
            );

            if (dropResult.addedIndex !== null) {
               let currentCard = cloneDeep(dropResult.payload);
               currentCard.columnId = currentColumn._id;
               /* 2 - Call API update columnId in current card */
               updateCard(currentCard._id, currentCard);
            }
         }
      }
   };

   const handleAddNewColumn = () => {
      if (!newColumnTitle) {
         newColumnInputRef.current.focus();
         return;
      }

      const newColumnToAdd = {
         boardId: board._id,
         title: newColumnTitle.trim(),
      };

      createNewColumn(newColumnToAdd).then((column) => {
         let newColumns = [...columns];
         newColumns.push(column);

         let newBoard = { ...board };
         newBoard.columnOrder = newColumns.map((col) => col._id);
         newBoard.columns = newColumns;

         setColumns(newColumns);
         setBoard(newBoard);
         setNewColumnTitle("");
         toggleOpenNewColumnForm();
      });
   };

   const onUpdateColumnState = (newColumnToUpdate) => {
      const columnIdToUpdate = newColumnToUpdate._id;

      let newColumns = [...columns];
      const columnIndexToUpdate = newColumns.findIndex(
         (item) => item._id === columnIdToUpdate
      );

      if (newColumnToUpdate._destroy) {
         /* Remove Column */
         newColumns.splice(columnIndexToUpdate, 1);
      } else {
         /* Update Column */
         newColumns.splice(columnIndexToUpdate, 1, newColumnToUpdate);
      }
      let newBoard = { ...board };
      newBoard.columnOrder = newColumns.map((col) => col._id);
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
                        onUpdateColumnState={onUpdateColumnState}
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
                        size="lg"
                        onClick={handleAddNewColumn}
                     >
                        Add column
                     </Button>
                     <span
                        className="cancel-icon"
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
