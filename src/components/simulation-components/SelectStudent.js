import { NavLink } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setStudent, setInstructor } from '../../redux/DataArray';
import DropDown from '../../utility/StudentDropdown';
import '../../renderer/App.css';
const { ipcRenderer } = require('electron');

export default function SelectStudent() {
  const [allStudents, setAllStudents] = useState([]);
  const [allInstructors, setAllInstructors] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedInstructor, setSelectedInstructor] = useState(null);

  const dispatch = useDispatch();

  const fetchInstructors = async () => {
    let data = await ipcRenderer.invoke('fetch-instructors');
    setAllInstructors(data);
  };

  const fetchStudents = async () => {
    let data = await ipcRenderer.invoke('fetch-students');
    setAllStudents(data);
  };

  useEffect(() => {
    fetchInstructors();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (allInstructors.length > 0 && allStudents.length > 0) {
      setSelectedInstructor(allInstructors[0]);
      setSelectedStudent(allStudents[0]);
      dispatch(setInstructor(allInstructors[0]));
      dispatch(setStudent(allStudents[0]));
    }
  }, [allInstructors, allStudents, dispatch]);

  const handleStudentSelect = (option) => {
    setSelectedStudent(option);
    dispatch(setStudent(option));
  };

  const handleInstructorSelect = (option) => {
    setSelectedInstructor(option);
    dispatch(setInstructor(option));
  };

  return (
    <div className="select_student_main_class">
      <div className="select_student_main_heading">
        SELECT STUDENT / INSTRUCTOR
      </div>
      {selectedInstructor && selectedStudent ? (
        <div className="select_student_dropdown_main_class">
          <div className="select_student_dropdown" style={{ zIndex: 2 }}>
            <span>SELECT STUDENT</span>
            <DropDown
              options={allStudents}
              selected={selectedStudent}
              onOptionSelect={handleStudentSelect}
            />
          </div>
          <div className="select_student_dropdown" style={{ zIndex: 1 }}>
            <span>SELECT INSTRUCTOR</span>
            <DropDown
              options={allInstructors}
              selected={selectedInstructor}
              onOptionSelect={handleInstructorSelect}
            />
          </div>
        </div>
      ) : (
        'Loading...'
      )}

      <div className="select_student_instructor_button_group_main_class">
        <div className="select_student_instructor_button_group">
          <NavLink
            className="select_student_instructor_button"
            to="/select_student_instructor"
          >
            ADD STUDENT
          </NavLink>
          <NavLink
            className="select_student_instructor_button"
            to="/select_student_instructor"
          >
            ADD INSTRUCTOR
          </NavLink>
        </div>
      </div>
    </div>
  );
}
