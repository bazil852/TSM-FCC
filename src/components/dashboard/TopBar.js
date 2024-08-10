import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';

export default function TopBar() {
  const [spStatus, setSpStatus] = useState({
    start: false,
    pause: false,
    end: false,
    respawn: false,
  });

  // Function to fetch the sp.json data
  const fetchSpStatus = async () => {
    try {
      const spData = await ipcRenderer.invoke(
        'read-json',
        process.env.SP_DATA_PATH,
      );
      setSpStatus(spData);
    } catch (error) {
      console.error('Error fetching sp.json data:', error);
    }
  };

  // Function to update sp.json data
  const updateSpStatus = async (updatedData) => {
    try {
      await ipcRenderer.invoke('write-json', {
        filePath: process.env.SP_DATA_PATH,
        data: updatedData,
      });
      setSpStatus(updatedData); // Update state with new data
    } catch (error) {
      console.error('Error updating sp.json data:', error);
    }
  };

  // Fetch sp.json data when the component mounts and every 5 seconds
  useEffect(() => {
    fetchSpStatus(); // Initial fetch
    const intervalId = setInterval(fetchSpStatus, 5000); // Fetch every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Handlers for button clicks
  const handleRespawn = () => {
    const updatedStatus = { ...spStatus, respawn: true };
    updateSpStatus(updatedStatus);
  };

  const handleStart = () => {
    const updatedStatus = { ...spStatus, start: true };
    updateSpStatus(updatedStatus);
  };

  const handlePauseSimulation = () => {
    const updatedStatus = { ...spStatus, pause: !spStatus.pause };
    updateSpStatus(updatedStatus);
  };

  const handleEndSimulation = () => {
    const updatedStatus = { ...spStatus, end: true };
    updateSpStatus(updatedStatus);
  };

  return (
    <div className="topBar_main_class">
      <button
        disabled={spStatus.start}
        className={spStatus.start ? 'topBar_btn_true' : 'topBar_btn'}
        onClick={handleStart}
      >
        Start
      </button>
      <button
        disabled={spStatus.respawn}
        className={spStatus.respawn ? 'topBar_btn_true' : 'topBar_btn'}
        onClick={handleRespawn}
      >
        RESPAWN
      </button>
      <button
        style={{ cursor: 'pointer' }}
        className={spStatus.pause ? 'topBar_btn_true' : 'topBar_btn'}
        onClick={handlePauseSimulation}
      >
        PAUSE SIMULATION
      </button>
      <button
        disabled={spStatus.end}
        className={spStatus.end ? 'topBar_btn_true' : 'topBar_btn'}
        onClick={handleEndSimulation}
      >
        <NavLink to="/report">END SIMULATION</NavLink>
      </button>
    </div>
  );
}
