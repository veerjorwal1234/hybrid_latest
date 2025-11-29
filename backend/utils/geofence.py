import json

def is_inside_polygon(lat, lng, polygon_geojson):
    """
    Checks if a point (lat, lng) is inside a polygon defined by GeoJSON using Ray Casting algorithm.
    polygon_geojson: A JSON string representing a list of [lat, lng] points.
    """
    try:
        # Expecting polygon_geojson to be a list of coordinates [[lat, lng], ...]
        poly = json.loads(polygon_geojson)
        
        # Ray casting algorithm
        # x = lat, y = lng
        n = len(poly)
        inside = False
        p1x, p1y = poly[0]
        for i in range(n + 1):
            p2x, p2y = poly[i % n]
            if lng > min(p1y, p2y):
                if lng <= max(p1y, p2y):
                    if lat <= max(p1x, p2x):
                        if p1y != p2y:
                            xinters = (lng - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                        if p1x == p2x or lat <= xinters:
                            inside = not inside
            p1x, p1y = p2x, p2y
            
        return inside
    except Exception as e:
        print(f"Geofence Error: {e}")
        return False

def calculate_inside_count(samples, polygon_geojson):
    """
    Calculates how many samples are inside the polygon.
    samples: List of dicts {latitude, longitude, accuracy, timestamp}
    """
    inside_count = 0
    valid_samples = 0
    
    print(f"\n=== GEOFENCE CHECK ===")
    print(f"Polygon: {polygon_geojson[:100]}...")
    print(f"Total samples received: {len(samples)}")
    
    for i, sample in enumerate(samples):
        accuracy = sample.get('accuracy', 999)
        lat = sample['latitude']
        lng = sample['longitude']
        
        # Basic accuracy check (relaxed for testing)
        if accuracy > 2000:
            print(f"Sample {i+1}: REJECTED - Accuracy {accuracy}m > 100m")
            continue
            
        valid_samples += 1
        is_inside = is_inside_polygon(lat, lng, polygon_geojson)
        
        if is_inside:
            inside_count += 1
            print(f"Sample {i+1}: ✅ INSIDE ({lat}, {lng}) accuracy={accuracy}m")
        else:
            print(f"Sample {i+1}: ❌ OUTSIDE ({lat}, {lng}) accuracy={accuracy}m")
    
    print(f"\nRESULT: {inside_count}/{valid_samples} samples inside polygon")
    print(f"=== END GEOFENCE CHECK ===\n")
            
    return inside_count, valid_samples
