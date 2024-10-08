import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../renderer/App.css';
import backButton from '../TSM-img/back_button.svg';
import reset from '../TSM-img/reset.svg';
import Footer from '../utility/Footer';
import data from '../data.json';
import { ipcRenderer } from 'electron';
import mainMenu from '../TSM-img/main_menu.svg';
import Modal from '../utility/Modal';

export default function PastSimulation() {
  const [active, setActive] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [reports, setReports] = useState();
  const [videoBlob, setVideoBlob] = useState(null); // State to store the accumulated video Blob
  const [videoUrl, setVideoUrl] = useState(null);

  useEffect(() => {
    // Fetch reports data on mount
    fetchReports();
  }, []);

  useEffect(() => {
    // Listen for video chunks from Electron
    const handleVideoChunk = (event, chunk) => {
      if (chunk) {
        console.log(
          '[DEBUG] Received video chunk from Electron:',
          chunk.length,
        );

        // Convert base64 chunk to binary and append to the video blob
        const byteCharacters = atob(chunk);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        const newBlob = new Blob([byteArray], { type: 'video/webm' });

        // Accumulate the blobs
        setVideoBlob((prevBlob) =>
          prevBlob
            ? new Blob([prevBlob, newBlob], { type: 'video/webm' })
            : newBlob,
        );
      }
    };

    ipcRenderer.on('video-chunk', handleVideoChunk);

    // Listen for the end of the stream to create the URL
    ipcRenderer.on('video-end', () => {
      if (videoBlob) {
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
      }
    });

    return () => {
      ipcRenderer.removeListener('video-chunk', handleVideoChunk); // Clean up the listener
      ipcRenderer.removeListener('video-end', handleVideoChunk); // Clean up the end listener
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl); // Clean up URL on unmount
      }
    };
  }, [videoBlob, videoUrl]);
  const fetchReports = async () => {
    try {
      const data = await ipcRenderer.invoke('fetch-reports-data');
      console.log(data);
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchVideo = async (filePath) => {
    try {
      // Reset videoBlob and videoUrl before fetching a new video
      setVideoBlob(null);
      setVideoUrl(null);

      // Start fetching video data in chunks
      await ipcRenderer.invoke('fetch-video-data', filePath);
    } catch (error) {
      console.error('Error fetching video:', error);
    }
  };

  const handleViewClick = (filePath) => {
    fetchVideo(filePath); // Pass the file path to fetchVideo
    setModalIsOpen(true);
  };

  const trainingArray = data.trainingArray;
  const recentArray = data.recentArray;

  const trainingStyle = {
    opacity: !active ? 1 : 0,
    height: active && '0px',
    overflow: 'hidden',
    transition: 'opacity 0.4s ease-in-out',
  };

  const recentStyle = {
    opacity: active ? 1 : 0,
    height: !active && '0px',
    overflow: 'hidden',
    transition: 'opacity 0.4s ease-in-out',
  };
  console.log(reports);

  return (
    <div
      className="past_simulation_main_class"
      style={{ backgroundImage: `url(${mainMenu})` }}
    >
      <Modal
        isOpen={modalIsOpen}
        closeModal={() => {
          setModalIsOpen(false);
          setSelectedVideo(null);
          if (videoUrl) {
            URL.revokeObjectURL(videoUrl); // Clean up the Blob URL
            setVideoUrl(null); // Reset the video URL to free up memory
          }
        }}
      >
        {videoUrl ? (
          <video className="iFrame_video_player" controls>
            <source src={videoUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Loading video...</p>
        )}
      </Modal>

      <NavLink className="navigation_button_with_bigger_width_2" to="/">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> MAIN MENU /
        </span>
        <span id="second_span_navigation_button">SIMULATION HISTORY</span>
      </NavLink>

      <div className="past_simulation_main_content_container">
        <div className="past_simulation_tab_heading_filter_box">
          <div className="past_simulation_tab_heading_box">
            <div
              onClick={() => setActive(false)}
              style={{
                cursor: 'pointer',
                color: !active ? 'white' : '#9fa4a9',
                fontWeight: !active ? 700 : 600,
                fontSize: !active ? '1.5rem' : '1.4rem',
                transition: 'all 0.1s ease',
              }}
            >
              TRAINING
            </div>
            <div
              onClick={() => setActive(true)}
              style={{
                cursor: 'pointer',
                color: active ? 'white' : '#9fa4a9',
                fontWeight: active ? 700 : 600,
                fontSize: active ? '1.5rem' : '1.4rem',
                transition: 'all 0.1s ease',
              }}
            >
              RECENT
            </div>
          </div>
          <div className="past_simulation_tab_filter_box">
            <div className="past_simulation_tab_filter">FILTER : </div>
            <img src={reset} alt="reset" style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div className="past_simulation_tab_table">
          <div className="past_simulation_tab_table_heading_container">
            <div className="past_simulation_tab_table_name_heading">NAME</div>
            <div className="past_simulation_tab_table_heading">P. NO</div>
            <div className="past_simulation_tab_table_heading">SCORE</div>
            <div className="past_simulation_tab_table_heading">Recording</div>
          </div>

          <div style={trainingStyle}>
            {reports &&
              reports.map((data, index) => (
                <div
                  className="past_simulation_tab_table_data_container"
                  key={index}
                >
                  <div className="past_simulation_tab_table_name_data">
                    <div id="past_simulation_tab_table_name_data_first_phrase">
                      {data.data.InstructorName} - {data.data.APC}
                    </div>
                    <div id="past_simulation_tab_table_name_data_second_phrase">
                      {data.data.Tank.map((tanks, index) =>
                        index == data.data.Tank.length - 1 ? (
                          <>
                            <span key={index}>{tanks}</span>
                          </>
                        ) : (
                          <>
                            <span key={index}>{tanks}</span> -
                          </>
                        ),
                      )}
                    </div>
                  </div>
                  <div
                    className="past_simulation_tab_table_data"
                    style={{ color: '#ffffff' }}
                  >
                    {data.data.PNoScore}
                  </div>
                  <div className="past_simulation_tab_table_data">{'70'}</div>
                  <div
                    onClick={() =>
                      handleViewClick(
                        `${process.env.REC_PATH}/${data.data.recordingFileName}`,
                      )
                    }
                    className="past_simulation_tab_table_data_recording"
                  >
                    View
                  </div>
                </div>
              ))}
          </div>

          <div style={recentStyle}>
            {recentArray.map((data, index) => {
              const enemyVehiclesArray = Object.entries(
                data.enemyVehicle || {},
              );
              return (
                <div
                  className="past_simulation_tab_table_data_container"
                  key={index}
                >
                  <div className="past_simulation_tab_table_name_data">
                    <div id="past_simulation_tab_table_name_data_first_phrase">
                      {data.trainerName} - {data.terrain}
                    </div>
                    <div id="past_simulation_tab_table_name_data_second_phrase">
                      {data.terrain} -
                      {enemyVehiclesArray.map(([vehicleType, count], index) => (
                        <span key={index}>
                          {vehicleType.toUpperCase()} {count}
                          {index < enemyVehiclesArray.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="past_simulation_tab_table_data"
                    style={{ color: '#ffffff' }}
                  >
                    {data.PNO}
                  </div>
                  <div className="past_simulation_tab_table_data">
                    {data.score}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
