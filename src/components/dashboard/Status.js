import React, { useState, useEffect } from 'react';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';

export default function Status() {
  const [loading, setLoading] = useState(true);
  const [playerData, setPlayerData] = useState({});
  const [simulationStatusNew, setSimulationStatus] = useState({});
  const [spData, setSpData] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0); // Time in seconds
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds

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
      const totalTime = simulationStatusNew.ExerciseInfo.exerciseTime * 60; // Convert total time to seconds
      setTimeLeft(totalTime);

      const intervalId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => {
          const newElapsedTime = prevElapsedTime + 1;
          setTimeLeft(totalTime - newElapsedTime); // Calculate time left

          if (newElapsedTime >= totalTime) {
            clearInterval(intervalId); // Stop the timer when time is up
          }

          return newElapsedTime;
        });
      }, 1000);

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [loading, simulationStatusNew]);

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
          {simulationStatusNew?.ExerciseInfo?.terrain === 'boreDay' ||
          simulationStatusNew?.ExerciseInfo?.terrain === 'boreNight' ? (
            <div className="steps-parent-btn">
              <button
                className={spData.step === 1 ? 'topBar_btn_true' : 'topBar_btn'}
                onClick={() => handleStep(1)}
              >
                STEP 1
              </button>
              <button
                style={{ marginBlock: '20px' }}
                className={spData.step === 2 ? 'topBar_btn_true' : 'topBar_btn'}
                onClick={() => handleStep(2)}
              >
                STEP 2
              </button>
              <button
                className={spData.step === 3 ? 'topBar_btn_true' : 'topBar_btn'}
                onClick={() => handleStep(3)}
              >
                STEP 3
              </button>
            </div>
          ) : (
            !loading &&
            simulationStatusNew &&
            playerData && (
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
                    <p>{formatTime(elapsedTime)}</p>
                  </div>
                  <div className="status_item">
                    <strong>Time Left:</strong>
                    <p>{formatTime(timeLeft)}</p>
                  </div>
                  <div className="status_item">
                    <strong>Total Time:</strong>
                    <p>
                      {formatTime(
                        simulationStatusNew?.ExerciseInfo?.exerciseTime * 60,
                      )}
                    </p>
                  </div>
                </div>
              </>
            )
          )}
        </>
      )}
    </div>
  );
}
