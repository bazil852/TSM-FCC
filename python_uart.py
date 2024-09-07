import serial
import json
import time
import struct
from collections import defaultdict

# Setup serial connection
ser = serial.Serial('COM4', 115200, timeout=50)  # Adjust the COM port and baud rate as needed

# Define the keys for the JSON dictionary that correspond to your data structure
keys = [
    "M1_PDR", "M1_AIR", "M1_WIND", "M1_MVC", "M1_INCLNS", "M2_SWITCHES",
    "M2_MRS", "M2_Status_LEDs", "M3_APFSDS_AZ", "M3_APFSDS_EL",
    "M3_HESH_AZ", "M3_HESH_EL", "M3_HEAT_AZ", "M3_HEAT_EL", "M3_DAY", "M3_NIGHT"
]

# Function to unpack a byte into bits and return a dictionary of states
def m3_to_bits(byte_val, prefix):
    if prefix == 'M3_DAY' or prefix == 'M3_NIGHT':
        bit_dict = {f"{prefix.lower()}_{m3_zc_suffix[bit]}": bool(byte_val & (1 << bit)) for bit in range(8)}
    else:
        bit_dict = {f"{prefix.lower()}_{m3_suffix[bit]}": bool(byte_val & (1 << bit)) for bit in range(6)}
        
        # print(f"Debug - {prefix}: {bit_dict}")  # Debug statement to check conversion
    return bit_dict

m1_pdr_0 = defaultdict(lambda: 'x')
m1_pdr_0.update({0b1111:"0",0b0111:"1",0b1110:"2",0b0110:"3",0b1101:"4",0b0101:"5",0b1100:"6",0b0100:"7",0b1011:"8",0b0011:"9"})
m1_pdr_1 = {**m1_pdr_0}
m1_pdr_1.update({0b1100:"-3",0b0100:"-2",0b1011:"-1",0b0011:"-"})
m1_wind_1 = {**m1_pdr_1}
m1_wind_1.update({0b0110:"",0b1101:"",0b0101:"",0b1100:""})
m1_mvc = {**m1_pdr_1}
m1_mvc.update({0b0010:"3",0b0001:"5",0b1000:"6",0b0000:"7"})
m1_dps = defaultdict(lambda: 'x')
m1_dps.update({0b000_0000_0000:"none",0b100_0000_0000:"ca",0b010_0000_0000:"cpu",0b001_0000_0000:"sa",0b000_1000_0000:"pnt",0b000_0100_0000:"pdr/mvc",0b000_0010_0000:"air/ammo",0b000_0001_0000:"wind",0b000_0000_1000:"oec",0b000_0000_0100:"oac",0b000_0000_0010:"dsac",0b000_0000_0001:"nsac"})
m2_ammo = defaultdict(lambda: 'x')
m2_ammo.update({0b0000_0001:"none",0b0000_0010:"mg",0b0000_0100:"heat",0b0000_1000:"hesh",0b0001_0000:"apfsds"})
m2_rng_set_mode = defaultdict(lambda: 'x')
m2_rng_set_mode.update({0b001:"emerg",0b010:"man",0b100:"laser"})
m2_op_mode = defaultdict(lambda: 'x')
m2_op_mode.update({0b0001:"test",0b0010:"pre",0b0100:"cbt",0b1000:"off"})
m2_mrs_dm = defaultdict(lambda: 'x')
m2_mrs_dm.update({0b0000:"0",0b0001:"1",0b1000:"2",0b1001:"3",0b0100:"4",0b0101:"5",0b1100:"6",0b1101:"7",0b0010:"8",0b0011:"9"})
m2_mrs_hm = {**m2_mrs_dm}
m2_mrs_km = {**m2_mrs_dm}
m2_mrs_km.update({0b0011:"-"})
m3_suffix = {0:"0.1",1:"0.2",2:"0.4",3:"0.8",4:"1.6",5:"+"}
m3_zc_suffix = {0:"az_1",1:"az_2",2:"az_4",3:"az_+",4:"el_1",5:"el_2",6:"el_4",7:"el_+"}

