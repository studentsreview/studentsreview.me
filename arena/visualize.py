import matplotlib.pyplot as plt

import dateutil
import json

with open('liveseats.json') as live_seats_file:
    live_seats_data = json.load(live_seats_file)

for course in live_seats_data:
    if course['teacher'] != 'Fortin':
        continue
    plt.plot(
        [dateutil.parser.parse(series['time']) for series in course['timeSeries']],
        [int(series['seats']) for series in course['timeSeries']]
    )

plt.show()
