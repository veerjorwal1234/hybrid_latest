#!/usr/bin/env python3
"""Test script to debug geofencing issues"""
import json
from utils.geofence import is_inside_polygon

# The polygon from user's coordinates
polygon = [[18.76881754282782, 73.69819489513077], 
           [18.767759662681247, 73.70795536566978], 
           [18.758977005226484, 73.70464565967707], 
           [18.760294432999043, 73.69182845430406]]

polygon_json = json.dumps(polygon)

# Test some points
test_points = [
    (18.768, 73.698, "Top-left corner area"),
    (18.7641, 73.7001, "Center of polygon"),
    (18.767, 73.707, "Top-right area"),
    (18.759, 73.704, "Bottom area"),
    (18.760, 73.692, "Bottom-left area"),
]

print("=== GEOFENCE DEBUG TEST ===\n")
print(f"Polygon: {polygon}\n")

for lat, lng, desc in test_points:
    result = is_inside_polygon(lat, lng, polygon_json)
    status = "✅ INSIDE" if result else "❌ OUTSIDE"
    print(f"{status} - ({lat}, {lng}) - {desc}")

print("\n=== POLYGON BOUNDS ===")
lats = [p[0] for p in polygon]
lngs = [p[1] for p in polygon]
print(f"Latitude range: {min(lats):.6f} to {max(lats):.6f}")
print(f"Longitude range: {min(lngs):.6f} to {max(lngs):.6f}")
print(f"Center approx: ({sum(lats)/len(lats):.6f}, {sum(lngs)/len(lngs):.6f})")
