import os
import json
from tabula import read_pdf

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
            else:
                with open(os.path.join(os.path.dirname(__file__), 'data.json'), 'w') as data_file:
                    json.dump(data, data_file)
                print(data[announcer[:-4]][-1])
