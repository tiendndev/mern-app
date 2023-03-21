import React, { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { Container, Draggable } from "react-smooth-dnd";
import "./BoardContent.scss";
import Column from "components/Column/Column";
import { mapOrder } from "utilities/sorts";
import { applyDrag } from "utilities/dragDrop";
import { initialData } from "actions/initialData";

function BoardContent() {
  const [board, setBoard] = useState({});
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    const boardFromDB = initialData.boards.find(
      (board) => board.id === "board-1"
    );

    if (boardFromDB) {
      setBoard(boardFromDB);
      setColumns(mapOrder(boardFromDB.columns, boardFromDB.columnOrder, "id"));
    }
  }, []);

  if (isEmpty(board)) {
    return (
      <div className="not-found" style={{ color: "white" }}>
        Board not found
      </div>
    );
  }

  const onColumnDrop = (dropResult) => {
    // Clone newColumn array with new order when drag column
    let newColums = [...columns];
    newColums = applyDrag(newColums, dropResult);

    let newBoard = { ...board };
    newBoard.columnOrder = newColums.map((col) => col.id);
    newBoard.columns = newColums;

    setColumns(newColums);
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
        }}>
        {columns.map((column, index) => {
          return (
            <Draggable key={index}>
              <Column column={column} onCardDrop={onCardDrop} />
            </Draggable>
          );
        })}
      </Container>

      <div className="add-new-column">
        <i className="fa fa-plus icon" />
        Add another column
      </div>
    </div>
  );
}

export default BoardContent;
