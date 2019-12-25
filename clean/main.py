from Cleaner import Announcer, ANNOUNCERS, Cleaner

results = []

for ANNOUNCER in ANNOUNCERS:
    announcer = Announcer(ANNOUNCER)
    for result in Cleaner.clean_announcer(announcer):
        results.append(result)
    print(len(results))
