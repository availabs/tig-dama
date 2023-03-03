import React from "react"

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"

import { useTheme } from "../../wrappers/with-theme"

let id = -1;
const makeId = () => `list-${ ++id }`;

const DraggableItem = ({ id, index, children }) =>
  <Draggable draggableId={ `draggable-${ id }` } index={ index }>
    { provided => (
        <div ref={ provided.innerRef }
          { ...provided.draggableProps }
          { ...provided.dragHandleProps }>
        { children }
        </div>
      )
    }
  </Draggable>

export const useDndList = (items, setItems) => {
  const onDrop = React.useCallback((start, end) => {
    const [item] = items.splice(start, 1);
    items.splice(end, 0, item);
    setItems([...items]);
  }, [items, setItems]);
  return onDrop;
}

export const DndList = ({ onDrop, children, className = "" }) => {
  const onDragEnd = React.useCallback(result => {
    if (!result.destination) return;

    const start = result.source.index,
      end = result.destination.index;

    if (start === end) return;

    onDrop(start, end);
  }, [onDrop]);
  const theme = useTheme();

  return !React.Children.toArray(children).length ? null : (
    <DragDropContext onDragEnd={ onDragEnd }>
      <Droppable droppableId={ makeId() } className="box-content">
        { (provided, snapshot) => (
            <div ref={ provided.innerRef }
              { ...provided.droppableProps }
              className={ `flex flex-col
                ${ snapshot.isDraggingOver ? theme.listDragging : theme.list }
                ${ className }
              ` }>
              { React.Children.toArray(children).map((child, i) =>
                  <DraggableItem key={ child.key } id={ child.key } index={ i }>
                    { child }
                  </DraggableItem>
                )
              }
              { provided.placeholder }
            </div>
          )
        }
      </Droppable>
    </DragDropContext>
  )
}
DndList.defaultProps = {
  items: [],
  idAccessor: d => d.id,
  indexAccessor: d => d.index,
  onDrop: (start, end) => {}
}
