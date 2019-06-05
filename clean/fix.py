import json
import os

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'teachers.json')) as reviews_file:
    review_data = json.load(reviews_file)

for teacher in review_data:
    review_data[teacher]['reviews'] = list(dict.fromkeys(review_data[teacher]['reviews']))

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'teachers.json'), 'w') as reviews_file:
    json.dump(review_data, reviews_file)
