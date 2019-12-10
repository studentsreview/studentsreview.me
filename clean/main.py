from Cleaner import Announcer, ANNOUNCERS, Cleaner

for ANNOUNCER in ANNOUNCERS:
    announcer = Announcer(ANNOUNCER)
    Cleaner.clean_announcer(announcer)