def decoding_dict(data):
    bit_dict = {}
    for key, value in data.items():
        if key == 'M1_PDR':
            bit_dict.update({f"m1_pdr_1":(m1_pdr_1[(value>>4)&0xF])})
            bit_dict.update({f"m1_pdr_0":(m1_pdr_0[(value)&0xF])})
        if key == 'M1_AIR':
            bit_dict.update({f"m1_air_1":(m1_pdr_1[(value>>4)&0xF])})
            bit_dict.update({f"m1_air_0":(m1_pdr_0[(value)&0xF])})
        if key == 'M1_WIND':
            bit_dict.update({f"m1_wind_1":(m1_wind_1[(value>>4)&0xF])})
            bit_dict.update({f"m1_wind_0":(m1_pdr_0[(value)&0xF])})
        if key == 'M1_MVC':
            bit_dict.update({f"m1_mvc":(m1_mvc[(value)&0xF])})
            # bit_dict.update({f"m1_mvc":f"{(((value)&0xF)):0{8}b}"})
        if key == 'M1_INCLNS':
            bit_dict.update({f"m1_rated/preset":"preset" if (value>>16)&0x1 else "rated"})
            bit_dict.update({f"m1_sm":"pressed" if (value>>15)&0x1 else "released"})
            bit_dict.update({f"m1_az/bs":"az" if (value>>14)&0x1 else "bs"})
            bit_dict.update({f"m1_cm":"pressed" if (value>>13)&0x1 else "released"})
            bit_dict.update({f"m1_inclns":"off" if (value>>12)&0x1 else "on"})
            bit_dict.update({f"m1_scd/cpd":"scd" if (value>>11)&0x1 else "cpd"})
            bit_dict.update({f"m1_dps":(m1_dps[value&0x7ff])})
        if key == 'M2_SWITCHES':
            bit_dict.update({f"m2_ammo":(m2_ammo[(value>>24)&0x1f])})
            bit_dict.update({f"m2_rngMode":(m2_rng_set_mode[(value>>8)&0x7])})
            bit_dict.update({f"m2_opMode":(m2_op_mode[(value>>2)&0xF])})
            bit_dict.update({f"m2_day/night":"night" if (value>>6)&0x1 else "day"})
            bit_dict.update({f"m2_move/fix":"fix" if (value>>11)&0x1 else "move"})
            bit_dict.update({f"m2_first/last":"last" if (value>>0)&0x1 else "first"})
            bit_dict.update({f"m2_Mrd":"pressed" if (value>>1)&0x1 else "released"})
            bit_dict.update({f"m2_Reset":"pressed" if (value>>7)&0x1 else "released"})
            bit_dict.update({f"m2_mrs_km":(m2_mrs_km[(value>>12)&0xF])})
            bit_dict.update({f"m2_mrs_hm":(m2_mrs_hm[(value>>16)&0xF])})
            bit_dict.update({f"m2_mrs_dm":(m2_mrs_dm[(value>>20)&0xF])})
        # if key == 'M2_MRS':
            # bit_dict.update({f"m2_mrs_hm":(m2_mrs_hm[(value)&0xF])})
            # bit_dict.update({f"m2_mrs_dm":(m2_mrs_dm[(value>>4)&0xF])})
        if key.startswith('M3_DAY') or key.startswith('M3_NIGHT'):
            bit_dict.update(m3_to_bits(value, key))
        elif key.startswith('M3_'):
            bit_dict.update(m3_to_bits(value, key))
            # bit_dict.update({f"m2_mrs_hm":(m2_mrs_hm[(value)&0xF])})
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

            # Save the dictionary to a JSON file
            current_data = decoding_dict(data_dict)
            with open('data_output.json', 'w') as json_file:
                json.dump(current_data, json_file, indent=4)
            print(current_data)
                
            # packed_bytes = struct.pack('<I', data_dict["M2_SWITCHES"])
            # ii =0
            # for byte in packed_bytes:
            #     print(f"{(byte):0{8}b}",'\t[',(ii+1)*8-1,':',ii*8,']')
            #     ii+=1
            # print(f"{(data_dict["M2_SWITCHES"]):0{32}b}")
            print(line)

try:
    read_and_decode()
except KeyboardInterrupt:
    print("Stopped by User")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    ser.close()
