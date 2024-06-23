from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Dict
import json

# Define models
class Score(BaseModel):
    name: str
    score: float

class Expression(BaseModel):
    id: str
    scores: List[Score]

class Customer(BaseModel):
    id: int
    score: float

# Read data from JSON file
def read_json_data(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data

# Initialize FastAPI app
app = FastAPI()

# Endpoint to retrieve scores
@app.post("/expressions/", response_model=Customer)
async def get_expressions(request: Request):
    try:
        data = await request.json()
        customer_id = data["id"]
        expressions = []
        for item in data["messages"]:
            scores =  item["models"]["prosody"]
            expressions.append(scores)
        average_expression_scores = aggregate_expressions(expressions)
        customer_score = get_customer_score(average_expression_scores)
        return Customer(id=customer_id,score=customer_score)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def aggregate_expressions(expressions):
    expressions_count = 0
    total_expression_scores = {}
    for expression in expressions:
        expressions_count+=1
        scores_dict = expression["scores"]
        for score in scores_dict: # getting total expression scores
            if score in total_expression_scores:
                total_expression_scores[score] += scores_dict[score]
            else:
                total_expression_scores[score] = scores_dict[score]
    for total_score in total_expression_scores: # getting the average expression score
        total_expression_scores[total_score] = total_expression_scores[total_score]/expressions_count
    average_expression_scores = total_expression_scores
    print(average_expression_scores)
    return average_expression_scores
        
def get_customer_score(average_expression_scores):    
    # negative
    anger = average_expression_scores["Anger"]
    disappointment = average_expression_scores["Disappointment"]
    disgust = average_expression_scores["Disgust"]
    distress = average_expression_scores["Distress"]
    horror = average_expression_scores["Horror"]
    pain = average_expression_scores["Pain"]
    sadness = average_expression_scores["Sadness"]
    
    # positive
    joy = average_expression_scores["Joy"]
    love = average_expression_scores["Love"]
    satisfaction = average_expression_scores["Satisfaction"]
    calmness = average_expression_scores["Calmness"]

    negative_thresholds = read_json_data("negative_thresholds.json")
    positive_thresholds = read_json_data("positive_thresholds.json")

    base_score = -1.0
    for name, threshold in negative_thresholds.items():
        if average_expression_scores[name] > threshold:
            base_score = 0.3
            break
    if base_score < 0:
        for name, threshold in positive_thresholds.items():
            if average_expression_scores[name] > threshold:
                base_score = 0.7
                break
    if base_score < 0:
        base_score = 0.5
    
    positive_expression_points = joy * 0.7 + love * 0.7 + satisfaction * 0.5 + calmness * 0.1
    negative_expression_points = anger * 0.07 + disappointment * 0.07 + disgust * 0.05 + distress * 0.1 + horror * 0.1 + pain * 0.8 + sadness * 0.8
    
    final_score = base_score - negative_expression_points + positive_expression_points
    if final_score > 1:
        final_score = 1
    if final_score < 0:
        final_score = 0
    return final_score 
        
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)

