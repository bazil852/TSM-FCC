import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { NavLink } from 'react-router-dom';
import '../../renderer/App.css';
import map1 from '../../TSM-img/map_1.svg';
import map2 from '../../TSM-img/map_2.svg';
import map3 from '../../TSM-img/map_3.svg';
import car1 from '../../TSM-img/car1.svg';
import MapCarousel from './MapCarousel';
import MapDetailModel from './MapDetailModel';
import data from '../../data.json';
import mapImg from '../../TSM-img/map_1.svg';
import { ipcRenderer } from 'electron';
import {
  addEnemy,
  addEnemyCar,
  addHospital,
  addHouse,
  addJhompri,
  addOwnTank,
  addRailwayStation,
  addRocks,
  addShack,
  addShop,
  addSmallHouse,
  addStore,
  addTrees,
  addVillageHut,
  addWareHouse,
  addWaterTankTower,
  setExerciseTime,
  setTerrain,
  setOnlyOneOwnTank,
  updateTotalOwnTanks,
  updateTotalEnemies,
  setNewMapCreated,
} from '../../redux/DataArray';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedMapID } from '../../redux/CarouselSelectedItemSlice';

export default function SelectMap() {
  const dispatch = useDispatch();
  const dataArrayState = useSelector((state) => state.dataArray);
  console.log(dataArrayState);

  const [selectedSlide, setSelectedSlide] = useState(0);
  const [show, setShown] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [allMaps, setMaps] = useState();

  const fetchMaps = async () => {
    let data = await ipcRenderer.invoke('fetch-maps');
    console.log(data);
    setMaps(data);
  };

  useEffect(() => {
    fetchMaps();
  }, []);

  const mapData = [
    {
      id: 1,
      image: 'Test1',
      name: 'Test1',
      email: '50',
      phone: '123-456-7890',
    },
    {
      id: 2,
      image: 'Test2',
      name: 'Test2',
      email: '44',
      phone: '20',
    },
    {
      id: 3,
      image: 'Test3',
      name: 'Test3',
      email: 'alice.johnson@example.com',
      phone: '456-789-0123',
    },
  ];

  

  const props3 = useSpring({
    transform: show ? 'scale(1.03)' : 'scale(1)',
  });

  const maps = [map1, map2, map3].map((imagen, index) => ({
    key: index,
    content: (
      <animated.div
        className="map_image"
        style={props3}
        onMouseEnter={() => setShown(true)}
        onMouseLeave={() => setShown(false)}
      >
        <img src={imagen} alt={`Map ${index + 1}`} />
      </animated.div>
    ),
  }));

  const handleSlideChange = (newIndex) => {
    setSelectedSlide(newIndex);
  };

  const openMapDetailModel = () => {
    setOpenModal(!openModal);
  };

  const handleClickOutside = (event) => {
    if (event.target.className.includes('map_detail_model_main_class')) {
      setOpenModal(false);
    }
  };

  const mapDetail = data.mapNameAndAreaForSelectMapPage;
  console.log(mapDetail);
  const selectedMapDetail = mapDetail[selectedSlide] || mapDetail[0];

  useEffect(() => {
    if (openModal) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openModal]);

  const selectMap = (itemData) => {
    
    dispatch(setNewMapCreated(false));
    const defaultAmmo = {
      Heat: 40,
      APFSDS: 40,
      HE: 40,
      MG: 1000,
    };
    console.log(itemData);
    dispatch(setSelectedMapID(itemData.idmap));
    dispatch(setTerrain(itemData.data.ExerciseInfo.terrain));
    dispatch(setExerciseTime(itemData.data.ExerciseInfo.exerciseTime));
    // dispatch(setMapArea(itemData.data.ExerciseInfo.mapArea));
    dispatch(setOnlyOneOwnTank(itemData.data.onlyOneOwnTank));

    Object.keys(itemData.data.Enemy).forEach((enemyType) => {
      itemData.data.Enemy[enemyType].forEach((enemy) => {
        console.log(enemy);
        const enemyPayload = {
          ...enemy,
          enemyName: enemyType,
          path: enemy.Path.map((data) => ({
            x: data.pointx,
            y: data.pointy,
          })),
          spawning_point: {
            x: enemy.SpawnLocation.pointx,
            y: enemy.SpawnLocation.pointy,
          },
        };
        console.log(enemyPayload);
        dispatch(addEnemyCar(enemyPayload));
      });
    });
    const playerAmmo = itemData.data.Player.Ammo || defaultAmmo;
    const playerWithLowercaseAmmo = {
      ...itemData.data.Player,
      initialAmmo: {
        heat: playerAmmo.Heat,
        apfsds: playerAmmo.APFSDS,
        he: playerAmmo.HE,
        mg762: playerAmmo.MG,
      },
      spawning_point: {
        x: itemData.data.Player.SpawnLocation.pointx,
        y: itemData.data.Player.SpawnLocation.pointy,
      },
      path: itemData.data.Player.Path.map((data) => ({
        x: data.pointx,
        y: data.pointy,
      })),
    };

    console.log(playerWithLowercaseAmmo);

    dispatch(addOwnTank(playerWithLowercaseAmmo));
    dispatch(updateTotalOwnTanks(itemData.data.totalOwnTanks));
    dispatch(updateTotalEnemies(itemData.data.totalEnemies));
    itemData.data.Items.House.map((house) => {
      console.log(house);
      const housePayload = {
        ...house,
        spawning_point: {
          x: house.pointx,
          y: house.pointy,
        },
      };
      dispatch(addHouse(housePayload));
    });

    itemData.data.Items.Hospital.forEach((data) => dispatch(addHospital(data)));
    itemData.data.Items.Jhompri.forEach((data) => dispatch(addJhompri(data)));
    itemData.data.Items.RailwayStation.forEach((data) =>
      dispatch(addRailwayStation(data)),
    );
    itemData.data.Items.Rocks.forEach((data) => dispatch(addRocks(data)));
    itemData.data.Items.Shack.forEach((data) => dispatch(addShack(data)));
    itemData.data.Items.Shop.forEach((data) => dispatch(addShop(data)));
    itemData.data.Items.SmallHouse.forEach((data) =>
      dispatch(addSmallHouse(data)),
    );
    itemData.data.Items.Store.forEach((data) => dispatch(addStore(data)));
    itemData.data.Items.Trees.forEach((data) => dispatch(addTrees(data)));
    itemData.data.Items.VillageHut.forEach((data) =>
      dispatch(addVillageHut(data)),
    );
    itemData.data.Items.WareHouse.forEach((data) =>
      dispatch(addWareHouse(data)),
    );
    itemData.data.Items.WaterTankTower.forEach((data) =>
      dispatch(addWaterTankTower(data)),
    );
  };

  return (
    <div className="select_map_main_class">
      <div className="select_map_main_heading">SELECT MAP</div>
      <div className="map_slider">
        <div className="map_name_details">
          <div className="map_name">Maps Detail</div>
        </div>
        <div className="map_main_container">
          <div className="table-container">
            <table className="simple-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Area</th>
                  <th>Total Enemies</th>
                  <th>Own Tanks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {allMaps &&
                  allMaps.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <img
                          src={mapImg}
                          alt={item.name}
                          className="table-image"
                        />
                      </td>
                      <td>{item.data.ExerciseInfo.mapArea}</td>
                      <td>{item.data.totalEnemies}</td>
                      <td>{item.data.totalOwnTanks}</td>
                      <td>
                        <button
                          onClick={() => selectMap(item)}
                          style={{
                            marginLeft: '10px',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            padding: '5px 10px 5px 10px',
                            zIndex: '10',
                          }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="select_map_button_group_main_class">
          <div className="select_map_button_group">
            <NavLink to={'/create_map'} className="select_map_button">
              {dataArrayState.newMapCreated ? 'Create New Map' : 'Update Map'}
            </NavLink>
            {/* <div
              className="select_map_button"
              type="button"
              onClick={openMapDetailModel}
            >
              PREVIEW
            </div> */}
          </div>
        </div>
      </div>
      {openModal && (
        <MapDetailModel
          mapName={selectedMapDetail.name}
          onClose={() => setOpenModal(false)}
        />
      )}
    </div>
  );
}
