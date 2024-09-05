import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../renderer/App.css';
import mainMenu from '../TSM-img/main_menu.svg';
import backButton from '../TSM-img/back_button.svg';
import Footer from '../utility/Footer';
import { ipcRenderer } from 'electron';
import data from '../data.json';

export default function TestMode() {
  const [diagnosticsArray, setDiagnosticsArray] = useState([]); // Consolidated array for all diagnostics data
  const [loading, setLoading] = useState(false); // Loading state for diagnostics

  const handleRunDiagnostics = async () => {
    setLoading(true); // Set loading to true while diagnostics are running
    try {
      // Call the exposed IPC method directly using ipcRenderer
      const result = await ipcRenderer.invoke('run-python-diagnostics');
      setDiagnosticsArray(result); // Set the diagnostics data from Python
    } catch (error) {
      console.error('Error running diagnostics:', error);
      setDiagnosticsArray(data.softwareArray.concat(data.hardwareArray)); // Fallback to local data if error occurs
    } finally {
      setLoading(false); // Set loading to false after diagnostics complete
    }
  };

  useEffect(() => {
    handleRunDiagnostics(); // Run diagnostics on component mount
  }, []);

  return (
    <div
      className="test_mode_main_class"
      style={{ backgroundImage: `url(${mainMenu})` }}
    >
      <NavLink className="navigation_button_with_bigger_width_3" to="/">
        <span id="first_span_navigation_button">
          <img src={backButton} alt="back" /> MAIN MENU /
        </span>
        <span id="second_span_navigation_button">
          TEST MODE AND DIAGNOSTICS
        </span>
      </NavLink>
      <div className="test_mode_main_content_container">
        <div className="test_mode_tab_table">
          <div className="test_mode_tab_table_heading_container">
            <div className="test_mode_tab_table_name_heading">NAME</div>
            <div className="test_mode_tab_table_name_heading">STATUS</div>
          </div>

          {diagnosticsArray.map((data, index) => {
            return (
              <div className="test_mode_tab_table_data_container" key={index}>
                <div className="test_mode_tab_table_data">{data.name}</div>
                <div
                  className="test_mode_tab_table_data"
                  style={{
                    color:
                      data.status.toLowerCase() === 'operational'
                        ? '#1AD336'
                        : data.status.toLowerCase() === 'down'
                        ? '#BF1413'
                        : '#FAFF1B',
                  }}
                >
                  {data.status.toUpperCase()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="refresh_button_container">
          <button
            className="refresh_button"
            onClick={handleRunDiagnostics}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
