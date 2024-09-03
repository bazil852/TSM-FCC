import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../renderer/App.css';
import mainMenu from '../TSM-img/main_menu.svg';
import backButton from '../TSM-img/back_button.svg';
import Footer from '../utility/Footer';
import data from '../data.json';
import TSMBoreDayJson from '../../JSON_Files/tsm.json';
import TSMBoreNightJson from '../../JSON_Files/tsm.json';
import TSMFriendlyJson from '../../JSON_Files/tsm.json';
import { ipcRenderer } from 'electron';

export default function BasicAdvanceTab() {
  const [toggle, setToggle] = useState(false);

  const basicDetails = data.basicDetails;

  const advanceDetails = data.advanceDetails;

  const studentTabStyle = {
    opacity: !toggle ? 1 : 0,
    maxHeight: !toggle ? '100%' : '0',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  };

  const instructorTabStyle = {
    opacity: toggle ? 1 : 0,
    maxHeight: toggle ? '100%' : '0',
    overflow: 'hidden',
    transition: 'all 0.3s ease-in-out',
  };
  const navigate = useNavigate();

  const selectMode = (data) => {
    console.log(data);
    var jsonData;
    if (data.key == 'boreDay') {
      jsonData = TSMBoreDayJson;
    } else if (data.key == 'boreNight') {
      jsonData = TSMBoreNightJson;
    } else {
      jsonData = TSMFriendlyJson;
    }
    console.log(jsonData);
    ipcRenderer.send('save-json', {
      data: jsonData,
      filename: process.env.SIMULATION_DATA_PATH,
    });
    navigate('/dashboard');
  };

  return (
    <div
      className="select_student_instructor_main_class"
      style={{ backgroundImage: `url(${mainMenu})` }}
    >
      <NavLink className="navigation_button_with_bigger_width" to="/simulation">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> SIMULATION /
        </span>
        <span id="second_span_navigation_button">FRIENDLY MODE</span>
      </NavLink>

      <div className="basic_advance_tab_main_content_container">
        <div className="basic_advance_tab_main_content">
          <div className="basic_advance_tabs_button">
            <div
              className="basic_advance_tab_button"
              onClick={() => setToggle(false)}
              style={{
                background: !toggle && 'rgba(255, 255, 255, 0.2)',
                fontWeight: !toggle ? '700' : '500',
                transition: 'background 0.2s ease-in-out',
              }}
            >
              BASIC
            </div>
            <div
              className="basic_advance_tab_button"
              onClick={() => setToggle(true)}
              style={{
                background: toggle && 'rgba(255, 255, 255, 0.2)',
                fontWeight: toggle ? '700' : '500',
                transition: 'background 0.2s ease-in-out',
              }}
            >
              ADVACNED
            </div>
          </div>

          <div className="tabs_container_basic_advance">
            <div className="basic_advance_tab_content" style={studentTabStyle}>
              {basicDetails.map((data, index) => {
                return (
                  <div
                    style={{ cursor: 'pointer' }}
                    onClick={() => selectMode(data)}
                    key={index}
                  >
                    <div className="basic_advance_tab_content_box">
                      <div className="basic_advance_tab_content_box_heading">
                        {data.title}
                      </div>
                      <div className="partition" />
                      <div className="basic_advance_tab_content_box_content">
                        {data.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div
              className="basic_advance_tab_content"
              style={instructorTabStyle}
            >
              {advanceDetails.map((data, index) => {
                return (
                  <div key={index}>
                    <div className="basic_advance_tab_content_box">
                      <div className="basic_advance_tab_content_box_heading">
                        {data.title}
                      </div>
                      <div className="partition" />
                      <div className="basic_advance_tab_content_box_content">
                        {data.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
