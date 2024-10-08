import React, { useEffect, useState } from 'react';
import { useSpring, animated } from 'react-spring';
import { useDispatch, useSelector } from 'react-redux';
import { addItem } from '../redux/CarouselSelectedItemSlice';
import MapCarousel from '../components/simulation-components/MapCarousel';
import '../renderer/App.css';
import tank1 from '../TSM-img/tank1.svg';
import tank2 from '../TSM-img/tank2.svg';
import tank3 from '../TSM-img/tank3.png';
import tank4 from '../TSM-img/tank4.png';
import tank5 from '../TSM-img/tank5.png';
import tank6 from '../TSM-img/tank6.png';
import tank7 from '../TSM-img/tank7.png';
import tank8 from '../TSM-img/tank8.png';
import forest1 from '../TSM-img/forest1.svg';
import rocks from '../TSM-img/rocks.png';
import car1 from '../TSM-img/car1.png';
import car2 from '../TSM-img/car2.png';
import car3 from '../TSM-img/car3.png';
import car4 from '../TSM-img/car4.png';
import car5 from '../TSM-img/car5.png';
import car6 from '../TSM-img/car6.png';
import car7 from '../TSM-img/car7.png';
import car8 from '../TSM-img/car8.png';
import jhompri from '../TSM-img/Jhompri.png';
import house from '../TSM-img/House.png';
import hospital from '../TSM-img/Hospital.png';
import railwayStation from '../TSM-img/RailwayStation.png';
import shack from '../TSM-img/Shack.png';
import shop from '../TSM-img/Shop.png';
import smallHouse from '../TSM-img/SmallHouse.png';
import store from '../TSM-img/Store.png';
import villageHut from '../TSM-img/VillageHut.png';
import wareHouse from '../TSM-img/WareHouse.png';
import waterTankTower from '../TSM-img/WaterTankTower.png';
import data from '../data.json';
import { setOnlyOneOwnTank } from '../redux/DataArray';

const selectEnemyArray = data.selectEnemyArray;
const selectEnemyObjectsArray = data.selectEnemyObjectsArray;
const selectBuildingsArray = data.selectBuildingsArray;
const selectNaturalObjectsArray = data.selectNaturalObjectsArray;
const selectYourTank = data.selectYourTank;

export default function SelectObjectCarousel({ carouselObjectType }) {
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [show, setShown] = useState(false);
  const [existingOwnTank, setExistingOwnTank] = useState(false);
  const dispatch = useDispatch();

  const onlyOneOwnTank = useSelector((state) => state.dataArray.onlyOneOwnTank);

  const ownTanksArray = useSelector((state) => state.dataArray.Player);

  const props3 = useSpring({
    transform: show ? 'scale(1.03)' : 'scale(1)',
  });

  const [detailsProps, setDetailsProps] = useSpring(() => ({
    opacity: 1,
    transform: 'translateX(0px)',
    from: { opacity: 0, transform: 'translateX(100px)' },
  }));

  const handleSlideChange = (newIndex) => {
    if (newIndex !== selectedSlide) {
      setSelectedSlide(newIndex);
      setDetailsProps({
        opacity: 1,
        transform: 'translateX(0px)',
        from: { opacity: 0, transform: 'translateX(100px)' },
        reset: true,
      });
    }
  };

  const chosenArray =
    carouselObjectType === 1
      ? selectEnemyArray
      : carouselObjectType === 2
      ? selectEnemyObjectsArray
      : carouselObjectType === 3
      ? selectBuildingsArray
      : carouselObjectType === 4
      ? selectNaturalObjectsArray
      : carouselObjectType === 5
      ? selectYourTank
      : selectEnemyArray;

  const imageMap = {
    tank1: tank1,
    tank2: tank2,
    tank3: tank3,
    tank4: tank4,
    tank5: tank5,
    tank6: tank6,
    tank7: tank7,
    tank8: tank8,
    car1: car1,
    car2: car2,
    car3: car3,
    car4: car4,
    car5: car5,
    car6: car6,
    car7: car7,
    car8: car8,
    forest1: forest1,
    rocks: rocks,
    jhompri: jhompri,
    house: house,
    hospital: hospital,
    railwayStation: railwayStation,
    shack: shack,
    shop: shop,
    smallHouse: smallHouse,
    store: store,
    villageHut: villageHut,
    wareHouse: wareHouse,
    waterTankTower: waterTankTower,
  };

  const getImage = (imageName) => imageMap[imageName];

  const ownTanksCount = Object.keys(ownTanksArray).length;

  const handleDispatchItem = () => {
    const selectedItem = chosenArray[0]?.objects[selectedSlide];
    if (selectedItem?.type === 'myTank') {
      if (ownTanksCount === 0) {
        dispatch(addItem(selectedItem));
        setExistingOwnTank(true);
        dispatch(setOnlyOneOwnTank(false));
      } else {
        console.log('THERE CAN ONLY BE ONE OWN TANK!!');
      }
    } else if (selectedItem) {
      console.log(selectedItem);
      console.log("enemy")
      dispatch(addItem(selectedItem));
    }
  };

  const objectsImagesOfCarousel = chosenArray[0]?.objects.map((obj, index) => ({
    key: index,
    content: (
      <animated.div
        className={
          carouselObjectType === 3
            ? 'carousel_image_building'
            : 'carousel_image'
        }
        style={props3}
        onMouseEnter={() => setShown(true)}
        onMouseLeave={() => setShown(false)}
      >
        <img src={getImage(obj.image)} alt={obj.name} />
      </animated.div>
    ),
  }));

  const selectedObject = chosenArray[0]?.objects[selectedSlide];

  useEffect(() => {
    if (onlyOneOwnTank) {
      setExistingOwnTank(false);
    }
  }, [onlyOneOwnTank, existingOwnTank]);

  return (
    <div className="select_object_main_class">
      {chosenArray.map((object, index) => {
        return (
          <div key={index}>
            <div className="select_object_type_name" key={index}>
              {object.title}
            </div>
            <div className="select_object_main_container">
              <MapCarousel
                cards={objectsImagesOfCarousel}
                height="38vh"
                width="100%"
                margin="0 auto"
                offset={2}
                showArrows={false}
                onSlideChange={handleSlideChange}
              />
            </div>

            <div className="selected_object_details">
              <animated.div style={detailsProps}>
                <div className="selected_object_details_object_name">
                  <div>{selectedObject?.name}</div>
                  <div className="btn_main_container">
                    <button
                      className="btn btn1"
                      onClick={handleDispatchItem}
                      style={{
                        pointerEvents:
                          selectedObject?.type === 'myTank' && existingOwnTank
                            ? 'none'
                            : 'all',
                      }}
                    >
                      ADD
                    </button>
                  </div>
                </div>
                <div className="selected_object_details_values_container">
                  {selectedObject?.details.map((detail, detailIndex) => (
                    <div
                      className="selected_object_details_values"
                      key={detailIndex}
                    >
                      <div
                        className="selcted_object_detail_title_value"
                        style={{ fontWeight: 700 }}
                      >
                        {detail.title}
                      </div>
                      <div className="selcted_object_detail_title_value">
                        {detail.value}
                      </div>
                    </div>
                  ))}
                  <div className="center_border" />
                </div>
              </animated.div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
