import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../renderer/App.css';
import mainMenu from '../TSM-img/main_menu.svg';
import backButton from '../TSM-img/back_button.svg';
import Footer from '../utility/Footer';
const { ipcRenderer } = require('electron');

export default function SelectStudentAndInstructor() {
  const [toggle, setToggle] = useState(false);
  const [studentDetails, setStudentDetails] = useState({
    name: '',
    pno: '',
    rank: '',
    unit: '',
  });
  const [instructorDetails, setInstructorDetails] = useState({
    name: '',
    pno: '',
    rank: '',
    unit: '',
  });

  const navigate = useNavigate();

  const handleInputChange = (field, value, isStudent) => {
    if (isStudent) {
      setStudentDetails((prev) => ({ ...prev, [field]: value }));
    } else {
      setInstructorDetails((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = (details) => {
    return Object.values(details).every((value) => value.trim() !== '');
  };

  const addStudent = () => {
    if (validateForm(studentDetails)) {
      ipcRenderer.send('add-student', studentDetails);
    } else {
      alert('Please fill out all fields for the student.');
    }
  };

  const addInstructor = () => {
    if (validateForm(instructorDetails)) {
      ipcRenderer.send('add-instructor', instructorDetails);
    } else {
      alert('Please fill out all fields for the instructor.');
    }
  };

  useEffect(() => {
    ipcRenderer.on('add-student-response', (event, response) => {
      if (response.success) {
        alert('Student added successfully!');
        setStudentDetails({
          name: '',
          pno: '',
          rank: '',
          unit: '',
        });
        navigate(-1); // Go back to the previous page
      } else {
        alert('Failed to add student: ' + response.message);
      }
    });

    ipcRenderer.on('add-instructor-response', (event, response) => {
      if (response.success) {
        alert('Instructor added successfully!');
        setInstructorDetails({
          name: '',
          pno: '',
          rank: '',
          unit: '',
        });
        navigate(-1); // Go back to the previous page
      } else {
        alert('Failed to add instructor: ' + response.message);
      }
    });

    return () => {
      ipcRenderer.removeAllListeners('add-student-response');
      ipcRenderer.removeAllListeners('add-instructor-response');
    };
  }, [navigate]);

  const studentTabStyle = {
    opacity: !toggle ? 1 : 0,
    maxHeight: !toggle ? '120%' : '0',
    overflow: 'hidden',
    position: 'absolute',
    zIndex: '10',
    transition: 'all 0.3s ease-in-out',
  };

  const instructorTabStyle = {
    opacity: toggle ? 1 : 0,
    maxHeight: toggle ? '120%' : '0',
    overflow: 'hidden',
    position: "absolute",
    zIndex:"10",
    transition: 'all 0.3s ease-in-out',
  };

  return (
    <div
      className="select_student_instructor_main_class"
      style={{ backgroundImage: `url(${mainMenu})` }}
    >
      <NavLink className="navigation_button" to="/simulation">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> SIMULATION /
        </span>
        <span id="second_span_navigation_button">ADD USER</span>
      </NavLink>

      <NavLink to="/add_batch_user" className="add_batch_user_navigate">
        ADD BATCH USER
      </NavLink>

      <div className="select_student_instructor_main_content_container">
        <div className="select_student_instructor_main_content">
          <div className="select_student_instructor_tabs_button">
            <div
              className="select_student_instructor_tab_button"
              onClick={() => setToggle(false)}
              style={{
                background: !toggle && 'rgba(255, 255, 255, 0.2)',
                fontWeight: !toggle ? '700' : '500',
                transition: 'background 0.2s ease-in-out',
              }}
            >
              STUDENT
            </div>
            <div
              className="select_student_instructor_tab_button"
              onClick={() => setToggle(true)}
              style={{
                background: toggle && 'rgba(255, 255, 255, 0.2)',
                fontWeight: toggle ? '700' : '500',
                transition: 'background 0.2s ease-in-out',
              }}
            >
              INSTRUCTOR
            </div>
          </div>

          <div
            style={{ display: 'flex', justifyContent: 'center' }}
            className="tabs_container"
          >
            <div
              className="select_student_instructor__tab_content"
              style={studentTabStyle}
            >
              {Object.keys(studentDetails).map((key) => (
                <div
                  key={key}
                  className="select_student_instructot_tab_input_container"
                >
                  <span>{key.toUpperCase()}</span>
                  <input
                    value={studentDetails[key]}
                    onChange={(e) =>
                      handleInputChange(key, e.target.value, true)
                    }
                  />
                </div>
              ))}
              <button
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '25px',
                  fontWeight: 'bold',
                  padding: '15px',
                  zIndex: '10',
                }}
                onClick={addStudent}
              >
                Add Student
              </button>
            </div>

            <div
              className="select_student_instructor__tab_content"
              style={instructorTabStyle}
            >
              {Object.keys(instructorDetails).map((key) => (
                <div
                  key={key}
                  className="select_student_instructot_tab_input_container"
                >
                  <span>{key.toUpperCase()}</span>
                  <input
                    value={instructorDetails[key]}
                    onChange={(e) =>
                      handleInputChange(key, e.target.value, false)
                    }
                  />
                </div>
              ))}
              <button
                style={{
                  cursor: 'pointer',
                  borderRadius: '8px',
                  fontSize: '25px',
                  fontWeight: 'bold',
                  padding: '15px',
                  zIndex: '10',
                }}
                onClick={addInstructor}
              >
                Add Instructor
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
