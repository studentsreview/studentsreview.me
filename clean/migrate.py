from pymongo import MongoClient
import string

def slugify(x):
    return '-'.join(x.translate(str.maketrans('', '', string.punctuation)).split()).lower()

client = MongoClient('mongodb://localhost:27017/')
db = client['StudentsReview']

reviews = db['reviews']

for review in reviews.find({'version': 0}):
    reviews.update({'_id': review['_id']}, {
        'teacher': review['Teacher'],
        'teacherKey': slugify(review['Teacher']),
        'text': review['Text'],
        'timestamp': review['Timestamp'],
        'rating': review['Rating'],
        'version': review['version']
    })
