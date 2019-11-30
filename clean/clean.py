import os
import json
import sys
from hashlib import sha256
from datetime import datetime
from tabula import read_pdf

from pymongo import MongoClient

client = MongoClient(sys.argv[1] if len(sys.argv) > 1 else 'mongodb://localhost:27017/StudentsReview')

db = client['StudentsReview']
courses = db['courses']
classes = db['classes']
reviews = db['reviews']
teachers = db['teachers']

courses.delete_many({})
classes.delete_many({})
teachers.delete_many({})
reviews.delete_many({
    'version': 1
})

with open(os.path.join(os.path.dirname(__file__), 'aliases.json')) as alias_file:
    aliases = json.load(alias_file)
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

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
for announcer in os.listdir(data_path):
    if announcer == 'teachers.json' or announcer == 'prerequisites.json':
        continue
    print(announcer)
    data[announcer[:-4]] = []
    pages = read_pdf(
        os.path.join(data_path, announcer),
        output_format='json',
        pages='all',
        guess=False,
        lattice=True
    )

    headers = []
    for header in pages[0]['data'][0]:
        alias = aliases.get(header['text'])
        if alias is None:
            alias = input(f'{header["text"]}:')
            aliases[header['text']] = alias
            with open(os.path.join(os.path.dirname(__file__), 'aliases.json'), 'w') as alias_file:
                json.dump(aliases, alias_file)
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
                header = headers[row.index(cell)]
                if header:
                    alias = aliases.get(cell['text'])
                    if alias is None:
                        alias = input(f'{ cell["text"] }:')
                        # allows for fixing the file without reloading everything
                        with open(os.path.join(os.path.dirname(__file__), 'aliases.json')) as alias_file:
                            aliases = json.load(alias_file)
                        aliases[cell['text']] = alias
                        with open(os.path.join(os.path.dirname(__file__), 'aliases.json'), 'w') as alias_file:
                            json.dump(aliases, alias_file)
                    if cell['width'] == 0:
                        alias = aliases.get(f'{ announcer }{ pages.index(page) }{ page["data"].index(row) }{ row.index(cell) }')
                        if alias is None:
                            alias = input(f'truncated:')
                            aliases[f'{ announcer }{ pages.index(page) }{ page["data"].index(row) }{ row.index(cell) }'] = alias
                            with open(os.path.join(os.path.dirname(__file__), 'aliases.json'), 'w') as alias_file:
                                json.dump(aliases, alias_file)
                    data[announcer[:-4]][-1][header] = alias
            if all(field == '' for field in data[announcer[:-4]][-1].values()) or all(x == y for (x, y) in data[announcer[:-4]][-1].items()):
                data[announcer[:-4]].remove(data[announcer[:-4]][-1])

# misc. fixes

for x in range(234, 242):
    data['Fall2014'][x]['room'] = 'Library'

for x in range(301, 303):
    data['Spring2015'][x]['teacher'] = 'Matthew Bell'

data['Fall2015'][400]['teacher'] = 'Julian Pollak'

for i in range(len(data['Fall2019'])):
    class_ = data['Fall2019'][i]
    if class_['teacher'] == 'Undetermined':
        print(i, class_)

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
        elif any(test in class_['name'] for test in ['History', 'Studies', 'Economics', 'Psychology', 'Democracy', 'Geography', 'Politics']):
            department = 'Social Science'
        elif any(test in class_['name'] for test in ['Band', 'Ceramics', 'Photography', 'Video', 'Drama', 'Art', 'Guitar', 'Piano', 'Orchestra', 'Music', 'Theater']):
            department = 'Visual Performing Arts'
        elif any(test in class_['name'] for test in ['PE', 'Swimming', 'Basketball', 'Sports', 'Weight', 'Soccer', 'Yoga', 'Dance']):
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

        if class_['name'] == 'CHIN151A':
            class_['name'] = 'Chinese 1'

        if class_['teacher'] == 'Yu Li':
            if department == 'Math':
                class_['teacher'] = 'Ernest Li'

        if class_['name'] == 'AP Enivronmental Science':
            class_['name'] = 'AP Environmental Science'

        class_['semester'] = semester
        classes_to_insert.append(class_)

        try:
            teacher = next(teacher for teacher in teachers_to_insert if teacher['name'] == class_['teacher'])
            if department not in teacher['departments']:
                teacher['departments'].append(department)
                if len(teacher['departments']) > 1 and 'Miscellaneous' in teacher['departments']:
                    teacher['departments'].remove('Miscellaneous')
            if class_['semester'] not in teacher['semesters']:
                teacher['semesters'].append(class_['semester'])
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
                'semesters': [class_['semester']]
            })

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'prerequisites.json')) as prerequisites_file:
    prerequisites_data = json.load(prerequisites_file)
    for course in courses_to_insert:
        course['prerequisites'] = prerequisites_data.get(course['name'], [])

courses.insert_many(courses_to_insert)
classes.insert_many(classes_to_insert)
teachers.insert_many(teachers_to_insert)

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
