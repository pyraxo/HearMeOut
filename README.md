# HearMeOut
## Inspiration
As a group of exchange students, one thing which shocked us when we came to America was the sheer number of poorly automated customer service calls which we had to endure. Whether it be for insurance queries, delivery woes, or banking issues, we've all had our fair share of bad call experiences with poor automated call responses, or exhausted customer representatives.

Doing more research, we were surprised to find that the call center market in the U.S. was estimated at a whopping US$110.6 Billion in the year 2022, and represents about 3% of America's workforce. This is clearly a large market with space for improvement, and with this in mind, we came up with our problem statement:

How might Businesses which offer customer service calls provide a better experience for their customers?

## What it does
Our solution targets 4 key components of customer service calls: 1) Customer user journey optimization through customer-to-representative mapping 2) Customer call experience visibility 3) Representative state visibility 4) Improved call bot

## How we built it
There are 2 calls in most customer service journeys. The first call between the customer and a call bot, and the second call between the customer and a representative. To improve the first call, we leveraged hume.ai's Empathetic Voice Interface (EVI), adjusted to fit the context of a customer service call.

Leveraging hume.ai's Expression Measurement API, we generate scores for each call, assessing the customer's agreeableness, and the representative's "state" - their capacity to continue taking calls. With these two factors, we match customers to representatives using a priority queue.

More details about our implementation can be found in our software architecture diagram (attached in Project Media)

## Accomplishments that we're proud of
1. Decoupled Microservice-based architecture We spent a significant amount of time planning out HearMeOut's architecture, and eventually came up with a decoupled microservice-based architecture, connected through REST APIs. Building our project in such a way allows for individual components to be modified easily, leaving the door wide open for future improvements. This architecture makes HearMeOut scalable from the get-go.

What's next for HearMeOut
1. Incorporation of initially planned features We cut our initial scope down to deliver our project in time. We'd love to go back and work on database integration, incorporation of other LLMs for improved matching results, and improvements to the matching algorithm itself .

2. Help from subject-matter experts Benchmarking is always a challenge. Assessing our outputs through the eyes of a subject-matter expert such as a behavioural scientist would give us more insight into steps we can take to generate more salient responses.
