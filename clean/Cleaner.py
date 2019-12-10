import os
import json
import re

from tabula import read_pdf


def semester_value(semester):
    year = int(semester[-4:])
    semester = semester[:-4]

    return year + (0.5 if semester == 'Fall' else 0)


HEADERS = {'code': ['id', 'cuomdb'], 'name': ['title'], 'room': [], 'block': [], 'teacher': []}
DIRNAME = os.path.dirname(__file__)
DATA_PATH = os.path.join(DIRNAME, '..', 'data')
ANNOUNCERS = sorted((os.path.join(DATA_PATH, announcer_path) for announcer_path in
                     filter(lambda data_file: data_file.endswith('.pdf'), os.listdir(DATA_PATH))),
                    key=lambda announcer_path: semester_value(os.path.basename(announcer_path)[:-4]))


class Announcer:
    def __init__(self, path):
        if not os.path.exists(os.path.join(DIRNAME, 'cache')):
            os.mkdir('cache')

        self.name = os.path.basename(path)[:-4]

        cache_path = os.path.join(DIRNAME, 'cache', self.name + '.json')

        if not os.path.exists(cache_path):
            with open(cache_path, 'w') as cache_file:
                self.pages = read_pdf(
                    path,
                    output_format='json',
                    pages='all',
                    guess=False,
                    lattice=True
                )
                json.dump(self.pages, cache_file)
        else:
            with open(cache_path) as cache_file:
                self.pages = json.load(cache_file)

        raw_headers = [cell['text'].strip() for cell in self.pages[0]['data'][0]]
        self.header_on_every_page = all(
            [cell['text'].strip() for cell in page['data'][0]] == raw_headers for page in self.pages)
        self.headers = {}

        for raw_header in raw_headers:
            for HEADER in HEADERS:
                if HEADER in raw_header.lower() or any(alias in raw_header.lower() for alias in HEADERS[HEADER]):
                    self.headers[raw_headers.index(raw_header)] = HEADER
                    break

        print(self.headers)

    def __iter__(self):
        for page in self.pages:
            yield [
                {k: v for (k, v) in zip(self.headers.values(), (
                    ' '.join(re.split(r'\s+', re.sub(r'\s', ' ', cell[0]))) for cell
                    in filter(lambda cell: cell[1] in self.headers,
                              ((row[i]['text'], i) for i in range(len(row))))
                ))} for row in
                (page['data'][1:] if (self.header_on_every_page or self.pages.index(page) == 0) else page['data'])
            ]


class Cleaner:
    @staticmethod
    def clean_announcer(announcer):
        pass

    @staticmethod
    def clean_teacher(ctx, teacher):
        pass


class Context:
    def __init__(self, row):
        self.row = row
