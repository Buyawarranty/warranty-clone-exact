UPDATE plans 
SET coverage = '["Engine", "Manual Gearbox", "Automatic Transmission", "Torque Converter", "Overdrive", "Differential", "Electrics", "Casings", "Recovery", "Basic plan plus:", "Labour up to £75 p/hr", "*FREE Halfords MOT test", "*Unlimited Claims", "Clutch", "Cooling System", "Fuel System", "Braking System", "Propshaft", "Vehicle Hire", "European Cover"]'::jsonb 
WHERE name = 'Gold';