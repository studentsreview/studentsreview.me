import os
import json

from bs4 import BeautifulSoup

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')

with open(os.path.join(data_path, '2020_2021', '02.CourseDescriptions20202021.html')) as course_descriptions_raw_file:
    course_descriptions = BeautifulSoup(course_descriptions_raw_file.read(), 'html.parser')

with open(os.path.join(os.path.dirname(__file__), 'aliases.json')) as alias_file:
    aliases = json.load(alias_file)

aliased = aliases.values()

department_tables = course_descriptions.find_all('table')[1:]

course_description_data = {}

count = 0

for department_table in department_tables:
    row_index = 2
    trs = department_table.find_all('tr')
    while row_index < len(trs):
        tr = trs[row_index]
        tds = tr.find_all('td')
        next_td = trs[row_index + 1].find('td')
        description = None
        row_index += 1
        while trs[row_index].find('td')['colspan'] != '5':
            row_index += 1
        if tds[0].text in aliased:
            name = tds[0].text
        elif aliases.get(tds[0].text) is not None:
            name = aliases[tds[0].text]
        else:
            name = input(tds[0].text + ': ')
            aliases[tds[0].text] = name
        if len(name) == 0:
            name = str(count) + ' CHANGE ME'
            count += 1
        course_description_data[name] = {
            'description': trs[row_index].text,
            'length': tds[1].text,
            'grades': tds[2].text,
            'A-G': tds[3].text,
            'notes_prerequisites': tds[4].text
        }
        row_index += 1


with open(os.path.join(os.path.dirname(__file__), 'aliases.json'), 'w') as alias_file:
    json.dump(aliases, alias_file)

with open(os.path.join(data_path, 'course_descriptions.json'), 'w') as course_descriptions_data_file:
    json.dump(course_description_data, course_descriptions_data_file)
