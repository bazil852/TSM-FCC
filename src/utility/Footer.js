import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import '../renderer/App.css';

const { ipcRenderer } = require('electron');

export default function Footer() {
  const navigate = useNavigate();
  const dataArrayState = useSelector((state) => state.dataArray);
  const selectedMap = useSelector((state) => state.selectedItem);

  const saveStateToJsonFile = () => {
    console.log(dataArrayState);
    console.log('Workings');

    if (dataArrayState.newMapCreated) {
      ipcRenderer.send('save-map-data', dataArrayState);
    } else {
      console.log(selectedMap.selectedMapID);
      ipcRenderer.send('update-map-data', {
        idmap: selectedMap.selectedMapID,
        mapData: dataArrayState,
      });
    }

    ipcRenderer.send('save-json', {
      data: dataArrayState,
      filename: process.env.SIMULATION_DATA_PATH,
    });
    navigate("/dashboard")
  };

  useEffect(() => {
    const handleSaveResponse = (response) => {
      if (response.success) {
        console.log('File saved successfully:', response.message);
      } else {
        console.error('File save error:', response.message);
      }
    };

    ipcRenderer.on('save-json-response', handleSaveResponse);
    ipcRenderer.on('update-map-data-response', handleSaveResponse);
    ipcRenderer.on('save-map-data-response', handleSaveResponse);

    return () => {
      ipcRenderer.removeListener('save-json-response', handleSaveResponse);
      ipcRenderer.removeListener(
        'update-map-data-response',
        handleSaveResponse,
      );
      ipcRenderer.removeListener('save-map-data-response', handleSaveResponse);
    };
  }, []);

  return (
    <div className="footer">
      <div className="footer_first_box">
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => navigate(-1)}
          className="underline"
          to="/"
        >
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
            style={{ cursor: 'pointer' }}
            className="underline"
            onClick={saveStateToJsonFile}
          >
            CONTINUE
          </div>
        </div>
      </div>
    </div>
  );
}
