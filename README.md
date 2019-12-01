## studentsreview.me

[![Netlify Status](https://api.netlify.com/api/v1/badges/6f288e0c-98f7-48cc-9230-4341464d90dc/deploy-status)](https://app.netlify.com/sites/studentsreview/deploys)

### Development

Prerequisites:
- Python
- Node
- [MongoDB](https://docs.mongodb.com/manual/installation/)

Installation:

Use your favorite Node package manager to install dependencies in `server/` and `app/`.

Install Python dependencies with `pip3 install -r clean/requirements.txt`.

With MongoDB running, execute `python3 clean/clean.py`, this will process data from the `data/` folder and insert it into MongoDB.

Running:

Run `yarn dev` inside of `server/` to start the GraphQL server.

Run `yarn develop` inside of `app/` to start the Gatsby development server.
