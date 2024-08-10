import React, { useState,useEffect } from 'react';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';

export default function Status() {
  const studentStatus = [
    {
      title: 'STUDENT STATUS',
      'Total Enemies': 7,
      'Total Hits': 9,
      'Damage Taken': 9,
    },
  ];
  const simulationStatus = [
    {
      title: 'SIMULATION STATUS',
      'Elapsed Time': '00:23',
      'Time Left': '00:30',
      'Total Time': '00:53',
    },
  ];
  const ammoStatus = [
    {
      title: 'AMMO STATUS',
      Total: 1000,
      Fired: 300,
      Balancer: 100,
      'Total MG': 25,
      'MG Fired': 25,
      'MG Balancer': 50,
    },
  ];

  const [studentStatusNew, setStudentStatus] = useState({});
  const [simulationStatusNew, setSimulationStatus] = useState({});

  // Function to fetch data from the JSON files
 const fetchData = async () => {
   try {
      const playerData = await ipcRenderer.invoke(
        'read-json',
        process.env.PLAYER_DATA_PATH,
      );
      const simulationData = await ipcRenderer.invoke(
        'read-json',
        process.env.SIMULATION_DATA_PATH,
      );
     const spData = await ipcRenderer.invoke(
       'read-json',
       process.env.SP_DATA_PATH,
     );
     console.log(spData)
    //  const studentData = await window.electron.readJSON(
    //    'E:/TSM-FCC-main/JSON_Files/PlayerData.json',
    //  );
    //  const simulationData = await window.electron.readJSON(
    //    'E:/TSM-FCC-main/JSON_Files/tsm.json',
    //  );
     console.log(playerData.Player);
     console.log(simulationData)
     setStudentStatus(playerData);
     setSimulationStatus(simulationData);
   } catch (error) {
     console.error('Error fetching data:', error);
   }
 };

 // Fetch data when the component mounts
 useEffect(() => {
   fetchData(); // Initial fetch
   const intervalId = setInterval(fetchData, 5000); // Fetch every 5 seconds

   return () => clearInterval(intervalId); // Cleanup interval on component unmount
 }, []);
  
  
  useEffect(() => {

    if (simulationStatusNew) {
      
    }

  }, [simulationStatusNew]);
  
  

  const allStatus = [studentStatus, simulationStatus, ammoStatus];

  return (
    <div className="status_main_class">
      <div className="status_main_heading">STATUS</div>
      {allStatus.map((statusArray, index) => (
        <div key={index} className="status_box">
          <div className="status_title">{statusArray[0].title}</div>
          {Object.entries(statusArray[0]).map(([key, value]) => {
            if (key !== 'title') {
              return (
                <div key={key} className="status_item">
                  <strong>{key}:</strong>
                  <p> {value}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
