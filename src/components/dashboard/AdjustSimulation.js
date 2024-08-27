import { useState, useEffect } from 'react';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';

export default function AdjustSimulation() {
  const [ammoType, setAmmoType] = useState('');
  const [spStatus, setSpStatus] = useState({
    start: false,
    pause: false,
    end: false,
    respawn: false,
    XTurretSensitivity: 1.3,
    YTurretSensitivity: 1.4,
    DoAllEnemeySmoke: false,
    ArtilleryStrikeLocation: {
      pointx: 27834,
      pointy: 224460,
    },
  });

  // Function to fetch the latest data from sp.json
  const fetchSpStatus = async () => {
    try {
      const spData = await ipcRenderer.invoke(
        'read-json',
        process.env.SP_DATA_PATH,
      );
      setSpStatus(spData); // Update state with the latest data from the JSON file
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

  // Function to handle "Enemy Smoke Grenade" button click
  const handleEnemySmokeGrenade = () => {
    const updatedStatus = { ...spStatus, DoAllEnemeySmoke: true };
    updateSpStatus(updatedStatus);

    // Set DoAllEnemeySmoke to false after 2 seconds
    setTimeout(() => {
      const resetSmokeStatus = { ...updatedStatus, DoAllEnemeySmoke: false };
      updateSpStatus(resetSmokeStatus);
    }, 2000);
  };

  useEffect(() => {
    fetchSpStatus(); // Fetch the initial data when component mounts
    const intervalId = setInterval(fetchSpStatus, 5000); // Fetch the latest data every 5 seconds

    return () => clearInterval(intervalId); // Cleanup the interval on component unmount
  }, []);

  const adjustSimulation = [
    { title: 'AZIMUTH CALLIBRATION' },
    { title: 'BORE SIGHTING' },
  ];
  const faults = [
    { title: 'FCC FAILURE' },
    { title: 'JOYSTICK FAILURE' },
    { title: 'LASER FAILURE' },
  ];
  const ammo = [
    { title: 'APFSDS' },
    { title: 'HEAT' },
    { title: 'HESH' },
    { title: '7.62' },
  ];

  return (
    <div className="adjust_simulation_main_class">
      <div className="adjust_simulation_box">
        <div className="adjust_simulation_box_heading">ADJUST SIMULATION</div>
        <div className="adjust_simulation_box_content">
          {adjustSimulation.map((data, index) => {
            return (
              <div
                className="adjust_simulation_box_content_category"
                key={index}
              >
                {data.title}
              </div>
            );
          })}
          <div
            className={
              !spStatus.DoAllEnemeySmoke
                ? 'adjust_simulation_box_content_category'
                : 'adjust_simulation_box_content_category_select'
            }
            onClick={handleEnemySmokeGrenade}
          >
            Enemy Smoke Grenade
          </div>
          <div className="adjust_simulation_box_content_category">
            Enemy Artillery
          </div>
        </div>
      </div>

      <div className="faults_box">
        <div className="faults_box_heading">FAULTS</div>
        <div className="faults_box_content">
          {faults.map((data, index) => {
            return (
              <div className="faults_box_content_category" key={index}>
                {data.title}
              </div>
            );
          })}
        </div>
      </div>

      <div className="ammo_box">
        <div className="ammo_box_heading">CHANGE AMMO</div>
        <div className="ammo_box_content">
          {ammo.map((data, index) => {
            return (
              <div
                className="ammo_box_ammo"
                key={index}
                style={{
                  borderTopLeftRadius: index === 0 ? '10px' : '0px',
                  borderBottomLeftRadius: index === 0 ? '10px' : '0px',
                  borderTopRightRadius: index === 3 ? '10px' : '0px',
                  borderBottomRightRadius: index === 3 ? '10px' : '0px',
                  backdropFilter:
                    data.title === ammoType ? 'blur(10px)' : 'none',
                }}
                onClick={() => setAmmoType(data.title)}
              >
                {data.title}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
