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
  setMapArea,
  setTerrain,
  setOnlyOneOwnTank
} from '../../redux/DataArray';
import { useDispatch } from 'react-redux';

export default function SelectMap() {
  const dispatch = useDispatch()
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [show, setShown] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [allMaps, setmaps] = useState();
  const fetchMaps = async () => {
    let data = await ipcRenderer.invoke('fetch-maps');
    console.log(data);
    setmaps(data);
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
    console.log('selecting Map');
    console.log(itemData);
    dispatch(setTerrain(itemData.data.ExerciseInfo.terrain));
    dispatch(setExerciseTime(itemData.data.ExerciseInfo.exerciseTime));
    dispatch(setMapArea(itemData.data.ExerciseInfo.mapArea));
    dispatch(setOnlyOneOwnTank(itemData.data.onlyOneOwnTank));
    // itemData.data.Enemy.map((data) => dispatch(addEnemy(data)));
    // dispatch(addOwnTank(itemData.data.Player));
    itemData.data.Items.House.length > 0
      ? itemData.data.Items.House.map((data) => dispatch(addHouse(data)))
      : null;
    itemData.data.Items.Hospital.length > 0
      ? itemData.data.Items.Hospital.map((data) => dispatch(addHospital(data)))
      : null;
    itemData.data.Items.Jhompri.length > 0
      ? itemData.data.Items.Jhompri.map((data) => dispatch(addJhompri(data)))
      : null;
    itemData.data.Items.RailwayStation.length > 0
      ? itemData.data.Items.RailwayStation.map((data) =>
          dispatch(addRailwayStation(data)),
        )
      : null;
    itemData.data.Items.Rocks.length > 0
      ? itemData.data.Items.Rocks.map((data) => dispatch(addRocks(data)))
      : null;
    itemData.data.Items.Shack.length > 0
      ? itemData.data.Items.Shack.map((data) => dispatch(addShack(data)))
      : null;
    itemData.data.Items.Shop.length > 0
      ? itemData.data.Items.Shop.map((data) => dispatch(addShop(data)))
      : null;
    itemData.data.Items.SmallHouse.length > 0
      ? itemData.data.Items.SmallHouse.map((data) =>
          dispatch(addSmallHouse(data)),
        )
      : null;
    itemData.data.Items.Store.length > 0
      ? itemData.data.Items.Store.map((data) => dispatch(addStore(data)))
      : null;
    itemData.data.Items.Trees.length > 0
      ? itemData.data.Items.Trees.map((data) => dispatch(addTrees(data)))
      : null;
    itemData.data.Items.VillageHut.length > 0
      ? itemData.data.Items.VillageHut.map((data) =>
          dispatch(addVillageHut(data)),
        )
      : null;
    itemData.data.Items.WareHouse.length > 0
      ? itemData.data.Items.WareHouse.map((data) =>
          dispatch(addWareHouse(data)),
        )
      : null;
    itemData.data.Items.WaterTankTower.length > 0
      ? itemData.data.Items.WaterTankTower.map((data) =>
          dispatch(addWaterTankTower(data)),
        )
      : null;
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
              CREATE NEW
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
