import serial
import json
import time

# Setup serial connection
ser = serial.Serial('COM14', 115200, timeout=1)  # Adjust the COM port and baud rate as needed

# Define the keys for the JSON dictionary that correspond to your data structure
keys = [
    "M1_PDR", "M1_AIR", "M1_WIND", "M1_MVC", "M1_INCLNS", "M2_SWITCHES",
    "M2_MRA_Analog", "M2_Status_LEDs", "M3_APFSDS_AZ", "M3_APFSDS_EL",
    "M3_HESH_AZ", "M3_HESH_EL", "M3_HEAT_AZ", "M3_HEAT_EL", "M3_DAY", "M3_NIGHT"
]

# Function to unpack a byte into bits and return a dictionary of states
def byte_to_bits(byte_val, prefix):
    bit_dict = {f"{prefix}_Bit{bit}": bool(byte_val & (1 << bit)) for bit in range(8)}
    # print(f"Debug - {prefix}: {bit_dict}")  # Debug statement to check conversion
    return bit_dict
current_data = {}
def read_and_decode():
    while True:
        # Read a line from UART
        line = ser.readline().decode().strip()
        if line.startswith('#'):
            # Remove the leading '#' and parse the values
            values = line[1:].split(',')
            if len(values) == 16:
                # Convert all strings in the list to integers
                int_values = list(map(int, values))
                # Create a dictionary by zipping keys with the corresponding values
                data_dict = dict(zip(keys, int_values))

            # Update current_data dictionary with new values
            for key, value in data_dict.items():
                # Expand each byte into separate bits if needed
                if isinstance(value, int) and value <= 255:  # Adjust condition based on your data structure
                    current_data.update(byte_to_bits(value, key))

                # Save the dictionary to a JSON file
                with open('data_output.json', 'w') as json_file:
                    json.dump(current_data, json_file, indent=4)
                    
                # Print the dictionary to console for debugging
                print(data_dict)

try:
    read_and_decode()
except KeyboardInterrupt:
    print("Stopped by User")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    ser.close()
