from utils.geofence import calculate_inside_count
import json

# Default polygon from GenerateQR.jsx
polygon_str = '[[18.77650087426464, 73.69443644062979], [18.757928884141037, 73.66731143492491], [18.74377631173372, 73.6876308776894], [18.762875716118945, 73.7193882307322]]'

# Test Point 1: Centroid (Should be INSIDE)
# Approx: 18.760, 73.692
point_inside = {
    "latitude": 18.760,
    "longitude": 73.692,
    "accuracy": 10,
    "timestamp": "2024-01-01T10:00:00Z"
}

# Test Point 2: Clearly Outside
point_outside = {
    "latitude": 18.800,
    "longitude": 73.800,
    "accuracy": 10,
    "timestamp": "2024-01-01T10:00:00Z"
}

# Test Point 3: Inside but Low Accuracy (Should be REJECTED)
point_low_accuracy = {
    "latitude": 18.760,
    "longitude": 73.692,
    "accuracy": 150,
    "timestamp": "2024-01-01T10:00:00Z"
}

print("--- Debugging Geofence Logic ---")
samples = [point_inside, point_outside, point_low_accuracy]

inside_count, valid_samples = calculate_inside_count(samples, polygon_str)

print(f"\nFinal Result: {inside_count} inside out of {valid_samples} valid samples.")
