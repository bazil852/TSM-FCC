import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import '../../renderer/App.css';
import { ipcRenderer } from 'electron';
import { useSelector, useDispatch } from 'react-redux';
import { setReportData } from '../../redux/CarouselSelectedItemSlice';
import { resetDataArray } from '../../redux/DataArray';

export default function TopBar() {
  const dispatch = useDispatch();
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const reportData = useSelector((state) => state.selectedItem.reportData);
  console.log(reportData);
  const [recording, setRecording] = useState(false);
  const videoRef = useRef(null);
  const recordedChunksRef = useRef([]);
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
    FCCFailure: false, 
    JoystickFailure: false, 
    LaserFailure: false, 
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

  // Handlers for button clicks with delayed state updates
  const handleRespawn = () => {
    const updatedStatus = { ...spStatus, respawn: true };
    updateSpStatus(updatedStatus);

    // Set respawn to false after 2 seconds
    setTimeout(() => {
      const resetRespawnStatus = { ...spStatus, respawn: false };
      updateSpStatus(resetRespawnStatus);
    }, 2000);
  };

  const handleEndSimulation = () => {
    const updatedStatus = { ...spStatus, end: true };
    updateSpStatus(updatedStatus);

    console.log('Simulation ended. Saving report data...', reportData);

    // Sending the reportData to be saved in the database
    ipcRenderer.send('save-reports-data', reportData);

    ipcRenderer.on('save-reports-data-response', (event, response) => {
      if (response.success) {
        console.log('Report data saved successfully:', response.data);
      } else {
        console.error('Failed to save report data:', response.message);
      }
    });

    // Set start to false after 2 seconds
    setTimeout(() => {
      const resetStartStatus = {
        ...spStatus,
        start: false,
        pause: false,
        respawn: false,
        FCCFailure: false,
        JoystickFailure: false,
        LaserFailure: false,
        DoAllEnemeySmoke: false,
      };
      dispatch(resetDataArray())
      updateSpStatus(resetStartStatus);
    }, 2000);
  };

  const handlePauseSimulation = () => {
    const updatedStatus = { ...spStatus, pause: !spStatus.pause };
    updateSpStatus(updatedStatus);
  };

  const handleStart = () => {
    const updatedStatus = { ...spStatus, start: true };
    updateSpStatus(updatedStatus);
  };

  // Screen recording functions
  const startRecording = async () => {
    try {
      const inputSources = await ipcRenderer.invoke('getSources');
      const screenId = inputSources[2].id; // Choose the first screen source or let the user select one
      const IS_MACOS =
        (await ipcRenderer.invoke('getOperatingSystem')) === 'darwin';

      const audio = !IS_MACOS
        ? { mandatory: { chromeMediaSource: 'desktop' } }
        : false;

      const constraints = {
        audio,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: screenId,
          },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const newMediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm; codecs=vp9',
      });
      newMediaRecorder.ondataavailable = handleDataAvailable;
      newMediaRecorder.onstop = handleStop;
      newMediaRecorder.start();

      setMediaRecorder(newMediaRecorder);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      recordedChunksRef.current.push(event.data);
    }
  };

  const handleStop = async () => {
    try {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      const blob = new Blob(recordedChunksRef.current, {
        type: 'video/webm; codecs=vp9',
      });
      const buffer = Buffer.from(await blob.arrayBuffer());

      recordedChunksRef.current = [];

      const fileName = `rec-${Date.now()}.webm`;
      const { success, filePath } = await ipcRenderer.invoke(
        'saveRecording',
        fileName,
        buffer,
      );

      dispatch(
        setReportData({
          recordingFileName: fileName,
          PNoScore: '85',
          InstructorName: 'John Doe',
          terrain: 'Mountain',
          APC: 'APC123',
          Tanks: 'Tank456',
        }),
      );

      if (success) {
        console.log(`Video saved successfully at ${filePath}`);
      } else {
        console.error('Failed to save video.');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };
  // Handlers for turret sensitivity sliders
  const handleXTurretSensitivityChange = (event) => {
    const newXTurretSensitivity = parseFloat(event.target.value);
    const updatedStatus = {
      ...spStatus,
      XTurretSensitivity: newXTurretSensitivity,
    };
    updateSpStatus(updatedStatus);
  };

  const handleYTurretSensitivityChange = (event) => {
    const newYTurretSensitivity = parseFloat(event.target.value);
    const updatedStatus = {
      ...spStatus,
      YTurretSensitivity: newYTurretSensitivity,
    };
    updateSpStatus(updatedStatus);
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecording(false);
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

      <div className="slider-container">
        <label className="turret-label" htmlFor="x-turret-sensitivity">
          X Turret Sensitivity:{' '}
          <span className="turret-span">
            {' '}
            {spStatus.XTurretSensitivity.toFixed(1)}
          </span>
        </label>
        <input
          type="range"
          id="x-turret-sensitivity"
          min="0.1"
          max="2.0"
          step="0.1"
          value={spStatus.XTurretSensitivity}
          onChange={handleXTurretSensitivityChange}
        />
      </div>

      <div className="slider-container">
        <label className="turret-label" htmlFor="y-turret-sensitivity">
          Y Turret Sensitivity:{' '}
          <span className="turret-span">
            {spStatus.YTurretSensitivity.toFixed(1)}
          </span>
        </label>
        <input
          type="range"
          id="y-turret-sensitivity"
          min="0.1"
          max="2.0"
          step="0.1"
          value={spStatus.YTurretSensitivity}
          onChange={handleYTurretSensitivityChange}
        />
      </div>
      {!recording ? (
        <button className={'topBar_btn'} onClick={startRecording}>
          Start Recording
        </button>
      ) : (
        <button className="topBar_btn_true" onClick={stopRecording}>
          Stop Recording
        </button>
      )}
    </div>
  );
}
