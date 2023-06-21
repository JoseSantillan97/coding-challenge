import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";
import './styles.css'

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState(null)

  // Create the boundaries
  const checkBounds = (id, newComponent) => {
    const { top, left, width, height } = newComponent;

    const parent = document.getElementById("parent");
    const parentBounds = parent.getBoundingClientRect();

    let updatedTop = top;
    let updatedLeft = left;

    if (top < 0) {
      updatedTop = 0;
    } else if (top + height > parentBounds.height) {
      updatedTop = parentBounds.height - height;
    }

    if (left < 0) {
      updatedLeft = 0;
    } else if (left + width > parentBounds.width) {
      updatedLeft = parentBounds.width - width;
    }

    if (updatedTop !== top || updatedLeft !== left) {
      updateMoveable(id, {
        ...newComponent,
        top: updatedTop,
        left: updatedLeft,
      });
    }
  };

  // Remove component selected
  const removeMoveable = () => {
    const updatedMoveables = moveableComponents.filter(moveable => moveable.id !== selected);
    setMoveableComponents(updatedMoveables);
    setSelected(null);
  };

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];
    const OBJECTFIT = ['fill', 'contain', 'cover', 'none', 'scale-down']

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        addedImage: images[Math.floor(Math.random() * images.length)].url,
        getObjectFit: OBJECTFIT[Math.floor(Math.random() * OBJECTFIT.length)],
        updateEnd: true
      },
    ]);
  };

  // Get images and store in a state
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/photos')
      .then(res => res.json())
      .then(response => { setImages(response) })
  }, [])

  // updated each time the selected component is moved and resized
  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
    checkBounds(id, newComponent);
  };


  const handleResizeStart = (index, e) => {
    console.log("handleResizeStart", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  // Returns the buttons, the parent component and the child components
  return (
    <main style={{ height: "100vh", width: "100vw" }}>
      <button className="btn addBtn" onClick={addMoveable}>Add 1 Moveable</button>
      <button className="btn deleteBtn" onClick={removeMoveable}>Delete selected moveable</button>
      <div
        id="parent"
        style={{
          position: "relative",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
            addedImage={item.addedImage}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  addedImage,
  getObjectFit,
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  // Update node measures and content
  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width;
    let newHeight = e.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      addedImage,
      getObjectFit
    });

    // ACTUALIZAR NODO REFERENCIA
    // En esta parte debo actualizar los nodos de referencia junto con las medidas del componente
    // pero no me alcanzó el tiempo
    const beforeTranslate = e.drag.beforeTranslate;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;

    const positionMaxTop = top + newHeight;
    const positionMaxLeft = left + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - top;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - left;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = top + beforeTranslate[1];
    const absoluteLeft = left + beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        addedImage,
        getObjectFit,
      },
      true
    );
  };

  return (
    <>
      <div
        ref={ref}
        // className={`draggable ${isSelected ? "selected" : ""}`}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
          backgroundImage: addedImage
        }}
        onClick={() => setSelected(id)}
      >
        {console.log('FIT', getObjectFit)}
        <img
          src={addedImage}
          alt={addedImage?.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: getObjectFit
          }}
        />
      </div>

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            addedImage,
            getObjectFit
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={.7}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
