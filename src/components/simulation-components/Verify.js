import data from '../../data.json';
import '../../renderer/App.css';
import map1 from '../../TSM-img/map_1.svg';
import map2 from '../../TSM-img/map_2.svg';
import map3 from '../../TSM-img/map_3.svg';
import { useSelector } from 'react-redux';

export default function Verify() {
  const verifyPageArray = data.verifyPageArray;
  const dataArrayState = useSelector((state) => state.dataArray);
  console.log(dataArrayState)
  return (
    <div className="verify_main_class">
      {verifyPageArray.map((data, index) => {
        return (
          <div className="verify_main_content_container" key={index}>
            <div className="verify_main_heading">Verify Simulation</div>
            <div className="verify_text_below_main_heading">
              Please Verify the below information to be used?
            </div>
            <div className="verify_simulation_instructor_student_container">
              <div className="verify_simulation_instructor_student_heading">
                Instructor
              </div>
              <div className="verify_simulation_instructor_student_name">
                {dataArrayState.ExerciseInfo.instructor.name}
              </div>
            </div>
            <div
              style={{ width: '120px' }}
              className="verify_simulation_instructor_student_container"
            >
              <div className="verify_simulation_instructor_student_heading">
                Student
              </div>
              <div
                style={{ width: '120px' }}
                className="verify_simulation_instructor_student_name"
              >
                {dataArrayState.ExerciseInfo.student.name}
              </div>
            </div>
            <div className="verify_simulation_instructor_student_container">
              <div
                style={{ width: '120px' }}
                className="verify_simulation_instructor_student_heading"
              >
                Map Name
              </div>
              <div className="verify_simulation_instructor_student_name">
                {dataArrayState.ExerciseInfo.mapName}
              </div>
            </div>
            <div className="verify_parameters_container">
              <div className="verify_paramters_heading">Parameters</div>
              <div className="verify_paramters_specification">
                <div className="verify_paramters_map_name_and_image">
                  <div>MAP</div>
                  <img
                    src={
                      data.mapName === 'MUDDY FOREST'
                        ? map1
                        : data.mapName === 'SNOWY CAPS'
                        ? map2
                        : map3
                    }
                    alt="map"
                    className="map_image_map_detail_modal"
                  />
                </div>
                <div className="map_details_main_container">
                  <div>SPECIFICATIONS</div>
                  <div className="map_detail_modal_specs">
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">Diffcult</div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.ExerciseInfo.difficulty}
                      </div>
                    </div>
                    {/* <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Exercise Time
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.ExerciseInfo.exerciseTime}
                      </div>
                    </div> */}
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">Teerain</div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.ExerciseInfo.terrain}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Enemy Tanks
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.ExerciseInfo.totalEnemyTanks}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Enemy APCS
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.ExerciseInfo.totalEnemyAPCs}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">Own Tanks</div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.totalOwnTanks}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Temperature
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.WeatherConditions.temperature}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Wind Speed
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.WeatherConditions.WindSpeed}
                      </div>
                    </div>
                    {/* <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Wind Direction
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.WeatherConditions.WindDirection}
                      </div>
                    </div>
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">Visibilty</div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.WeatherConditions.Visibilty}
                      </div>
                    </div> */}
                    <div className="specification_detail" key={index}>
                      <div className="sepcification_detail_name">
                        Weather Condition
                      </div>
                      <div className="sepcification_detail_value">
                        {dataArrayState.WeatherConditions.WeatherCondition}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="verify_note">
                <div className="note_heading">NOTE</div>
                <div className="note_content">
                  Some of the parameters cannot be changed during the
                  simulation!
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
