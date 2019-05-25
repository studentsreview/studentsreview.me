import os
import json
from tabula import read_pdf

from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017/')
db = client['StudentsReview']
classes = db['classes']

classes.drop()

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

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
for announcer in os.listdir(data_path):
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
        if alias not in ['Course Code', 'Course Name', 'Room', 'Block', 'Teacher']:
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
    data['Fall2014'][x]['Room'] = 'Library'

for x in range(301, 303):
    data['Spring2015'][x]['Teacher'] = 'Matthew Bell'

data['Fall2015'][400]['Teacher'] = 'Julian Pollak'

for semester in data:
    for class_ in data[semester]:
        if class_['Course Name'] == 'CHIN151A':
            class_['Course Name'] = 'Chinese 1'

        if any(test.lower() in class_['Course Name'].lower() for test in ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Math']):
            class_['Department'] = 'Math'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['Computer']):
            class_['Department'] = 'Computer Science'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['Novel', 'Lit', 'English', 'Writing', 'Fiction', 'Epic', 'Satire']):
            class_['Department'] = 'English'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['Bio', 'Chemistry', 'Physics', 'Physiology', 'Geology', 'Science']):
            class_['Department'] = 'Science'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['History', 'Studies', 'Economics', 'Psychology', 'Democracy', 'Geography']):
            class_['Department'] = 'Social Science'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['Chinese', 'Japanese', 'Korean', 'Spanish', 'Italian', 'Latin', 'Hebrew', 'French']):
            class_['Department'] = 'Foreign Language'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['Band', 'Ceramics', 'Photography', 'Video', 'Drama', 'Art', 'Guitar', 'Piano', 'Orchestra', 'Music', 'Theater']):
            class_['Department'] = 'Visual Performing Arts'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['PE', 'Swimming', 'Basketball', 'Sports', 'Training', 'Soccer', 'Yoga', 'Dance']):
            class_['Department'] = 'Physical Education'
        elif any(test.lower() in class_['Course Name'].lower() for test in ['JROTC']):
            class_['Department'] = 'JROTC'
        else:
            class_['Department'] = 'Miscellaneous'

        if class_['Teacher'] == 'Chan':
            if class_['Department'] == 'Visual Performing Arts':
                class_['Teacher'] = 'Jason Chan'
            elif class_['Department'] == 'Math':
                class_['Teacher'] = 'Tom Chan'

        if class_['Teacher'] == 'Yu Li':
            if class_['Department'] == 'Math':
                class_['Teacher'] = 'Ernest Li'

        if class_['Course Name'] == 'AP Enivronmental Science':
            class_['Course Name'] = 'AP Environmental Science'

        class_['Semester'] = semester
        classes.insert_one(class_)
