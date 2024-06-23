from fastapi import FastAPI
from typing import List
from pydantic import BaseModel

app = FastAPI()

class AgentInfo(BaseModel):
    agent_id: int
    bandwidth: float
    
# possible factors for representative score change
# hume emotional factors
# time of call (longer calls get penalized less and rewarded more, shorter calls get rewarded less and penalized more)
# number of previous calls

@app.get("/available", response_model=List[AgentInfo])
def get_available_agents():
    # Returning a fixed list of floats for now
    agent_data = [
        {"agent_id": 2, "bandwidth": 0.3},
        {"agent_id": 3, "bandwidth": 0.6},
        {"agent_id": 1, "bandwidth": 0.8},
        {"agent_id": 4, "bandwidth": 0.7}
    ]
    # Convert each dictionary to AgentInfo object
    return [AgentInfo(**item) for item in agent_data]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
