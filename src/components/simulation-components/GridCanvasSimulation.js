import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import data from '../../data.json';
import { ipcRenderer } from 'electron';

import {
  addEnemy,
  addOwnTank,
  updateTotalEnemies,
  updateTotalOwnTanks,
  updateTotalEnemyTanks,
  updateTotalEnemyAPCs,
  deleteEnemy,
  deleteOwnTank,
  addEnemyCar,
  setOnlyOneOwnTank,
  addHouse,
  addTrees,
  addShop,
  addShack,
  addSmallHouse,
  addVillageHut,
  addWareHouse,
  addWaterTankTower,
  addHospital,
  addStore,
  addJhompri,
  addRailwayStation,
  addRocks,
  deleteHouse,
  deleteTrees,
  deleteShop,
  deleteShack,
  deleteSmallHouse,
  deleteVillageHut,
  deleteWareHouse,
  deleteWaterTankTower,
  deleteHospital,
  deleteStore,
  deleteRailwayStation,
  deleteJhompri,
  deleteRocks,
  setExerciseTime,
  setTerrain,
  setStudent,
  setInstructor,
  setDifficulty,
  setWeather,
  setTemperature,
  setWindSpeed,
  setWindDirection,
  setWindGust,
} from '../../redux/DataArray';

import { removeItem } from '../../redux/CarouselSelectedItemSlice';
import gridTank from '../../TSM-img/gridTank.svg';
import gridTank2 from '../../TSM-img/gridTank2.svg';
import gridTank3 from '../../TSM-img/gridTank3.svg';
import gridTruck from '../../TSM-img/gridTruck.svg';
import gridForrest from '../../TSM-img/gridForrest.svg';
import gridAPV from '../../TSM-img/gridAPV.svg';
import startSign from '../../TSM-img/gridStopSign.svg';
import Increment from '../../TSM-img/increment.svg';
import Decrement from '../../TSM-img/decrement.svg';
import close from '../../TSM-img/close.svg';
import rocks from '../../TSM-img/rocks.png';
import jhompri from '../../TSM-img/Jhompri.png';
import house from '../../TSM-img/House.png';
import hospital from '../../TSM-img/Hospital.png';
import railwayStation from '../../TSM-img/RailwayStation.png';
import shack from '../../TSM-img/Shack.png';
import shop from '../../TSM-img/Shop.png';
import smallHouse from '../../TSM-img/SmallHouse.png';
import store from '../../TSM-img/Store.png';
import villageHut from '../../TSM-img/VillageHut.png';
import wareHouse from '../../TSM-img/WareHouse.png';
import waterTankTower from '../../TSM-img/WaterTankTower.png';
import compass from '../../TSM-img/compass.svg';

