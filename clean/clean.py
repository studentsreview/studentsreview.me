import os
import json
import sys
from hashlib import sha256
from datetime import datetime
from tabula import read_pdf

from pymongo import MongoClient
from pymongo.errors import BulkWriteError

client = MongoClient(sys.argv[1] if len(sys.argv) > 1 else 'mongodb://localhost:27017/StudentsReview')

db = client['StudentsReview']
courses = db['courses']
classes = db['classes']
reviews = db['reviews']
teachers = db['teachers']

def reload_alias_file():
    with open(os.path.join(os.path.dirname(__file__), 'aliases.json')) as alias_file:
        return json.load(alias_file)

def write_to_alias_file(aliases):
    with open(os.path.join(os.path.dirname(__file__), 'aliases.json'), 'w') as alias_file:
        json.dump(aliases, alias_file)

aliases = reload_alias_file()
data = {}

header_on_every_page = {
    'Fall2014': False,
    'Spring2015': True,
    'Fall2015': True,
    'Spring2016': True,
    'Fall2016': True,
    'Spring2017': False,
    'Fall2017': True,
    'Spring2018': True,
    'Fall2018': True,
    'Spring2019': True,
    'Fall2019': True,
    'Spring2020': True
}


def semester_value(semester):
    year = int(semester[-4:])
    semester = semester[:-4]

    return year + (0.5 if semester == 'Fall' else 0)

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
for announcer in sorted(os.listdir(os.path.join(data_path, 'pdf_announcers')),
                        key=lambda announcer_path: semester_value(os.path.basename(announcer_path)[:-4])):
    print(announcer)
    data[announcer[:-4]] = []
    pages = read_pdf(
        os.path.join(data_path, 'pdf_announcers', announcer),
        output_format='json',
        pages='all',
        guess=False,
        lattice=True
    )

    headers = []
    for header in pages[0]['data'][0]:
        header['text'] = header['text'].replace('  ', ' ')
        alias = aliases.get(header['text'])
        if alias is None:
            alias = input(f'{header["text"]}:')
            aliases[header['text']] = alias
            write_to_alias_file(aliases)
        if alias not in ['code', 'name', 'room', 'block', 'teacher']:
            alias = ''
        headers.append(alias)

    for page in pages:
        rows = page['data'][1:] if header_on_every_page[announcer[:-4]] or pages.index(page) == 0 else page['data']
        for row in rows:
            if len(list(filter(lambda x: x['text'] == '', row))) + 1 == len(row):
                continue
            if len(row) > len(headers):
                row = row[:len(headers) - len(row)]
            data[announcer[:-4]].append({})
            for cell in row:
                cell['text'] = cell['text'].replace('  ', ' ')
                header = headers[row.index(cell)]
                if header:
                    alias = aliases.get(cell['text'])
                    if alias is None:
                        alias = input(f'{ cell["text"] }:')
                        # allows for fixing the file without reloading everything
                        aliases = reload_alias_file()
                        aliases[cell['text']] = alias
                        write_to_alias_file(aliases)
                    if cell['width'] == 0:
                        alias = aliases.get(f'{ announcer }{ pages.index(page) }{ page["data"].index(row) }{ row.index(cell) }')
                        if alias is None:
                            alias = input(f'truncated:')
                            aliases[f'{ announcer }{ pages.index(page) }{ page["data"].index(row) }{ row.index(cell) }'] = alias
                            write_to_alias_file(aliases)
                    data[announcer[:-4]][-1][header] = alias
            if all(field == '' for field in data[announcer[:-4]][-1].values()) or all(x == y for (x, y) in data[announcer[:-4]][-1].items()):
                data[announcer[:-4]].remove(data[announcer[:-4]][-1])

# misc. fixes

for x in range(234, 242):
    data['Fall2014'][x]['room'] = 'Library'

for x in range(301, 303):
    data['Spring2015'][x]['teacher'] = 'Matthew Bell'

data['Fall2015'][400]['teacher'] = 'Julian Pollak'

