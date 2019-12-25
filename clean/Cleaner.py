import os
import json
import re

from tabula import read_pdf


def semester_value(semester):
    year = int(semester[-4:])
    semester = semester[:-4]

    return year + (0.5 if semester == 'Fall' else 0)


def normalize(string):
    return ' '.join(re.split(r'\s+', re.sub(r'\s', ' ', string)))


HEADERS = {'code': ['course id', 'cuomdb', 'courseid'], 'name': ['title'], 'room': [], 'block': [], 'teacher': []}
DIRNAME = os.path.dirname(__file__)
DATA_PATH = os.path.join(DIRNAME, '..', 'data')
ANNOUNCERS = sorted((os.path.join(DATA_PATH, announcer_path) for announcer_path in
                     filter(lambda data_file: data_file.endswith('.pdf'), os.listdir(DATA_PATH))),
                    key=lambda announcer_path: semester_value(os.path.basename(announcer_path)[:-4]))


class Announcer:
    def __init__(self, path: str):
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
            normalized_header = normalize(raw_header)
            for HEADER in HEADERS:
                if (HEADER not in self.headers.values()) and \
                        (HEADER in normalized_header.lower() or any(alias in normalized_header.lower() for alias in HEADERS[HEADER])):
                    self.headers[raw_headers.index(raw_header)] = HEADER
                    break

    def __iter__(self):
        for page in self.pages:
            yield [
                {k: v for (k, v) in zip(
                    self.headers.values(),
                    (normalize(row[header_idx]['text']) for header_idx in self.headers.keys())
                )} for row in
                filter(
                    lambda row: any((normalize(cell['text']) != '' and idx in self.headers) for
                                    (idx, cell) in enumerate(row)),
                    (page['data'][1:] if (self.header_on_every_page or self.pages.index(page) == 0) else page['data'])
                )
            ]


class Cache:
    pass


class Context:
    def __init__(self, announcer: Announcer, page: iter, row: dict):
        self.announcer = announcer
        self.page = page
        self.row = row


class Cleaner:
    @classmethod
    def clean_announcer(cls, announcer: Announcer):
        for page in announcer:
            for row in page:
                for key in row:
                    ctx = Context(announcer, page, row)
                    clean = getattr(cls, 'clean_' + key, lambda _, x: x)
                    row[key] = clean(ctx, row[key])
                yield row

    @staticmethod
    def clean_teacher(ctx: Context, teacher: str):
        # Last, First
        match = re.match(r'([A-z- ]+), ([A-z]+)', teacher)
        if match:
            last, first = match.groups()
            return first.capitalize() + ' ' + last.capitalize()

        # Last, F.
        match = re.match(r'([A-z- ]+), ([A-Z]).', teacher)
        if match:
            last, first_initial = match.groups()
            return first_initial + ' ' + last

        # Staff A-Z
        match = re.match(r'Staff[ -]([A-Z])', teacher)
        if match:
            undetermined_id = match.groups()
            return undetermined_id

        # Last
        match = re.match(r'([A-z- ]+)', teacher)
        if match:
            last = match.groups()
            return last

        # Fallback
        print(ctx.announcer.name, ctx.row)

        return teacher