export default function GridCanvas({ stylingBox }) {
  const gridRef = useRef(null);
  const dispatch = useDispatch();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [items, setItems] = useState([]);
  const [draggingItem, setDraggingItem] = useState(null);
  const [paths, setPaths] = useState({});
  const [objectStartPoints, setObjectStartPoints] = useState([]);
  const selectedItems = useSelector((state) => state.selectedItem).items
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [latestTankId, setLatestTankId] = useState(null);
  const [tankAmmos, setTankAmmos] = useState({});
  const [direction, setDirection] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const [showInitialAmmo, setShowInitialAmmo] = useState(false);

  const initialAmmosTitleArray = data.initialAmmoTitleArray;

  const [apfsds, setApfsdsAmmo] = useState(40);
  const [he, setHeAmmo] = useState(40);
  const [heat, setHeatAmmo] = useState(40);
  const [mg762, setMg762Ammo] = useState(1000);
  const scalingFactor = 0.002;
  const handleAmmoChange = (tankId, ammoType, value) => {
    setTankAmmos((prevAmmos) => ({
      ...prevAmmos,
      [tankId]: {
        ...prevAmmos[tankId],
        [ammoType]: value,
      },
    }));
  };

  // Function to fetch data from the JSON files
  const fetchData = async () => {
    try {
      const simulationData = await ipcRenderer.invoke(
        'read-json',
        'E:/TSM-FCC-main/JSON_Files/tsm.json',
      );
      console.log(simulationData);

      // Dispatch actions to update Redux state
      dispatch(setOnlyOneOwnTank(simulationData.onlyOneOwnTank));
      // dispatch(setMapArea(simulationData.ExerciseInfo.mapName));
      dispatch(setExerciseTime(simulationData.ExerciseInfo.exerciseTime));
      dispatch(setTerrain(simulationData.ExerciseInfo.terrain));
      dispatch(setStudent(simulationData.ExerciseInfo.student));
      dispatch(setInstructor(simulationData.ExerciseInfo.instructor));
      dispatch(setDifficulty(simulationData.ExerciseInfo.difficulty));
      dispatch(setWeather(simulationData.WeatherConditions.Time));
      dispatch(setTemperature(simulationData.WeatherConditions.temperature));
      dispatch(setWindSpeed(simulationData.WeatherConditions.WindSpeed));
      dispatch(
        setWindDirection(simulationData.WeatherConditions.WindDirection),
      );
      dispatch(updateTotalEnemies(simulationData.totalEnemies));
      dispatch(updateTotalOwnTanks(simulationData.totalOwnTanks));
      dispatch(
        updateTotalEnemyTanks(simulationData.ExerciseInfo.totalEnemyTanks),
      );
      dispatch(
        updateTotalEnemyAPCs(simulationData.ExerciseInfo.totalEnemyAPCs),
      );

      // Prepare player data
      const playerData = {
        id: simulationData.Player.id,
        name: 'Player Tank',
        x: simulationData.Player.SpawnLocation.pointx,
        y: simulationData.Player.SpawnLocation.pointy,
        status: 'own-tank',
        details: simulationData.Player.Ammo,
        path: simulationData.Player.Path,
        type: 'tank',
        src: gridTank,
      };

      // Prepare enemy data
      const enemyData = Object.keys(simulationData.Enemy).flatMap((enemyName) =>
        simulationData.Enemy[enemyName].map((enemy) => ({
          id: enemy.unitId,
          name: enemyName,
          x: enemy.SpawnLocation.pointx,
          y: enemy.SpawnLocation.pointy,
          status: 'dangerous',
          details: enemy.Ammo,
          path: enemy.Path,
          type: 'tank',
          src: gridTank, // Assuming all enemies are tanks, adjust src as needed
        })),
      );

      // Prepare items data
      const prepareItemData = (itemsArray, type, src) => {
        return itemsArray.map((item) => ({
          id: item.id,
          x: item.pointx,
          y: item.pointy,
          status: 'neutral',
          details: {},
          type,
          src,
        }));
      };

      const houseData = prepareItemData(
        simulationData.Items.House,
        'house',
        house,
      );
      const treesData = prepareItemData(
        simulationData.Items.Trees,
        'trees',
        '',
      ); // Add appropriate src
      const shackData = prepareItemData(
        simulationData.Items.Shack,
        'shack',
        shack,
      );
      const hospitalData = prepareItemData(
        simulationData.Items.Hospital,
        'hospital',
        hospital,
      );
      const jhompriData = prepareItemData(
        simulationData.Items.Jhompri,
        'jhompri',
        jhompri,
      );
      const rocksData = prepareItemData(
        simulationData.Items.Rocks,
        'rocks',
        rocks,
      );

      // Combine all items
      const allItems = [
        playerData,
        ...enemyData,
        ...houseData,
        ...treesData,
        ...shackData,
        ...hospitalData,
        ...jhompriData,
        ...rocksData,
      ];
      console.log(allItems);
      setItems(allItems);

      // Extract paths for all units and set in paths state
      const pathsData = {};
      pathsData[playerData.id] = simulationData.Player.Path.map((point) => ({
        x: point.pointx * scalingFactor,
        y: point.pointy * scalingFactor,
      }));

      Object.keys(simulationData.Enemy).forEach((enemyName) => {
        simulationData.Enemy[enemyName].forEach((enemy) => {
          pathsData[enemy.unitId] = enemy.Path.map((point) => ({
            x: point.pointx * scalingFactor,
            y: point.pointy * scalingFactor,
          }));
        });
      });

      console.log(pathsData);

      setPaths(pathsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);
  const handleDirectionChange = (tankId, newDirection) => {
    setDirection((prevDirections) => {
      return { ...prevDirections, [tankId]: newDirection };
    });
  };

  const handleInputChange = (index, newValue) => {
    newValue = Number(newValue);

    if (newValue < 0) return;

    switch (index) {
      case 1:
        setApfsdsAmmo(newValue);
        handleAmmoChange(selectedObjectId, 'apfsds', newValue);
        break;
      case 2:
        setHeAmmo(newValue);
        handleAmmoChange(selectedObjectId, 'he', newValue);
        break;
      case 3:
        setHeatAmmo(newValue);
        handleAmmoChange(selectedObjectId, 'heat', newValue);
        break;
      case 4:
        setMg762Ammo(newValue);
        handleAmmoChange(selectedObjectId, 'mg762', newValue);
        break;
      default:
        break;
    }
  };

  const handleIncrement = (inputNumber) => {
    if (inputNumber === 1) {
      const newValue = apfsds + 1;
      setApfsdsAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'apfsds', newValue);
    } else if (inputNumber === 2) {
      const newValue = he + 1;
      setHeAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'he', newValue);
    } else if (inputNumber === 3) {
      const newValue = heat + 1;
      setHeatAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'heat', newValue);
    } else if (inputNumber === 4) {
      const newValue = mg762 + 50;
      setMg762Ammo(newValue);
      handleAmmoChange(selectedObjectId, 'mg762', newValue);
    }
  };

  const handleDecrement = (inputNumber) => {
    if (inputNumber === 1 && apfsds > 0) {
      const newValue = apfsds - 1;
      setApfsdsAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'apfsds', newValue);
    } else if (inputNumber === 2 && he > 0) {
      const newValue = he - 1;
      setHeAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'he', newValue);
    } else if (inputNumber === 3 && heat > 0) {
      const newValue = heat - 1;
      setHeatAmmo(newValue);
      handleAmmoChange(selectedObjectId, 'heat', newValue);
    } else if (inputNumber === 4 && mg762 >= 50) {
      const newValue = mg762 - 50;
      setMg762Ammo(newValue);
      handleAmmoChange(selectedObjectId, 'mg762', newValue);
    }
  };

  const inputArray = ['INITIAL QTY. :', apfsds, he, heat, mg762];

  const createGridPattern = () => {
    const gridSize = 100;
    return `repeating-linear-gradient(
              to right,
              lightgrey,
              lightgrey 1.5px,
              transparent 1.5px,
              transparent ${gridSize}px
            ),
            repeating-linear-gradient(
              to bottom,
              lightgrey,
              lightgrey 1.5px,
              transparent 1.5px,
              transparent ${gridSize}px
            )`;
  };

  const getGridWidth = () => {
    return gridRef?.current?.clientWidth;
  };

  const getGridHeight = () => {
    return gridRef?.current?.clientHeight;
  };

  const getGridLeftBoundary = () => {
    return 0;
  };

  const getGridRightBoundary = () => {
    return (getGridWidth() / zoom) * 1.02;
  };

  const getGridTopBoundary = () => {
    return 0;
  };

  const getGridBottomBoundary = () => {
    return (getGridHeight() / zoom) * 1.1;
  };

  const updatePath = (itemId, newX, newY) => {
    const threshold = 30;

    setPaths((prevPaths) => {
      const currentPath = prevPaths[itemId] || [];
      const lastPoint = currentPath[currentPath.length - 1];

      if (
        !lastPoint ||
        Math.hypot(lastPoint.x - newX, lastPoint.y - newY) >= threshold
      ) {
        const newPath = [...currentPath, { x: newX, y: newY }];
        return { ...prevPaths, [itemId]: newPath };
      }

      return prevPaths;
    });
  };

  const enforceGridBoundaries = (newX, newY, itemWidth, itemHeight) => {
    const rightBoundary = getGridRightBoundary() - itemWidth;
    const bottomBoundary = getGridBottomBoundary() - itemHeight;

    const boundedX = Math.max(
      getGridLeftBoundary(),
      Math.min(newX, rightBoundary),
    );
    const boundedY = Math.max(
      getGridTopBoundary(),
      Math.min(newY, bottomBoundary),
    );

    return { x: boundedX, y: boundedY };
  };

  const normalizePathX = (x) => {
    const gridWidth = getGridWidth();
    const centerX = gridWidth / 2;
    const scaleX = 40000 / gridWidth;

    const normalizedX = (x - centerX) * scaleX;

    return normalizedX;
  };

  const normalizePathY = (y) => {
    const gridHeight = getGridHeight();
    const centerY = gridHeight / 2;
    const scaleY = 40000 / gridHeight;

    // Flipping the Y axis if needed
    const normalizedY = (y - centerY) * scaleY * -1;

    return normalizedY;
  };

  const getMousePosition = (e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    setMousePosition({ x, y });
  };

  // useEffect(() => {
  //   if (selectedItems.length > items.length) {
  //     let addedTank = false;

  //     const newItems = selectedItems
  //       .slice(items.length)
  //       .map((selectedItem, index) => {
  //         if (selectedItem.type === 'tank' || selectedItem.type === 'myTank') {
  //           addedTank = true;
  //         }
  //         return {
  //           id: selectedItem.id || Date.now() + index,
  //           name: selectedItem.name,
  //           x: Math.random() * (getGridWidth() - 50),
  //           y: Math.random() * (getGridHeight() - 50),
  //           status: selectedItem.status,
  //           details: selectedItem.details,
  //           type: selectedItem.type,
  //           src:
  //             selectedItem.type === 'tank'
  //               ? gridTank2
  //               : selectedItem.type === 'car'
  //               ? gridAPV
  //               : selectedItem.type === 'jhompri'
  //               ? jhompri
  //               : selectedItem.type === 'forrest'
  //               ? gridForrest
  //               : selectedItem.type === 'myTank'
  //               ? gridTank3
  //               : selectedItem.type === 'house'
  //               ? house
  //               : selectedItem.type === 'hospital'
  //               ? hospital
  //               : selectedItem.type === 'railwayStation'
  //               ? railwayStation
  //               : selectedItem.type === 'shack'
  //               ? shack
  //               : selectedItem.type === 'shop'
  //               ? shop
  //               : selectedItem.type === 'smallHouse'
  //               ? smallHouse
  //               : selectedItem.type === 'store'
  //               ? store
  //               : selectedItem.type === 'villageHut'
  //               ? villageHut
  //               : selectedItem.type === 'wareHouse'
  //               ? wareHouse
  //               : selectedItem.type === 'waterTankTower'
  //               ? waterTankTower
  //               : selectedItem.type === 'rocks'
  //               ? rocks
  //               : waterTankTower,
  //         };
  //       });

  //     if (newItems.length > 0) {
  //       setItems((prevItems) => [...prevItems, ...newItems]);
  //     }
  //     if (addedTank) {
  //       setManuallyClosed(false);
  //     }
  //     console.log('object', objectStartPoints);
  //   }
  // }, [selectedItems]);

  const drawPath = (path) => {
    if (!path || path.length < 2) return '';
    console.log(path);
    let d = `M ${path[0].pointx * scalingFactor} ${
      path[0].pointy * scalingFactor
    } `;
    for (let i = 1; i < path.length; i++) {
      d += `L ${path[i].pointx * scalingFactor} ${
        path[i].pointy * scalingFactor
      } `;
    }
    console.log(d);
    return d;
  };

  const hasObjects = items.length > 0;

  const totalEnemies = items.filter(
    (item) => item.status === 'dangerous',
  ).length;
  const enemyTanks = items.filter(
    (item) => item.status === 'dangerous' && item.type === 'tank',
  ).length;
  const enemyAPCs = items.filter(
    (item) => item.status === 'dangerous' && item.type === 'car',
  ).length;

  const closeInitialAmmo = () => {
    setShowInitialAmmo(false);
    setManuallyClosed(true);
    setApfsdsAmmo(40);
    setHeAmmo(40);
    setHeatAmmo(40);
    setMg762Ammo(1000);
  };

  useEffect(() => {
    const latestItem = selectedItems[selectedItems.length - 1];
    if (
      (latestItem && latestItem.type === 'tank') ||
      (latestItem && latestItem.type === 'myTank')
    ) {
      setLatestTankId(latestItem.id);
    }
  }, [selectedItems]);

  useEffect(() => {
    const hasTanks = items.some(
      (item) => item.type === 'tank' || item.type === 'myTank',
    );
    setShowInitialAmmo(hasTanks && !manuallyClosed);
  }, [items, manuallyClosed]);

  console.log(items);

  return (
    <div>
      <div
        className="grid_canvas_main_container"
        style={{
          width:
            stylingBox === 1 && hasObjects
              ? '100%%'
              : stylingBox === 1 && !hasObjects
              ? '100%'
              : '100%',
          borderRadius: stylingBox === 1 ? '5px' : '0px',
          position: stylingBox === 2 ? 'absolute' : 'relative',
        }}
      >
        <TransformWrapper>
          <TransformComponent>
            <svg
              className="path-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {items.map((object) => {
                if (object.path) {
                  const pathColor =
                    object && object.status === 'own-tank'
                      ? 'blue'
                      : object && object.status === 'dangerous'
                      ? 'red'
                      : '';

                  return (
                    <path
                      key={object.id}
                      d={drawPath(object.path)}
                      stroke={pathColor}
                      fill="none"
                      strokeWidth={4}
                    />
                  );
                }
              })}
            </svg>
            <div
              ref={gridRef}
              className="grid_canvas"
              onMouseMove={getMousePosition}
              style={{
                background: createGridPattern(),
                // backgroundImage: "(url(`../../assets/DesertMap.png`)",
                backgroundRepeat: 'no-repeat',
                zIndex: '-1',
                backgroundSize: `${1200 * zoom}px ${1200 * zoom}px`,
                height: '1000px',
                width: '1200px',
                border: '1px solid rgba(255, 255, 255, 0.578)',
                position: 'relative',
                cursor: 'grab',
              }}
            >
              <div className="item_position">
                <div className="item_position_clip_path_1"></div>
                <div className="item_position_clip_path_2"></div>
                <div>X : {normalizePathX(mousePosition.x).toFixed(0)}</div>
                <div>Y : {normalizePathY(mousePosition.y).toFixed(0)}</div>
                <div style={{ width: '160px' }}>1 BLOCK : 800M</div>
              </div>

              <div
                className="compass_img_main_container"
                style={{
                  opacity: stylingBox === 1 && hasObjects ? '1' : '0',
                  transition: 'opacity 0.9s ease-in-out',
                }}
              >
                <div className="compass_img_content">
                  <div
                    className="compass_direction west"
                    onClick={() =>
                      handleDirectionChange(selectedObjectId, 'West')
                    }
                  >
                    W
                  </div>
                  <div
                    className="compass_direction north"
                    onClick={() =>
                      handleDirectionChange(selectedObjectId, 'North')
                    }
                  >
                    N
                  </div>
                  <div
                    className="compass_direction south"
                    onClick={() =>
                      handleDirectionChange(selectedObjectId, 'South')
                    }
                  >
                    S
                  </div>
                  <div
                    className="compass_direction east"
                    onClick={() =>
                      handleDirectionChange(selectedObjectId, 'East')
                    }
                  >
                    E
                  </div>
                  <img
                    src={compass}
                    alt="compass"
                    style={{
                      rotate:
                        direction[selectedObjectId] === 'North'
                          ? '0deg'
                          : direction[selectedObjectId] === 'South'
                          ? '180deg'
                          : direction[selectedObjectId] === 'East'
                          ? '90deg'
                          : '-90deg',
                      transition: 'all 0.3s ease',
                    }}
                  />
                </div>
              </div>

              {items.map((item) => (
                <React.Fragment key={item.id}>
                  <div
                    className="Testing-grid"
                    // onMouseDown={(e) => handleItemMouseDown(item.id, e)}
                    style={{
                      left: (item.x * scalingFactor + pan.x) * zoom,
                      top: (item.y * scalingFactor + pan.y) * zoom,
                      transform: `translate(-50%, -50%) scale(${zoom})`,
                      backgroundImage: `url(${item.src})`,
                      position: 'absolute',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      rotate:
                        item.status !== 'not-dangerous' &&
                        (direction[item.id] === 'North'
                          ? '90deg'
                          : direction[item.id] === 'South'
                          ? '-90deg'
                          : direction[item.id] === 'East'
                          ? '180deg'
                          : ''),
                      transition: 'rotate 0.3s ease',
                    }}
                  />
                  {objectStartPoints.find((point) => point.id === item.id) && (
                    <div
                      style={{
                        left:
                          (objectStartPoints.find(
                            (point) => point.id === item.id,
                          ).startPoint.x +
                            pan.x) *
                          zoom,
                        top:
                          (objectStartPoints.find(
                            (point) => point.id === item.id,
                          ).startPoint.y +
                            pan.y) *
                          zoom,
                        transform: `translate(-50%, -50%) scale(${zoom})`,
                        backgroundImage: `url(${
                          item.status === 'not-dangerous' ? 'none' : startSign
                        })`,
                        position: 'absolute',
                        width: '20px',
                        height: '20px',
                        backgroundSize: 'cover',
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
      {stylingBox === 1 && (
        <div
          className="initial_ammo_grid_canvas"
          style={{
            height: showInitialAmmo ? '0px' : '0px',
            opacity: showInitialAmmo ? 1 : 0,
            display: showInitialAmmo ? 'block' : 'none',
            transition: 'all 0.3s ease-in-out',
          }}
        >
          <div className="initial_ammo_main_class">
            <div className="initial_ammo_main_container">
              <div className="initial_ammo_heading">INITIAL AMMO</div>
              <div className="initial_ammo_main_content_container">
                <div
                  className="initial_ammo_close_button"
                  onClick={closeInitialAmmo}
                >
                  <img src={close} alt="close" />
                </div>

                <div className="initial_ammo_title">
                  {initialAmmosTitleArray.map((value, index) => {
                    return (
                      <div
                        key={index}
                        style={{ fontWeight: index === 0 ? 700 : 600 }}
                      >
                        {value}
                      </div>
                    );
                  })}
                </div>
                <div className="initial_ammo_values">
                  {inputArray.map((value, index) =>
                    index === 0 ? (
                      <div
                        key={index}
                        className="initial_ammo_value_first_heading"
                      >
                        {value}
                      </div>
                    ) : (
                      <div
                        key={index}
                        className="initial_ammo_decrement_increment"
                      >
                        <div className="initia_ammo_increment_decrement_content">
                          <input
                            type="number"
                            value={value}
                            onChange={(e) =>
                              handleInputChange(index, e.target.value)
                            }
                          />
                          <div className="buttons_increment_decrement">
                            <button onClick={() => handleIncrement(index)}>
                              <img alt="decrement" src={Decrement} />
                            </button>
                            <button onClick={() => handleDecrement(index)}>
                              <img alt="increment" src={Increment} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className="grid_canvas_object_details"
        style={{
          display: stylingBox === 2 ? 'none' : '',
          width: hasObjects ? '100%' : '0px',
          opacity: hasObjects ? 1 : 0,
        }}
      >
        {totalEnemies > 0 && (
          <div className="grid_canvas_object_details_stats">
            <h3>Total Enemies: {totalEnemies}</h3>
            <p>Enemy Tanks: {enemyTanks}</p>
            <p>Enemy APCs: {enemyAPCs}</p>
          </div>
        )}
      </div>
    </div>
  );
}
