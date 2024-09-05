import { useState , useEffect } from 'react';
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
  const [reports, setReports] = useState()
  const [videoUrl, setVideoUrl] = useState('');
  const fetchResorts = async () => {
    let data = await ipcRenderer.invoke('fetch-reports-data');
    console.log(data);
    setReports(data);
  };

  const fetchVideo = async (filePath) => {
    const videoData = await ipcRenderer.invoke('fetch-video-data', filePath);
    if (videoData) {
      const blob = new Blob([Uint8Array.from(atob(videoData), c => c.charCodeAt(0))], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    }
  };

  const handleViewClick = (filePath) => {
    fetchVideo(filePath);
    setModalIsOpen(true);
  };

  useEffect(() => {
    fetchResorts();
  }, []);
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
          URL.revokeObjectURL(videoUrl); // Clean up the Blob URL
        }}
      >
        {videoUrl && (
          <video className="iFrame_video_player" controls>
            <source src={videoUrl} type="video/webm" />
            Your browser does not support the video tag.
          </video>
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
              reports.map((data, index) => {
                return (
                  <div
                    className="past_simulation_tab_table_data_container"
                    key={index}
                  >
                    <div className="past_simulation_tab_table_name_data">
                      <div id="past_simulation_tab_table_name_data_first_phrase">
                        {data.data.InstructorName} - {data.data.terrain}
                      </div>
                      <div id="past_simulation_tab_table_name_data_second_phrase">
                        {data.data.terrain} -
                        <span key={index}>
                          {data.data.APC} {data.data.Tanks}
                        </span>
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
                        `${process.env.REC_PATH}/${data.data.recordingFileName}`
                      )
                    }
                    className="past_simulation_tab_table_data_recording"
                  >
                    View
                  </div>
                  </div>
                );
              })}
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
                      {enemyVehiclesArray.map(([vehicleType, count], index) => {
                        return (
                          <span key={index}>
                            {vehicleType.toUpperCase()} {count}
                            {index < enemyVehiclesArray.length - 1 ? ', ' : ''}
                          </span>
                        );
                      })}
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
