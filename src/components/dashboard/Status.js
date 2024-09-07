import React, { useState, useEffect } from 'react';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';
import { useDispatch, useSelector } from 'react-redux'; // Import hooks for Redux
import {
  setElapsedTime,
  setTimeLeft,
  setTotalTime,
} from '../../../src/redux/CarouselSelectedItemSlice'; // Import your actions

export default function Status() {
  const dispatch = useDispatch();

  const { elapsedTime, timeLeft, totalTime } = useSelector(
    (state) => state.selectedItem.reportData,
  );

  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState({});
  const [simulationStatusNew, setSimulationStatus] = useState({});
  const [spData, setSpData] = useState({});
  const [localElapsedTime, setLocalElapsedTime] = useState(0); // Local elapsed time state

  // Function to fetch data from the JSON files
  const fetchData = async () => {
    try {
      const playerData = await ipcRenderer.invoke(
        'read-json',
        process.env.PLAYER_DATA_PATH,
      );

      const spDataFetched = await ipcRenderer.invoke(
        'read-json',
        process.env.SP_DATA_PATH,
      );
      setPlayerData(playerData);
      setSpData(spDataFetched);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 5000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchSimulation = async () => {
    const simulationData = await ipcRenderer.invoke(
      'read-json',
      process.env.SIMULATION_DATA_PATH,
    );
    setSimulationStatus(simulationData);
  };

  useEffect(() => {
    if (simulationStatusNew) {
      fetchSimulation();
    }
  }, []);

  // Start the timer based on exerciseTime from the simulation data
  useEffect(() => {
    if (!loading && simulationStatusNew?.ExerciseInfo?.exerciseTime) {
      const totalTimeValue = simulationStatusNew.ExerciseInfo.exerciseTime * 60; // Convert total time to seconds
      dispatch(setTotalTime(totalTimeValue)); // Update Redux with total time
      setLocalElapsedTime(0); // Reset local elapsed time to 0

      const intervalId = setInterval(() => {
        setLocalElapsedTime((prevElapsedTime) => {
          const newElapsedTime = prevElapsedTime + 1;
          const newTimeLeft = totalTimeValue - newElapsedTime;

          // Dispatch plain number values to Redux
          dispatch(setElapsedTime(newElapsedTime));
          dispatch(setTimeLeft(newTimeLeft));

          if (newElapsedTime >= totalTimeValue) {
            clearInterval(intervalId); // Stop the timer when time is up
          }

          return newElapsedTime;
        });
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [loading, simulationStatusNew, dispatch]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div className="status_main_class">
      {simulationStatusNew && (
        <>
          <div className="status_main_heading">STATUS</div>
          {!loading && simulationStatusNew && playerData && (
            <>
              <div className="status_box">
                <div className="status_title">STUDENT STATUS</div>

                <div className="status_item">
                  <strong>Moving Target Hits:</strong>
                  <p>
                    {
                      playerData?.Player['player Target States']
                        ?.movingTargetsHits
                    }
                  </p>
                </div>
                <div className="status_item">
                  <strong>Static Target Hits:</strong>
                  <p>
                    {
                      playerData?.Player['player Target States']
                        ?.staticTargetHits
                    }
                  </p>
                </div>
                <div className="status_item">
                  <strong>Total Cannon Hits:</strong>
                  <p>
                    {
                      playerData?.Player['player Target States']
                        ?.totalCannonHits
                    }
                  </p>
                </div>
                <div className="status_item">
                  <strong>Total Cannon Missed:</strong>
                  <p>
                    {
                      playerData?.Player['player Target States']
                        ?.totalCannonMissed
                    }
                  </p>
                </div>
              </div>
              <div className="status_box">
                <div className="status_title">AMMO STATUS</div>
                <div className="status_item">
                  <strong>HEAT:</strong>
                  <p>{playerData?.Player.ammo.heat}</p>
                </div>
                <div className="status_item">
                  <strong>APFSFDS:</strong>
                  <p>{playerData?.Player.ammo.aPFSFDS}</p>
                </div>
                <div className="status_item">
                  <strong>HE:</strong>
                  <p>{playerData?.Player.ammo.hE}</p>
                </div>
                <div className="status_item">
                  <strong>MG:</strong>
                  <p>{playerData?.Player.ammo.mG}</p>
                </div>
              </div>
              <div className="status_box">
                <div className="status_title">SIMULATION STATUS</div>
                <div className="status_item">
                  <strong>Elapsed Time:</strong>
                  <p>{formatTime(elapsedTime)}</p> {/* Read from Redux */}
                </div>
                <div className="status_item">
                  <strong>Time Left:</strong>
                  <p>{formatTime(timeLeft)}</p> {/* Read from Redux */}
                </div>
                <div className="status_item">
                  <strong>Total Time:</strong>
                  <p>{formatTime(totalTime)}</p> {/* Read from Redux */}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
