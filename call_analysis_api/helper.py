from hume import HumeBatchClient
from hume.models.config import BurstConfig, ProsodyConfig
import numpy as np
import math

## Video Analysis Function, takes in mp3 and outputs hume predictions
def video_analysis(filepath):
   client = HumeBatchClient("vUvAX0Br73vntdEbvuGtRYTzfhrdUBeJzUZRjFNrN1LvDTVY")

   files = [filepath]
   prosody_config = ProsodyConfig(identify_speakers=True)

   job = client.submit_job([],[prosody_config], files = files)

   print("Running...", job)
   job.await_complete()
   print("Job completed with status: ", job.get_status())
   return job.get_predictions()

## extracts significant emotions cleanly
def extract_emotions(full_predictions):
    speaker_dict = {}

    for source in full_predictions:
        predictions = source["results"]["predictions"]
        for prediction in predictions:
            file = prediction["models"]["prosody"]["grouped_predictions"]
            for speaker in file:
                speaker_dict[speaker["id"]] = (speaker["predictions"][0]["time"]["begin"],speaker["predictions"][-1]["time"]["end"])

    sorted_speakers = sorted(speaker_dict, key=lambda k: speaker_dict[k][0])
    representative_id = sorted_speakers[0]
    customer_id = sorted_speakers[1]
    call_duration = max(tuple[1] for tuple in speaker_dict.values())

    speaker_data = {"representative":{"Anger":[],
                                    "Disappointment":[],
                                    "Disgust":[],
                                    "Distress":[],
                                    "Horror":[],
                                    "Pain":[],
                                    "Sadness":[],
                                    "Joy":[],
                                    "Love":[],
                                    "Satisfaction":[],
                                    "Calmness":[]
                                    },
                    "customer":{"Anger":[],
                                    "Disappointment":[],
                                    "Disgust":[],
                                    "Distress":[],
                                    "Horror":[],
                                    "Pain":[],
                                    "Sadness":[],
                                    "Joy":[],
                                    "Love":[],
                                    "Satisfaction":[],
                                    "Calmness":[]
                                    }}

    significant_emotions = ("Anger","Disappointment","Disgust","Distress","Horror",
                            "Pain","Sadness","Joy","Love","Satisfaction","Calmness")

    for source in full_predictions:
        predictions = source["results"]["predictions"]
        for prediction in predictions:
            file = prediction["models"]["prosody"]["grouped_predictions"]
            for speaker in file:
                if (speaker["id"] == representative_id):
                    for line in speaker["predictions"]:
                        for emotion in line["emotions"]:
                            if emotion["name"] in significant_emotions:
                                speaker_data["representative"][emotion["name"]].append(emotion["score"])
                elif (speaker["id"] == customer_id):
                    for line in speaker["predictions"]:
                        for emotion in line["emotions"]:
                            if emotion["name"] in significant_emotions:
                                speaker_data["customer"][emotion["name"]].append(emotion["score"])
                else:
                    pass

    print("call_duration:", call_duration)
    print("speaker_data:", speaker_data)
    return(call_duration, speaker_data)

def analyze_emotion_trend(values):

    '''Analyzes the trend of emotional values over time.

    This function takes a series of emotional intensity values and calculates
    a single trend score. The trend score indicates the overall direction and
    strength of emotional change, while accounting for volatility.
    
    - The trend calculation considers both the overall slope and total change.
    - Volatility (measured by standard deviation) reduces the magnitude of the trend.
    - The final score is normalized and compressed using a sigmoid function.
    '''
    values = np.array(values)
    try:
        # Calculate the overall trend
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)

        # Calculate the total change
        total_change = values[-1] - values[0]

        # Calculate the volatility (standard deviation)
        volatility = np.std(values)

        # Normalize the slope and total change
        max_possible_change = 1  # Since emotions range from 0 to 1
        normalized_slope = slope / max_possible_change
        normalized_total_change = total_change / max_possible_change

        # Combine slope and total change, with dampening factors
        trend_score = (normalized_slope * 0.7 + normalized_total_change * 0.3)

        # Apply a sigmoid function to compress extreme values
        trend_score = 2 / (1 + np.exp(-2 * trend_score)) - 1

        # Reduce the score based on volatility
        volatility_factor = 1 - min(volatility * 2, 0.5)  # Cap volatility impact
        trend_score *= volatility_factor

        return trend_score
    except np.linalg.LinAlgError:
        # If SVD still doesn't converge, return 0 (no detectable trend)
        return 0

def calculate_final_score(call_duration, speaker_data):
    results = {
        speaker: {
            emotion: analyze_emotion_trend(values) if values else None
            for emotion, values in emotions.items()
        }
        for speaker, emotions in speaker_data.items()
    }

    call_experience = {
        "representative":0,
        "customer":0
    }

    negative_emotions = ("Anger","Disappointment","Disgust","Distress","Horror",
                                "Pain","Sadness")
    positive_emotions = ("Joy","Love","Satisfaction","Calmness")

    for speaker in ['representative', 'customer']:
        for emotion, score in results[speaker].items():
            if score is not None:  # Check if the score is not None
                if emotion in negative_emotions:
                    call_experience[speaker] -= score
                elif emotion in positive_emotions:
                    call_experience[speaker] += score

    ## Average call center duration is 312 seconds
    average_duration = 312
    # Apply logarithmic scaling to the duration factor
    duration_factor = math.log(call_duration/average_duration + 1) / math.log(2)
    ## Acccounts for representative's experience & call duration
    final_score = 0.3*(call_experience["representative"] + (0.4*call_experience["customer"]))*duration_factor
    print("final_score:",final_score)

    return final_score 

