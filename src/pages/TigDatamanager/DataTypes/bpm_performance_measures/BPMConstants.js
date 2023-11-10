const variableAccessors = {
    "VMT" : "vehicle_miles_traveled",
    "VHT" : "vehicle_hours_traveled",
    "AvgSpeed": "ave_speed"
  };
const variableLabels = {
    "VMT" : "VMT (in Thousands)",
    "VHT" : "VHT (in Thousands)",
    "AvgSpeed": "Avg. Speed (Miles/Hr)" 
}

const dataVariableNames = Object.keys(variableAccessors);


export {variableAccessors, variableLabels, dataVariableNames}