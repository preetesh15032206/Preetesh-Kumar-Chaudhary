"""Build a trustworthy timestamp-aligned two-hour forecast dataset.

Only explicitly recognised weather labels are eligible.  Operational states
such as model-loading failures are not weather observations and are excluded
rather than guessed or relabelled.
"""

import os

import numpy as np
import pandas as pd


SENSOR_COLUMNS = ["Temperature", "Humidity", "Precipitation (%)", "UV Index", "Pressure"]
TRAINABLE_WEATHER_LABELS = {"Cloudy", "Sunny", "Rainy"}
FORECAST_HORIZON = pd.Timedelta(hours=2)
# A target must be near the requested horizon.  Fifteen minutes tolerates
# ordinary collection delays without turning a missing two-hour observation
# into a fabricated target.
FORECAST_TOLERANCE = pd.Timedelta(minutes=15)


def _valid_sensor_rows(df):
    ranges = {
        "Temperature": (-40, 60), "Humidity": (0, 100),
        "Precipitation (%)": (0, 100), "UV Index": (0, 16),
        "Pressure": (850, 1100),
    }
    valid = pd.Series(True, index=df.index)
    for column, (low, high) in ranges.items():
        df[column] = pd.to_numeric(df[column], errors="coerce")
        valid &= df[column].between(low, high, inclusive="both")
    return valid


def build_dataset(input_file="data/logs", output_file="data/datasets/forecast_dataset.csv"):
    """Create rows whose target is the closest valid observation near +2 hours."""
    if os.path.isdir(input_file):
        files = sorted(
            os.path.join(input_file, name) for name in os.listdir(input_file)
            if name.endswith(".csv")
        )
        if not files:
            raise FileNotFoundError(f"No log CSVs found in {input_file}")
        frames = [pd.read_csv(path) for path in files]
        df = pd.concat(frames, ignore_index=True)
        print(f"Loaded {len(files)} log files from {input_file}")
    else:
        df = pd.read_csv(input_file)

    required = {"timestamp", "temperature", "humidity", "precipitation", "uv_index", "pressure", "current_weather"}
    missing = sorted(required - set(df.columns))
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = df.rename(columns={
        "temperature": "Temperature", "humidity": "Humidity",
        "precipitation": "Precipitation (%)", "uv_index": "UV Index",
        "pressure": "Pressure", "current_weather": "Condition",
    })
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df["Condition"] = df["Condition"].astype("string").str.strip()

    before = len(df)
    label_ok = df["Condition"].isin(TRAINABLE_WEATHER_LABELS)
    sensor_ok = _valid_sensor_rows(df)
    df = df.loc[label_ok & sensor_ok & df["timestamp"].notna()].copy()
    df = df.drop_duplicates().sort_values("timestamp").reset_index(drop=True)
    print(f"Input rows: {before}; valid labelled sensor rows: {len(df)}")

    # The right side contains only trustworthy future observations. merge_asof
    # selects the chronologically nearest timestamp to source + two hours;
    # the tolerance prevents labels from being invented across large gaps.
    sources = df.copy()
    sources["target_time"] = sources["timestamp"] + FORECAST_HORIZON
    targets = df[["timestamp", "Condition"]].rename(
        columns={"timestamp": "target_timestamp", "Condition": "Target_Condition"}
    )
    forecast = pd.merge_asof(
        sources.sort_values("target_time"),
        targets.sort_values("target_timestamp"),
        left_on="target_time", right_on="target_timestamp",
        direction="nearest", tolerance=FORECAST_TOLERANCE,
    )
    forecast = forecast.dropna(subset=["Target_Condition"])
    forecast = forecast.loc[forecast["target_timestamp"] > forecast["timestamp"]].copy()
    forecast = forecast.sort_values("timestamp").reset_index(drop=True)

    forecast["hour_of_day"] = forecast["timestamp"].dt.hour
    forecast["day_of_week"] = forecast["timestamp"].dt.dayofweek
    forecast["month"] = forecast["timestamp"].dt.month
    forecast["day_of_month"] = forecast["timestamp"].dt.day
    forecast["temp_t1"] = forecast["Temperature"].shift(1)
    forecast["humidity_t1"] = forecast["Humidity"].shift(1)
    forecast["pressure_t1"] = forecast["Pressure"].shift(1)
    forecast["temp_change"] = forecast["Temperature"].diff()
    forecast["pressure_change"] = forecast["Pressure"].diff()
    forecast = forecast.dropna(subset=["temp_t1", "humidity_t1", "pressure_t1", "temp_change", "pressure_change"])

    columns = [
        "timestamp", *SENSOR_COLUMNS, "Condition", "Target_Condition",
        "hour_of_day", "day_of_week", "month", "day_of_month",
        "temp_t1", "humidity_t1", "pressure_t1", "temp_change", "pressure_change",
    ]
    forecast = forecast[columns]
    os.makedirs(os.path.dirname(output_file) or ".", exist_ok=True)
    forecast.to_csv(output_file, index=False)

    print(f"Saved {len(forecast)} timestamp-aligned forecast rows to {output_file}")
    print("Current labels:\n" + forecast["Condition"].value_counts().to_string())
    print("Forecast labels:\n" + forecast["Target_Condition"].value_counts().to_string())
    return forecast


if __name__ == "__main__":
    build_dataset()
