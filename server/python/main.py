from studentvue import StudentVue

import sys
import os
import json

def main(args):
    username, password = args
    sv = StudentVue(username, password, 'portal.sfusd.edu')
    schedule = sv.get_schedule()
    print(json.dumps(list(map(lambda class_: {'block': class_.period, 'teacher': class_.teacher.name}, schedule))))

main(sys.argv[1:])
