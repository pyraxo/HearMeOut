from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

representatives_online = {
    "1": 0.8,
    "2": 0.4,
    "3": 0.2,
    "4": 0.6
}
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AgentInfo(BaseModel):
    representative_id: str
    bandwidth: float


class BandwidthChange(BaseModel):
    representative_id: str
    bandwidth_change: float

# possible factors for representative score change
# hume emotional factors
# time of call (longer calls get penalized less and rewarded more, shorter calls get rewarded less and penalized more)
# number of previous calls


@app.get("/available", response_model=List[AgentInfo])
def get_available_agents():
    # Convert each dictionary to AgentInfo object
    representatives_list = []
    for id, bandwidth in representatives_online.items():
        representatives_list.append(
            AgentInfo(representative_id=id, bandwidth=bandwidth))
    return representatives_list


@app.post("/updatebandwidth", response_model=AgentInfo)
def match(request: BandwidthChange):
    try:
        print(request)
        representative = request.representative_id
        if representative in representatives_online:
            representatives_online[representative] = representatives_online[representative] + \
                request.bandwidth_change
        return AgentInfo(representative_id=representative, bandwidth=representatives_online[representative])
    except:
        print("some exception happened")
        raise Exception("Invalid representative id.")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
