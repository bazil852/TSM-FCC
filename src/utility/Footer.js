import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import '../renderer/App.css';

const { ipcRenderer } = require('electron');
// const { dialog } = require('electron').remote;

// const { ipcRenderer } = require('electron');

export default function Footer() {
  const navigate = useNavigate()
  const dataArrayState = useSelector((state) => state.dataArray);
  // Function to save the state to a JSON file
  const saveStateToJsonFile = () => {
    console.log(dataArrayState)
    // Send the data to the main process
    console.log('Workings');
    ipcRenderer.send('save-json', {
      data: dataArrayState,
      filename: 'tsm.json',
    });
    console.log(dataArrayState)
    ipcRenderer.send('save-map-data', dataArrayState);
    navigate("/dashboard")
  };

  useEffect(() => {
    const handleSaveResponse = (event, response) => {
      if (response.success) {
        
        console.log('File saved successfully:', response.message);
      } else {
        console.error('File save error:', response.message);
      }
    };

    ipcRenderer.on('save-json-response', handleSaveResponse);

    // Clean up
    return () => {
      ipcRenderer.removeListener('save-json-response', handleSaveResponse);
    };
  }, []);

  return (
    <div className="footer">
      <div className="footer_first_box">
        <div style={{cursor:"pointer"}} onClick={() => navigate(-1)} className="underline" to="/">
          BACK
        </div>
        <NavLink className="underline" to="/help">
          HELP
        </NavLink>
      </div>
      <div className="footer_second_box">
        <NavLink className="underline" to="/tutorials">
          TUTORIALS
        </NavLink>
        <div id="footer_second_box_second_span">
          <div
            style={{cursor:"pointer"}}
            className="underline"
            onClick={saveStateToJsonFile}
          >
            CONTINUE
          </div>
          {/* <button className="underline" >
            CONTINUE
          </button> */}
        </div>
      </div>
    </div>
  );
}
