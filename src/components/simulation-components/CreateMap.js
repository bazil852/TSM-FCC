import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { setExerciseTime, setTerrain, setMapName } from '../../redux/DataArray';
import mainMenu from '../../TSM-img/main_menu.svg';
import backButton from '../../TSM-img/back_button.svg';
import DropDown from '../../utility/DropDown';
import SelectObjectCarousel from '../../utility/SelectObjectCarousel';
import GridCanvas from './GridCanvas';
import data from '../../data.json';
import { ipcRenderer } from 'electron';

export default function CreateMap() {
  const dispatch = useDispatch();
  const [mapName, setMapNm] = useState('');
  const navigate = useNavigate();
  const options = data.dropDownOptionsOfExcersieTime;
  const options1 = data.dropDownOptionsOfSelectTerrain;

  const enemy = useSelector((state) => state.dataArray.Enemy);
  const objects = useSelector((state) => state.dataArray.Items);
  const Player = useSelector((state) => state.dataArray.Player);

  const [exerciseTime, setExerciseTimes] = useState(options[0]);
  const [terrain, setTerain] = useState(options1[0]);

  const handleMapNameChange = (value) => {
    console.log(value);
    setMapNm(value);
    dispatch(setMapName(value));
  };

  const handleExerciseTime = (option) => {
    setExerciseTimes(option);
    dispatch(setExerciseTime(option));
  };
  const handleTerrain = (option) => {
    setTerain(option);
    dispatch(setTerrain(option));
  };

  const handleSave = () => {
    let mapData = {
      Player,
      enemy,
      objects,
    };
    console.log('Saving Map to db', mapData);

    // Send the mapData to the main process

    navigate(-1);
  };

  return (
    <div
      className="create_map_main_class"
      style={{ backgroundImage: `url(${mainMenu})` }}
    >
      <NavLink className="navigation_button_create_map" to="/simulation">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> CREATE MAP /
        </span>
        <span id="second_span_navigation_button">CREATE MAP</span>
      </NavLink>

      <div className="create_map_save_button">
        <button onClick={handleSave}>SAVE</button>
      </div>

      <div style={{ display: 'flex' }}>
        <div className="create_map_grid_container">
          <GridCanvas stylingBox={1} />
        </div>

        <div className="parameters_create_map_main_container">
          <div className="parameter_create_map_content_section">
            <div className="parameter_heading_create_map">PARAMETERS</div>

            <div className="select_exercise_time_dropdown">
              <div className="select_map_name">
                <span>Map Name</span>
                <input
                  type="text"
                  value={mapName}
                  onChange={(e) => {
                    console.log(e);
                    handleMapNameChange(e.target.value);
                  }}
                />
              </div>
            </div>

            <div
              className="select_exercise_time_dropdown"
              style={{ zIndex: 3 }}
            >
              <span>EXERCISE TIME</span>
              <DropDown
                options={options}
                selected={exerciseTime}
                onOptionSelect={handleExerciseTime}
              />
            </div>
            <div className="select_terrain_dropdown" style={{ zIndex: 2 }}>
              <span>SELECT TERRAIN</span>
              <DropDown
                options={options1}
                selected={terrain}
                onOptionSelect={handleTerrain}
              />
            </div>
          </div>

          <div className="select_objects_main_container">
            <div className="select_enemy">
              <SelectObjectCarousel carouselObjectType={1} />
            </div>
            <div className="select_enemy_object">
              <SelectObjectCarousel carouselObjectType={2} />
            </div>
            <div className="select_buildings">
              <SelectObjectCarousel carouselObjectType={3} />
            </div>
            <div className="select_natural_objects">
              <SelectObjectCarousel carouselObjectType={4} />
            </div>
            <div className="select_your_tank">
              <SelectObjectCarousel carouselObjectType={5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
