from helper import video_analysis, extract_emotions, calculate_final_score
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Tuple
import time

app = FastAPI()

class CallData(BaseModel):
    representative_id: int
    filepath: str    
class RepresentativeScore(BaseModel):
    representative_id: int
    score: float

@app.post("/calldata", response_model=RepresentativeScore)
def match(request: CallData):
    seconds_between_attempts = 2
    max_calls = 5
    for i in range(max_calls):
        try:
            ## Module takes in: .mp3, representative id
            ## Module outputs: final score, representative id
            full_predictions = video_analysis(request.filepath)
            call_duration, speaker_data = extract_emotions(full_predictions)
            representative_score = calculate_final_score(call_duration, speaker_data)            
        except Exception as e:
            print("Trying again. Attempt: " + str(i+1))
            time.sleep(seconds_between_attempts)
    return RepresentativeScore(representative_id=request.representative_id,score=representative_score)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)