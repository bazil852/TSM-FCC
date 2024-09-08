import { NavLink } from 'react-router-dom';
import '../renderer/App.css';
import mainMenu from '../TSM-img/main_menu.svg';
import backButton from '../TSM-img/back_button.svg';
import Footer from '../utility/Footer';
import ReportGraph from '../utility/ReportGraph';
import { ipcRenderer } from 'electron';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

export default function Report() {
  const reportInfo = useSelector((state) => state.selectedItem); // Fetch reportInfo from Redux
  const [simulationData, setSimulationData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [enemyData, setEnemyData] = useState(null);

  // Fetch simulation, player, and enemy data from local files
  const fetchSimulation = async () => {
    const simData = await ipcRenderer.invoke('read-json', process.env.SIMULATION_DATA_PATH);
    const playerData = await ipcRenderer.invoke('read-json', process.env.PLAYER_DATA_PATH);
    const enemyData = await ipcRenderer.invoke('read-json', process.env.ENEMY_DATA_PATH);

    setSimulationData(simData);
    setPlayerData(playerData);
    setEnemyData(enemyData);
  };

  useEffect(() => {
    if (!simulationData || !playerData || !enemyData) {
      fetchSimulation();
    }
  }, []);

  if (!simulationData || !playerData || !enemyData || !reportInfo) return <div>Loading...</div>;

  return (
    <div className="report_main_class" style={{ backgroundImage: `url(${mainMenu})` }}>
      <NavLink className="navigation_button" to="/simulation">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> SIMULATION /
        </span>
        <span id="second_span_navigation_button">REPORT</span>
      </NavLink>

      <div className="report_main_container">
        <div className="report_content">
          <div className="report_content_main_heading">Examination Report</div>

          {/* Simulation Data */}
          <div className="report_conetnt_input_fields_container">
            <div className="report_content_input_field_box_1">
              <div className="report_conent_input_field_box_1_input_box">
                <div className="report_conent_input_field_box_1_input_box_title">
                  GUNNER NAME :
                </div>
                <div className="report_conent_input_field_box_1_input_box_value">
                  {simulationData.ExerciseInfo.student.name}
                </div>
              </div>

              <div className="report_conent_input_field_box_1_input_box">
                <div className="report_conent_input_field_box_1_input_box_title">
                  ARMY NO. :
                </div>
                <div className="report_conent_input_field_box_1_input_box_value">
                  {simulationData.ExerciseInfo.student.pno}
                </div>
              </div>

              <div className="report_conent_input_field_box_1_input_box">
                <div className="report_conent_input_field_box_1_input_box_title">
                  UNIT :
                </div>
                <div className="report_conent_input_field_box_1_input_box_value">
                  {simulationData.ExerciseInfo.student.unit}
                </div>
              </div>

              <div className="report_conent_input_field_box_1_input_box">
                <div className="report_conent_input_field_box_1_input_box_title">
                  EXERCISE TIME :
                </div>
                <div className="report_conent_input_field_box_1_input_box_value">
                  {simulationData.ExerciseInfo.exerciseTime || 'N/A'}
                </div>
              </div>

              <div className="report_conent_input_field_box_1_input_box">
                <div className="report_conent_input_field_box_1_input_box_title">
                  TERRAIN :
                </div>
                <div className="report_conent_input_field_box_1_input_box_value">
                  {simulationData.ExerciseInfo.terrain || 'N/A'}
                </div>
              </div>
            </div>

            {/* Report Data from reportInfo */}
            <div className="report_content_input_field_box_2">
              <div className="report_conent_input_field_box_2_input_box">
                <div className="report_conent_input_field_box_2_input_box_title">SCORE :</div>
                <div className="report_conent_input_field_box_2_input_box_value">
                  {reportInfo.reportData.score}
                </div>
              </div>

              <div className="report_conent_input_field_box_2_input_box">
                <div className="report_conent_input_field_box_2_input_box_title">TIME LEFT :</div>
                <div className="report_conent_input_field_box_2_input_box_value">
                  {reportInfo.reportData.timeLeft}
                </div>
              </div>

              <div className="report_conent_input_field_box_2_input_box">
                <div className="report_conent_input_field_box_2_input_box_title">TOTAL TIME :</div>
                <div className="report_conent_input_field_box_2_input_box_value">
                  {reportInfo.reportData.totalTime}
                </div>
              </div>

              <div className="report_conent_input_field_box_2_input_box">
                <div className="report_conent_input_field_box_2_input_box_title">TANKS:</div>
                <div className="report_conent_input_field_box_2_input_box_value">
                  {reportInfo.reportData.Tank.join(', ')}
                </div>
              </div>
            </div>
          </div>

          {/* Player Data */}
          <div className="report_content_input_field_box_3">
            <div className="report_conent_input_field_box_3_input_box">
              <div className="report_conent_input_field_box_3_input_box_title">CURRENT LOCATION :</div>
              <div className="report_conent_input_field_box_3_input_box_value">
                {`X: ${playerData.currentLocation.x}, Y: ${playerData.currentLocation.y}, Z: ${playerData.currentLocation.z}`}
              </div>
            </div>

            <div className="report_conent_input_field_box_3_input_box">
              <div className="report_conent_input_field_box_3_input_box_title">AMMO HEAT :</div>
              <div className="report_conent_input_field_box_3_input_box_value">{playerData.ammo.heat}</div>
            </div>

            <div className="report_conent_input_field_box_3_input_box">
              <div className="report_conent_input_field_box_3_input_box_title">AMMO APFSFDS :</div>
              <div className="report_conent_input_field_box_3_input_box_value">{playerData.ammo.aPFSFDS}</div>
            </div>
          </div>

          {/* Enemy Data */}
          <div className="report_content_input_field_box_4">
            <div className="report_conent_input_field_box_4_main_heading">Enemy Information</div>
            {enemyData.Enemy.map((enemy, index) => (
              <div key={index} className="report_conent_input_field_box_4_main_content_container_box_1">
                <div className="report_content_input_field_box_4_main_content_container_box_1_value_box">
                  <div className="report_conent_input_field_box_4_main_content_container_box_1_value_box_value">
                    Enemy Type: {enemy?.enemyType}
                  </div>
                  <div className="report_conent_input_field_box_4_main_content_container_box_1_value_box_value">
                    Location: X: {enemy?.location?.x}, Y: {enemy?.location?.y}, Z: {enemy?.location?.z}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="report_print_btn">PRINT</div>

      <Footer />
    </div>
  );
}
