from fastapi.middleware.cors import CORSMiddleware
import time
import requests
from typing import Dict, List, Tuple

from fastapi import FastAPI, HTTPException
from helper import calculate_final_score, extract_emotions, video_analysis
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CallData(BaseModel):
    representative_id: str
    filepath: str


class RepresentativeScore(BaseModel):
    representative_id: int
    bandwidth_change: float


@app.post("/calldata", response_model=RepresentativeScore)
def match(request: CallData):
    seconds_between_attempts = 2
    max_calls = 5
    for i in range(max_calls):
        try:
            # Module takes in: .mp3, representative id
            # Module outputs: final score, representative id
            full_predictions = video_analysis(request.filepath)
            call_duration, speaker_data = extract_emotions(full_predictions)
            representative_score = calculate_final_score(
                call_duration, speaker_data)
            representativeObject = RepresentativeScore(
                representative_id=request.representative_id, bandwidth_change=representative_score)
            payload = {
                "representative_id": request.representative_id,
                "bandwidth_change": representative_score
            }
            response = requests.post(
                "http://127.0.0.1:8001/updatebandwidth", json=payload)
            # Check if the request was successful (status code 200)
            if response.status_code == 200:
                # Print the response JSON
                print(response.json())
            else:
                # Print an error message
                print("Error:", response.status_code)
            break
        except Exception as e:
            print("Trying again. Attempt: " + str(i+1))
            time.sleep(seconds_between_attempts)
        return representativeObject


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