import csv
import re

with open(os.path.join(data_path, '2020_2021', '2020-2021 Class Announcer - Full Announcer.csv')) as _2020_2021_announcer_file:
    with open(os.path.join(data_path, '2020_2021', '2020_2021_seat_data.json')) as _2020_2021_seat_data_file:
        seat_data = json.load(_2020_2021_seat_data_file)

    data['Fall2020'] = []
    data['Spring2021'] = []
    reader = csv.reader(_2020_2021_announcer_file, delimiter=',', quotechar='"')
    class_queue = []

    for row in reader:
        # ['code', 'name', 'room', 'block', 'teacher']
        class_ = {}
        class_['code'] = None
        class_['name'] = row[2]
        while class_['name'].endswith('*'):
            class_['name'] = class_['name'][:-1]
        class_['room'] = row[3]
        class_['block'] = row[1][:-1]
        class_['teacher'] = row[4]
        class_queue.append(class_)

        notes = row[6][2:]

        while len(class_queue) != 0:
            class_ = class_queue.pop(0)

            aliased_attrs = ['teacher']

            if class_['name'].lower().endswith('(off semester)'):
                name_parts = re.sub(r'\(.+\)$', '', class_['name']).strip().split('/')
                teacher_parts = class_['teacher'].split('/')
                for (index, (name, teacher)) in enumerate(zip(name_parts, teacher_parts)):
                    new_class = class_.copy()
                    new_class['name'] = name
                    new_class['teacher'] = teacher
                    class_queue.append(new_class)
                    class_['length'] = 'Semester'
                    class_['semester'] = 'Fall2020' if index == 1 else 'Spring2021'
                continue

            if class_['name'].startswith('AP English'):
                class_['name'] = ' '.join(class_['name'].split()[:5])
                class_['section'] = notes
            elif class_['name'] == 'Upper Division Junior/Senior English A (Non AP)' or class_[
                'name'] == 'Upper Division Junior/Senior English B (Non AP)':
                class_['name'] = notes
                aliased_attrs.append('name')
                if class_['name'].startswith('Critical Writing'):
                    class_['name'] = 'Critical Writing'
            elif class_['name'].startswith('English 2'):
                class_['section'] = class_['name'][9]
                class_['name'] = 'English 2'
            else:
                aliased_attrs.append('name')

            for attr in aliased_attrs:
                if aliases.get(class_[attr]) is None:
                    alias = input(class_[attr] + '( ' + notes + ' ) :')
                    aliases[class_[attr]] = alias

                class_[attr] = aliases[class_[attr]]
                write_to_alias_file(aliases)

            if class_.get('semester') is None and class_.get('length') is None:
                if len(class_['block']) == 2:
                    if class_['block'][0] == '1':
                        semesters = ['Fall2020']
                    elif class_['block'][0] == '2':
                        semesters = ['Spring2021']

                    class_['block'] = class_['block'][1]
                    class_['length'] = 'Semester'
                else:
                    semesters = ['Fall2020', 'Spring2021']
                    class_['length'] = 'Year'
            else:
                semesters = [class_['semester']]

            for seat_datum in seat_data:
                if aliases.get(seat_datum['teacher']) is None:
                    continue

                if aliases[seat_datum['teacher']] == class_['teacher'] and seat_datum['block'] == class_['block'] and (
                        len(semesters) == 2 and seat_datum['semester'] == 'Both' or
                        len(semesters) == 1 and semesters[0] == 'Fall2020' and seat_datum['semester'] == '1' or
                        len(semesters) == 1 and semesters[0] == 'Spring2021' and seat_datum['semester'] == '2'
                ):
                    class_['seats'] = seat_datum['seat_series']
                    break

            if class_['name'] == '' or class_['teacher'] == '':
                continue

            for semester in semesters:
                data[semester].append(class_.copy())


# undetermined fixes

