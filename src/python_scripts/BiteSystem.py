import time
import json
import os
import pyaudio
import serial

os.environ['PYGAME_HIDE_SUPPORT_PROMPT'] = "hide"
import pygame

# Joystick check
def check_joystick():
    pygame.init()
    pygame.joystick.init()
    joystick_connected = False
    button_states = {}
    if pygame.joystick.get_count() > 0:
        joystick_connected = True
        joystick = pygame.joystick.Joystick(0)
        joystick.init()
        num_buttons = joystick.get_numbuttons()
        for i in range(num_buttons):
            button_states[i] = joystick.get_button(i)
    return joystick_connected, button_states

# JSON file check
def check_json_file(file_path):
    if not os.path.exists(file_path):
        return False, "JSON file not found"
    try:
        with open(file_path, 'r') as file:
            data = json.load(file)
        return True, "JSON file is valid"
    except json.JSONDecodeError:
        return False, "Invalid JSON format"

# Headphones check
def check_headphones():
    p = pyaudio.PyAudio()
    headphone_count = 0
    for i in range(p.get_device_count()):
        dev_info = p.get_device_info_by_index(i)
        # Check if the device name contains 'Headphone' or 'INZONE'
        
        if  'INZONE' in dev_info['name'] and 'Speakers' in dev_info['name']:
            print (dev_info['name'])
            headphone_count += 1
    p.terminate()
    return headphone_count >= 7


# File existence check
def check_files_exist(file_paths):
    all_exist = True
    missing_files = []
    for file_path in file_paths:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
            all_exist = False
    return all_exist, missing_files


# ESP connection check
def check_esp_connection(port, baudrate):
    try:
        ser = serial.Serial(port, baudrate, timeout=1)
        if ser.is_open:
            ser.close()
            return True
    except serial.SerialException as e:
        return False
    return False

# Main diagnostic function
def run_diagnostics():
    diagnostics = []

    # Check joystick
    joystick_connected, button_states = check_joystick()
    diagnostics.append({
        "name": "Joystick",
        "status": "Operational" if joystick_connected else "Down",
        "details": "All buttons are responsive" if joystick_connected else "Joystick not detected"
    })

    # JSON file checks
    json_file_paths = [
        "C://Users//ESFORGE-03//Desktop//TSM_II_Product//Content//JSON_Files//data_output.json",
        "C://Users//ESFORGE-03//Desktop//TSM_II_Product//Content//JSON_Files//PlayerData.json",
        "C://Users//ESFORGE-03//Desktop//TSM_II_Product//Content//JSON_Files//EnemyData.json",
        "C://Users//ESFORGE-03//Desktop//TSM_II_Product//Content//JSON_Files//tsm.json",
        "C://Users//ESFORGE-03//Desktop//TSM_II_Product//Content//JSON_Files//sp.json"
    ]
    
    json_files_exist, missing_json_files = check_files_exist(json_file_paths)
    diagnostics.append({
        "name": "JSON Files Check",
        "status": "Operational" if json_files_exist else "Down",
        "details": "All JSON files are present" if json_files_exist else f"Missing JSON files: {', '.join(missing_json_files)}"
    })

    # Check other file paths
    other_file_paths = [
        "C://Users//ESFORGE-03//Desktop//TSM-FCC//TSM-REC"
    ]

    files_exist, missing_files = check_files_exist(other_file_paths)
    diagnostics.append({
        "name": "Required File Check",
        "status": "Operational" if files_exist else "Down",
        "details": "All required files are present" if files_exist else f"Missing files: {', '.join(missing_files)}"
    })

    # Check headphones
    headphones_connected = check_headphones()
    diagnostics.append({
        "name": "Headphones",
        "status": "Operational" if headphones_connected else "Not Connected",
        "details": "Both headphones are connected" if headphones_connected else "Headphones not properly connected"
    })

    # Check ESP connection
    esp_port = "/dev/ttyUSB0"  # Adjust according to your system
    baudrate = 9600
    esp_connected = check_esp_connection(esp_port, baudrate)
    diagnostics.append({
        "name": "ESP Connection",
        "status": "Operational" if esp_connected else "Down",
        "details": "ESP connected successfully" if esp_connected else "Error connecting to ESP"
    })

    return diagnostics
if __name__ == "__main__":
    # diagnostics = run_diagnostics()
    # print(json.dumps(diagnostics, indent=4))
    print (check_joystick())