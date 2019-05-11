import os
import json
from tabula import read_pdf

with open('aliases.json') as alias_file:
    aliases = json.load(alias_file)
data = {}

data_path = os.path.join(os.path.dirname(__file__), '..', 'data')
for announcer in os.listdir(data_path):
    print(announcer)
    data[announcer[:-4]] = []
    pages = read_pdf(
        os.path.join(data_path, announcer),
        output_format='json',
        pages='all',
        guess=False
    )

    headers = []
    for header in pages[0]['data'][0]:
        alias = aliases.get(header['text'])
        if alias is None:
            alias = input(f'{header["text"]}:')
            aliases[header['text']] = alias
            with open('aliases.json', 'w') as alias_file:
                json.dump(aliases, alias_file)
        headers.append(alias)

    for page in pages:
        for row in page['data'][1:]:
            print(row)
            if len(list(filter(lambda x: x['text'] == '', row))) + 1 == len(row):
                continue
            data[announcer[:-4]].append({})
            for cell in row:
                header = headers[row.index(cell)]
                if header:
                    alias = aliases.get(cell['text'])
                    if alias is None:
                        alias = input(f'{ cell["text"] }:')
                        aliases[cell['text']] = alias
                        with open('aliases.json', 'w') as alias_file:
                            json.dump(aliases, alias_file)
                    data[announcer[:-4]][-1][header] = alias
                    with open('data.json', 'w') as data_file:
                        json.dump(data, data_file)
            print(data[announcer[:-4]][-1])