data['Fall2018'][4]['teacher'] = 'Louis Grice'
data['Fall2018'][9]['teacher'] = 'Louis Grice'
data['Fall2018'][21]['teacher'] = 'Louis Grice'
data['Fall2018'][32]['teacher'] = 'Louis Grice'
data['Fall2018'][38]['teacher'] = 'Louis Grice'

data['Fall2018'][1]['teacher'] = 'Alex Cheng'
data['Fall2018'][11]['teacher'] = 'Alex Cheng'
data['Fall2018'][17]['teacher'] = 'Alex Cheng'
data['Fall2018'][26]['teacher'] = 'Alex Cheng'
data['Fall2018'][29]['teacher'] = 'Alex Cheng'

data['Fall2018'][315]['teacher'] = 'Kay Petrini'
data['Fall2018'][316]['teacher'] = 'Kay Petrini'
data['Fall2018'][358]['teacher'] = 'Kay Petrini'
data['Fall2018'][364]['teacher'] = 'Kay Petrini'

data['Fall2018'][99]['teacher'] = 'Raymond Chan'
data['Fall2018'][100]['teacher'] = 'Raymond Chan'

data['Fall2019'][333]['teacher'] = 'Christopher Watters'
data['Fall2019'][339]['teacher'] = 'Christopher Watters'
data['Fall2019'][374]['teacher'] = 'Christopher Watters'
data['Fall2019'][385]['teacher'] = 'Christopher Watters'

data['Fall2019'][541]['teacher'] = 'Cody Mitcheltree'
data['Fall2019'][543]['teacher'] = 'Cody Mitcheltree'
data['Fall2019'][546]['teacher'] = 'Cody Mitcheltree'
data['Fall2019'][547]['teacher'] = 'Cody Mitcheltree'
data['Fall2019'][549]['teacher'] = 'Cody Mitcheltree'

data['Fall2019'][166]['teacher'] = 'Andrew Cho'

data['Fall2019'][463]['teacher'] = 'Edna Barakat'
data['Fall2019'][464]['teacher'] = 'Edna Barakat'

teachers_to_insert = []
courses_to_insert = []
classes_to_insert = []

