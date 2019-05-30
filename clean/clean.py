import os
import json
import string
from datetime import datetime
from tabula import read_pdf

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['StudentsReview']
classes = db['classes']
reviews = db['reviews']
teachers = db['teachers']

classes.delete_many({})
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
    'Fall2019': True
}

def slugify(x):
    return '-'.join(x.translate(str.maketrans('', '', string.punctuation)).split()).lower()

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
for announcer in os.listdir(data_path):
    if announcer == 'teachers.json':
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
        if alias not in ['courseCode', 'courseName', 'room', 'block', 'teacher']:
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

for x in range(234, 242):
    data['Fall2014'][x]['room'] = 'Library'

for x in range(301, 303):
    data['Spring2015'][x]['teacher'] = 'Matthew Bell'

data['Fall2015'][400]['teacher'] = 'Julian Pollak'

for semester in data:
    for class_ in data[semester]:
        if class_['courseName'] == 'CHIN151A':
            class_['courseName'] = 'Chinese 1'

        if any(test.lower() in class_['courseName'].lower() for test in ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Math']):
            class_['department'] = 'Math'
        elif any(test.lower() in class_['courseName'].lower() for test in ['Computer']):
            class_['department'] = 'Computer Science'
        elif any(test.lower() in class_['courseName'].lower() for test in ['Novel', 'Lit', 'English', 'Writing', 'Fiction', 'Epic', 'Satire', 'Shakespeare']):
            class_['department'] = 'English'
        elif any(test.lower() in class_['courseName'].lower() for test in ['Bio', 'Chemistry', 'Physics', 'Physiology', 'Geology', 'Science']):
            class_['department'] = 'Science'
        elif any(test.lower() in class_['courseName'].lower() for test in ['History', 'Studies', 'Economics', 'Psychology', 'Democracy', 'Geography']):
            class_['department'] = 'Social Science'
        elif any(test.lower() in class_['courseName'].lower() for test in ['Chinese', 'Japanese', 'Korean', 'Spanish', 'Italian', 'Latin', 'Hebrew', 'French']):
            class_['department'] = 'Foreign Language'
        elif any(test.lower() in class_['courseName'].lower() for test in ['Band', 'Ceramics', 'Photography', 'Video', 'Drama', 'Art', 'Guitar', 'Piano', 'Orchestra', 'Music', 'Theater']):
            class_['department'] = 'Visual Performing Arts'
        elif any(test.lower() in class_['courseName'].lower() for test in ['PE', 'Swimming', 'Basketball', 'Sports', 'Training', 'Soccer', 'Yoga', 'Dance']):
            class_['department'] = 'Physical Education'
        elif any(test.lower() in class_['courseName'].lower() for test in ['JROTC']):
            class_['department'] = 'JROTC'
        else:
            class_['department'] = 'Miscellaneous'

        if class_['teacher'] == 'Chan':
            if class_['department'] == 'Visual Performing Arts':
                class_['teacher'] = 'Jason Chan'
            elif class_['department'] == 'Math':
                class_['teacher'] = 'Tom Chan'

        if class_['teacher'] == 'Yu Li':
            if class_['department'] == 'Math':
                class_['teacher'] = 'Ernest Li'

        if class_['courseName'] == 'AP Enivronmental Science':
            class_['courseName'] = 'AP Environmental Science'

        class_['semester'] = semester
        class_['teacherKey'] = slugify(class_['teacher'])
        class_['courseKey'] = slugify(class_['courseName'])
        classes.insert_one(class_)

with open(os.path.join(os.path.dirname(__file__), '..', 'data', 'teachers.json')) as reviews_file:
    review_data = json.load(reviews_file)
    for teacher in review_data:
        for review in review_data[teacher]['reviews']:
            reviews.insert_one({
                'teacher': teacher,
                'teacherKey': slugify(teacher),
                'text': review,
                'timestamp': datetime(1, 1, 1),
                'rating': float(review_data[teacher]['rating'][0:3]),
                'version': 1
            })
