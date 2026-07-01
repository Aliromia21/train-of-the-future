"""
Train of the Future — Python Simulator
Simulates 10 trains moving between German stations, sending telemetry every 5s.
Full implementation: Week 2, Day 8.
"""
import os
import time
import json
import random
import threading
import requests
from typing import TypedDict

API_URL = os.environ.get("API_URL", "http://backend:3000/api/telemetry")

# German stations on Hannover–Berlin route
STATIONS = [
    {"name": "Hannover Hbf",     "lat": 52.3764, "lon": 9.7415},
    {"name": "Hildesheim Hbf",   "lat": 52.1530, "lon": 9.9509},
    {"name": "Braunschweig Hbf", "lat": 52.2524, "lon": 10.5354},
    {"name": "Wolfsburg Hbf",    "lat": 52.4279, "lon": 10.7873},
    {"name": "Magdeburg Hbf",    "lat": 52.1308, "lon": 11.6265},
    {"name": "Berlin Hbf",       "lat": 52.5251, "lon": 13.3694},
]

# Tunnel zones (GPS bounding boxes) — WiFi drops here
TUNNEL_ZONES = [
    {"lat_min": 52.2, "lat_max": 52.28, "lon_min": 10.1, "lon_max": 10.4},
]


class TelemetryPayload(TypedDict):
    train_id: int
    speed: int
    latitude: float
    longitude: float
    wifi_status: str
    connected_passengers: int
    signal_strength: int
    heading: float
    idempotency_key: str


def is_in_tunnel(lat: float, lon: float) -> bool:
    for zone in TUNNEL_ZONES:
        if zone["lat_min"] <= lat <= zone["lat_max"] and zone["lon_min"] <= lon <= zone["lon_max"]:
            return True
    return False


def simulate_train(train_id: int) -> None:
    """Simulate a single train. Each train runs in its own thread."""
    offline_queue: list[TelemetryPayload] = []
    seq = 0

    print(f"[Train {train_id:02d}] Starting simulation")

    while True:
        station = random.choice(STATIONS)
        lat = station["lat"] + random.uniform(-0.05, 0.05)
        lon = station["lon"] + random.uniform(-0.05, 0.05)
        in_tunnel = is_in_tunnel(lat, lon)

        payload: TelemetryPayload = {
            "train_id": train_id,
            "speed": random.randint(60, 250),
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "wifi_status": "OFFLINE" if in_tunnel else random.choice(["GOOD", "GOOD", "GOOD", "DEGRADED"]),
            "connected_passengers": random.randint(20, 300),
            "signal_strength": 0 if in_tunnel else random.randint(40, 100),
            "heading": round(random.uniform(0, 360), 2),
            "idempotency_key": f"train-{train_id}-seq-{seq}",
        }
        seq += 1

        if in_tunnel:
            # Queue locally — will flush on tunnel exit
            offline_queue.append(payload)
            print(f"[Train {train_id:02d}] 🚇 In tunnel — queued (queue size: {len(offline_queue)})")
        else:
            # Flush queue first (out-of-order handling on backend)
            if offline_queue:
                print(f"[Train {train_id:02d}] 🌐 Exiting tunnel — flushing {len(offline_queue)} queued events")
                for queued in offline_queue:
                    try:
                        requests.post(API_URL, json=queued, timeout=5)
                    except requests.exceptions.RequestException as e:
                        print(f"[Train {train_id:02d}] Flush error: {e}")
                offline_queue.clear()

            # Send current telemetry
            try:
                requests.post(API_URL, json=payload, timeout=5)
                print(f"[Train {train_id:02d}] ✓ speed={payload['speed']}km/h wifi={payload['wifi_status']}")
            except requests.exceptions.RequestException as e:
                print(f"[Train {train_id:02d}] ✗ Send error: {e}")

        time.sleep(5)


def main() -> None:
    num_trains = 10
    print(f"Starting simulator with {num_trains} trains...")
    print(f"Sending telemetry to {API_URL}")
    print("Press Ctrl+C to stop\n")

    threads = []
    for i in range(1, num_trains + 1):
        t = threading.Thread(target=simulate_train, args=(i,), daemon=True)
        t.start()
        threads.append(t)
        time.sleep(0.5)  # Stagger startup

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nSimulator stopped")


if __name__ == "__main__":
    main()