for semester in data:
    for class_ in data[semester]:
        class_['semester'] = semester

        if class_['name'].startswith('AP English') and len(class_['name'].split()) == 6:
            class_['section'] = class_['name'].split()[-1]
            class_['name'] = ' '.join(class_['name'].split()[:-1])
        elif class_['name'].startswith('AP') and class_['name'].endswith('economics'):
            if class_['semester'].startswith('Fall'):
                class_['section'] = 'Micro'
            elif class_['semester'].startswith('Spring'):
                class_['section'] = 'Macro'
            class_['name'] = 'AP Economics'
        elif class_.get('section') is None:
            class_['section'] = None

        sectioned = False

        if class_['section'] is not None:
            try:
                course = next(course for course in courses_to_insert if course['name'] == class_['name'])
                course['sectioned'] = True
            except StopIteration:
                sectioned = True

        if class_.get('seats') is None:
            class_['seats'] = None

        if any(test in class_['name'] for test in ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Math']):
            department = 'Math'
        elif any(test in class_['name'] for test in ['Computer']):
            department = 'Computer Science'
        elif any(test in class_['name'] for test in ['Chinese', 'Japanese', 'Korean', 'Spanish', 'Italian', 'Latin', 'Hebrew', 'French']):
            department = 'Foreign Language'
        elif any(test in class_['name'] for test in ['Novel', 'Lit', 'English', 'Writing', 'Fiction', 'Epic', 'Satire', 'Shakespeare']):
            department = 'English'
        elif any(test in class_['name'] for test in ['Bio', 'Chemistry', 'Physics', 'Physiology', 'Geology', 'Science']):
            department = 'Science'
        elif any(test in class_['name'] for test in ['Band', 'Ceramics', 'Photography', 'Video', 'Drama', 'Art', 'Guitar', 'Piano', 'Orchestra', 'Music', 'Theater', 'Dance']):
            department = 'Visual Performing Arts'
        elif any(test in class_['name'] for test in ['History', 'Studies', 'Economics', 'Microeconomics', 'Macroeconomics', 'Psychology', 'Democracy', 'Geography', 'Politics']):
            department = 'Social Science'
        elif any(test in class_['name'] for test in ['PE', 'Swimming', 'Basketball', 'Sports', 'Weight', 'Soccer', 'Yoga']):
            department = 'Physical Education'
        elif any(test in class_['name'] for test in ['JROTC']):
            department = 'JROTC'
        else:
            department = 'Miscellaneous'

        if class_['teacher'] == 'Chan':
            if department == 'Visual Performing Arts':
                class_['teacher'] = 'Jason Chan'
            elif department == 'Math':
                class_['teacher'] = 'Tom Chan'

        if class_['teacher'] == 'Park':
            if department == 'Foreign Language':
                class_['teacher'] = 'Soo Park'
            elif department == 'English':
                class_['teacher'] = 'Claudia Park'

        if class_['name'] == 'CHIN151A':
            class_['name'] = 'Chinese 1'

        if class_['teacher'] == 'Yu Li':
            if department == 'Math':
                class_['teacher'] = 'Ernest Li'

        if class_['name'] == 'AP Enivronmental Science':
            class_['name'] = 'AP Environmental Science'

        class_['department'] = department
        classes_to_insert.append(class_)

        try:
            teacher = next(teacher for teacher in teachers_to_insert if teacher['name'] == class_['teacher'])
            if class_['semester'] not in teacher['semesters']:
                teacher['semesters'].append(class_['semester'])
                teacher['departments'] = []
            if department not in teacher['departments']:
                teacher['departments'].append(department)
                if len(teacher['departments']) > 1 and 'Miscellaneous' in teacher['departments']:
                    teacher['departments'].remove('Miscellaneous')
        except StopIteration:
            teachers_to_insert.append({
                'name': class_['teacher'],
                'departments': [department],
                'semesters': [class_['semester']]
            })

        try:
            course = next(course for course in courses_to_insert if course['name'] == class_['name'])
            if class_['semester'] not in course['semesters']:
                course['semesters'].append(class_['semester'])
        except StopIteration:
            courses_to_insert.append({
                'name': class_['name'],
                'department': department,
                'semesters': [class_['semester']],
                'sectioned': sectioned
            })

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'prerequisites.json')) as prerequisites_file:
    with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'course_descriptions.json')) as course_descriptions_file:
        prerequisites_data = json.load(prerequisites_file)
        course_descriptions_data = json.load(course_descriptions_file)

        for course in courses_to_insert:
            course_description = course_descriptions_data.get(course['name'])
            course['prerequisites'] = prerequisites_data.get(course['name'], [])
            course['notes'] = course_description['notes_prerequisites'] if course_description else ''
            course['grades'] = course_description['grades'] if course_description else ''
            course['length'] = course_description['length'] if course_description else ''
            course['AtoG'] = course_description['A-G'] if course_description else ''
            course['description'] = course_description['description'] if course_description else ''

courses.delete_many({})
classes.delete_many({})
teachers.delete_many({})
reviews.delete_many({
    'version': 1
})

try:
    courses.insert_many(courses_to_insert)
    classes.insert_many(classes_to_insert)
    teachers.insert_many(teachers_to_insert)
except BulkWriteError as bwe:
    print(bwe.details)

reviews_to_insert = []

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'teachers.json')) as reviews_file:
    review_data = json.load(reviews_file)
    for teacher in review_data:
        for review in review_data[teacher]['reviews']:
            reviews_to_insert.append({
                '_id': sha256(('0001-01-01T00:00:00.000Z' + review + teacher).encode()).hexdigest(),
                'teacher': teacher,
                'text': review,
                'timestamp': datetime(1, 1, 1),
                'rating': float(review_data[teacher]['rating'][0:3]),
                'version': 1
            })

reviews.insert_many(reviews_to_insert)
