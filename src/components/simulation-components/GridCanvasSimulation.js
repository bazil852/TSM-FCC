import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import data from '../../data.json';
import { ipcRenderer } from 'electron';
import dessertTerainSvg from '../../../assets/terrain.svg';
import semiDessetTerainSvg from '../../../assets/images.jpeg';
import denseTerainSvg from '../../../assets/terrain.svg';
import {
  updateTotalEnemies,
  updateTotalOwnTanks,
  updateTotalEnemyTanks,
  updateTotalEnemyAPCs,
  setOnlyOneOwnTank,
  setExerciseTime,
  setTerrain,
  setStudent,
  setInstructor,
  setDifficulty,
  setWeather,
  setTemperature,
  setWindSpeed,
  setWindDirection,
} from '../../redux/DataArray';

import gridTank from '../../TSM-img/gridTank.svg';
import Increment from '../../TSM-img/increment.svg';
import Decrement from '../../TSM-img/decrement.svg';
import close from '../../TSM-img/close.svg';
import rocks from '../../TSM-img/rocks.png';
import jhompri from '../../TSM-img/Jhompri.png';
import house from '../../TSM-img/House.png';
import hospital from '../../TSM-img/Hospital.png';
import shack from '../../TSM-img/Shack.png';
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
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [latestTankId, setLatestTankId] = useState(null);
  const [tankAmmos, setTankAmmos] = useState({});
  const [direction, setDirection] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [manuallyClosed, setManuallyClosed] = useState(false);
  const [showInitialAmmo, setShowInitialAmmo] = useState(false);
  const [simulationData, setSimulationData] = useState();
  // const simulationData = useSelector((state) => state.dataArray);
  // const [tsmData, setTsmData] = useState(null);
  const initialAmmosTitleArray = data.initialAmmoTitleArray;
  const [updatedItems,setUpdatedItems] = useState(null)
  const [apfsds, setApfsdsAmmo] = useState(40);
  const [he, setHeAmmo] = useState(40);
  const [heat, setHeatAmmo] = useState(40);
  const [mg762, setMg762Ammo] = useState(1000);

  const handleAmmoChange = (tankId, ammoType, value) => {
    setTankAmmos((prevAmmos) => ({
      ...prevAmmos,
      [tankId]: {
        ...prevAmmos[tankId],
        [ammoType]: value,
      },
    }));
  };

  //Fetching Players Data

  const fetchPaths = async () => {
    try {
      // Fetch player and enemy data using ipcRenderer
      const playerData = await ipcRenderer.invoke(
        'read-json',
        process.env.PLAYER_DATA_PATH,
      );
      const enemyData = await ipcRenderer.invoke(
        'read-json',
        process.env.ENEMY_DATA_PATH,
      );

      console.log(enemyData)

      // Create a copy of simulationData to avoid mutating state directly
      let updatedSimulation = { ...simulationData };

     console.log(updatedSimulation)
      // Update player location
      if (
        playerData &&
        playerData.Player &&
        playerData.Player.currentLocation
      ) {
        const { x, y } = playerData.Player.currentLocation;
        updatedSimulation.Player.SpawnLocation = {
          pointx: x,
          pointy: y,
        };

      }




      // Iterate over all enemy attributes in simulation data
      Object.keys(updatedSimulation.Enemy).forEach((enemyAttr) => {
        
        // Update each enemy's spawn location if matching data found in enemyData
        updatedSimulation.Enemy[enemyAttr].map((enemy) => {
          
          let data = enemyData.Enemy.find(
            (u) => String(u.enemyId) == String(enemy.unitId),
          );
          console.log(data)
          
          if (data) {
            enemy.SpawnLocation.pointx = data.location.x;
            enemy.SpawnLocation.pointy = data.location.y;
          }
        });
      });
      
      console.log(updatedSimulation)




      // Prepare updated enemy data for items state
      const updatedEnemyData = Object.keys(updatedSimulation.Enemy).flatMap(
        (enemyName) =>
          updatedSimulation.Enemy[enemyName].map((enemy) => {
            const enemyPath = enemy.Path.map((point) => ({
              x: normalizetoSmall(point.pointx),
              y: normalizetoSmall(point.pointy),
            }));
            const enemyLastPoint = enemyPath[enemyPath.length - 1];

            return {
              id: enemy.unitId,
              name: enemyName,
              x:normalizetoSmall(enemy.SpawnLocation.pointx),
              y:normalizetoSmall(enemy.SpawnLocation.pointy),
              status: 'dangerous',
              details: enemy.Ammo,
              path: enemyPath,
              type: 'tank',
              src: gridTank,
            };
          }),
      );

      // Prepare player data for items state
      const playerPath = updatedSimulation.Player.Path.map((point) => ({
        x: normalizetoSmall(point.pointx),
        y: normalizetoSmall(point.pointy),
      }));
      const playerLastPoint = playerPath[playerPath.length - 1];


      const playerItemData = {
        id: 'PlayerTank', // Use a unique identifier for the player tank
        name: 'Player Tank',
        x: normalizetoSmall(updatedSimulation.Player.SpawnLocation.pointx),
        y: normalizetoSmall(updatedSimulation.Player.SpawnLocation.pointy),
        status: 'own-tank',
        details: playerData.Player.ammo, // Use player's ammo data
        path: playerPath,
        type: 'tank',
        src: gridTank,
      };

      console.log(items);
      


      console.log(playerItemData)
      console.log(updatedEnemyData);
      // Update the items state with the new enemy and player data
      console.log([...updatedEnemyData,playerItemData]);
      setUpdatedItems([...updatedEnemyData, playerItemData]);
      // setItems([...updatedEnemyData, playerItemData]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  


  useEffect(() => {
    const intervalId = setInterval(fetchPaths, 3000);

    return () => clearInterval(intervalId);
  }, [simulationData]);

  // Function to fetch data from the JSON files
  const fetchData = async () => {
    try {
      const simulationData = await ipcRenderer.invoke(
        'read-json',
        process.env.SIMULATION_DATA_PATH,
      );

      setSimulationData(simulationData);

      // Dispatch actions to update Redux state
      dispatch(setOnlyOneOwnTank(simulationData.onlyOneOwnTank));
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
      const playerPath = simulationData.Player.Path.map((point) => ({
        x: normalizetoSmall(point.pointx),
        y: normalizetoSmall(point.pointy),
      }));
      const playerLastPoint = playerPath[playerPath.length - 1];

      const playerData = {
        id: simulationData.Player.id,
        name: 'Player Tank',
        x: playerLastPoint.x,
        y: playerLastPoint.y,
        status: 'own-tank',
        details: simulationData.Player.Ammo,
        path: playerPath,
        type: 'tank',
        src: gridTank,
      };

      // Prepare enemy data
      const enemyData = Object.keys(simulationData.Enemy).flatMap((enemyName) =>
        simulationData.Enemy[enemyName].map((enemy) => {
          const enemyPath = enemy.Path.map((point) => ({
            x: normalizetoSmall(point.pointx),
            y: normalizetoSmall(point.pointy),
          }));
          const enemyLastPoint = enemyPath[enemyPath.length - 1];

          return {
            id: enemy.unitId,
            name: enemyName,
            x: enemyLastPoint.x,
            y: enemyLastPoint.y,
            status: 'dangerous',
            details: enemy.Ammo,
            path: enemyPath,
            type: 'tank',
            src: gridTank,
          };
        }),
      );

      // Prepare items data
      const prepareItemData = (itemsArray, type, src) => {
        return itemsArray.map((item) => ({
          id: item.id,
          x: normalizetoSmall(item.pointx),
          y: normalizetoSmall(item.pointy),
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
      );
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

      // console.log(allItems);
      setItems(allItems);

      // Set object start points with last point as startPoint
      setObjectStartPoints(
        allItems.map((item) => {
          if (item.path) {
            return {
              id: item.id,
              item,
              startPoint: {
                x: item.path[item.path.length - 1].x,
                y: item.path[item.path.length - 1].y,
              },
              path: item?.path?.map((u) => ({ x: u.x, y: u.y })),
            };
          } else {
            return {
              id: item.id,
              item,
              startPoint: {
                x: item.x,
                y: item.y,
              },
            };
          }
        }),
      );

      // Extract paths for all units and set in paths state
      const pathsData = {};
      pathsData[playerData.id] = playerPath;

      Object.keys(simulationData.Enemy).forEach((enemyName) => {
        simulationData.Enemy[enemyName].forEach((enemy) => {
          pathsData[enemy.unitId] = enemy.Path.map((point) => ({
            x: normalizetoSmall(point.pointx),
            y: normalizetoSmall(point.pointy),
          }));
        });
      });

      // console.log(pathsData);
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
    const gridSize = 40;
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
    const scaleFactorToLargeSpace = 500000 / 1000;
    const normalizedX = x * scaleFactorToLargeSpace;
    return normalizedX;
  };

  const normalizePathY = (y) => {
    const scaleFactorToLargeSpace = 500000 / 1000;
    const normalizedY = y * scaleFactorToLargeSpace;
    return normalizedY;
  };

  const normalizetoSmall = (value) => {
    const scaleFactorToGridSpace = 1000 / 500000;
    return value * scaleFactorToGridSpace;
  };

  const getMousePosition = (e) => {
    const rect = gridRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom - pan.x;
    const y = (e.clientY - rect.top) / zoom - pan.y;

    setMousePosition({ x, y });
  };

  const drawPath = (path) => {
    if (!path || path.length < 2) return '';
    let d = `M ${path[0].x} ${path[0].y} `;
    for (let i = 1; i < path.length; i++) {
      d += `L ${path[i].x} ${path[i].y} `;
    }
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
    const hasTanks = items.some(
      (item) => item.type === 'tank' || item.type === 'myTank',
    );
    setShowInitialAmmo(hasTanks && !manuallyClosed);
  }, [items, manuallyClosed]);

  // console.log(items);

  return (
    <div>
      <div
        className="grid_canvas_main_container"
        style={{
          height: '1030px',
          width:
            stylingBox === 1 && hasObjects
              ? '1030px'
              : stylingBox === 1 && !hasObjects
              ? '1030px'
              : '1030px',
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
              {items.map((object , index) => {
                if (object.path) {
                  const pathColor =
                    object && object.status === 'own-tank'
                      ? 'blue'
                      : object && object.status === 'dangerous'
                      ? 'red'
                      : '';

                  return (
                    <path
                      key={index}
                      d={drawPath(object.path)}
                      stroke={pathColor}
                      fill="none"
                      strokeWidth={4}
                    />
                  );
                }
              })}
            </svg>
            {simulationData && (
              <div
                ref={gridRef}
                className="grid_canvas"
                onMouseMove={getMousePosition}
                style={{
                  background: `${createGridPattern()}, url(${
                    simulationData.ExerciseInfo.terrain == 'Dessert'
                      ? dessertTerainSvg
                      : simulationData.ExerciseInfo.terrain == 'Semi Dessert'
                      ? semiDessetTerainSvg
                      : denseTerainSvg
                  })`,
                  backgroundRepeat: 'no-repeat',
                  zIndex: '-1',
                  backgroundSize: `${1000 * zoom}px ${1000 * zoom}px`,
                  height: '1000px',
                  width: '1000px',
                  border: '1px solid rgba(255, 255, 255, 0.578)',
                  position: 'relative',
                  cursor: 'grab',
                }}
              >
                <div className="item_position" style={{ marginLeft: '100px' }}>
                  <div className="item_position_clip_path_1"></div>
                  <div className="item_position_clip_path_2"></div>
                  <div>X : {normalizePathX(mousePosition.x).toFixed(0)}</div>
                  <div>Y : {normalizePathY(mousePosition.y).toFixed(0)}</div>
                  <div style={{ width: '200px' }}>1 BLOCK : 1000M</div>
                </div>

                <div
                  className="compass_img_main_container"
                  style={{
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

                {updatedItems
                  ? updatedItems.map((item,index) => (
                      <React.Fragment key={index}>
                        <div
                          className="Testing-grid updating"
                          // onMouseDown={(e) => handleItemMouseDown(item.id, e)}
                          style={{
                            left: (item.x + pan.x) * zoom,
                            top: (item.y + pan.y) * zoom,
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
                        {objectStartPoints.find(
                          (point) => point.id === item.id,
                        ) && (
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

                              position: 'absolute',
                              width: '20px',
                              height: '20px',
                              backgroundSize: 'cover',
                            }}
                          />
                        )}
                      </React.Fragment>
                    ))
                  : items.map((item ,index) => (
                      <React.Fragment key={index}>
                        <div
                          className="Testing-grid"
                          // onMouseDown={(e) => handleItemMouseDown(item.id, e)}
                          style={{
                            left: (item.x + pan.x) * zoom,
                            top: (item.y + pan.y) * zoom,
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
                        {objectStartPoints.find(
                          (point) => point.id === item.id,
                        ) && (
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
            )}
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
