from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from typing import Dict, List, Tuple

app = FastAPI()

class AgentInfo(BaseModel):
    agent_id: int
    bandwidth: float
    
class CallInfo(BaseModel):
    call_id: int
    agreeableness: float    

class MatchResponse(BaseModel):
    pair: Tuple
    
        
@app.post("/match", response_model=MatchResponse)
def match(request: CallInfo):
    try:
        response = requests.get("http://127.0.0.1:8001/available")
        response.raise_for_status()
        values = response.json()
        agent_info_list = parse_agent_info(values)
        # 1 caller, multiple agents
        pair = closest_to_1(request,agent_info_list)
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error fetching data from 8001: {e}")
    return MatchResponse(pair=pair)

def parse_agent_info(data: List[Dict[str, float]]) -> List[AgentInfo]:
    agent_info_list = []
    for item in data:
        agent_info_list.append(AgentInfo(agent_id=item['agent_id'], bandwidth=item['bandwidth']))
    return agent_info_list

def closest_to_1(result: CallInfo, values: List[AgentInfo]) -> Tuple[CallInfo, AgentInfo]:
    closest_value = None
    min_diff = float('inf')

    for value in values:
        diff = abs(result.agreeableness + value.bandwidth - 1)
        if diff < min_diff:
            min_diff = diff
            closest_value = value

    return (result, closest_value)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    """
    call - {"call_id": 10, "frustration_level": 0.6}
    agent - {"agent_id" 2, "bandwidth": 0.3}
    
    [0.9,0.6,0.4,0.3]
    [0.3,0.5,0.6,0.2]
    
    queue for waiting calls
    queue for available agents
    
    wait every x seconds: (find another way to do this, for now treat 1 call)
        if calls = 1
        
        if calls > agents:
            calls_to_match = calls[:len(agents)]
            pair_lists(calls_to_match,agents)
            calls.remove(len(agents))
            send to calling api []
        
        if agents > calls:
        
        if agents = 0:
            wait x seconds
    """