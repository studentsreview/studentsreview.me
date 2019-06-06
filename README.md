## studentsreview.me

[![Netlify Status](https://api.netlify.com/api/v1/badges/6f288e0c-98f7-48cc-9230-4341464d90dc/deploy-status)](https://app.netlify.com/sites/confident-shockley-47fac1/deploys)

### Background

[studentsreview.me](https://studentsreview.me) is a teacher review web app for Lowell High School that restores all old teacher reviews from ratemyteachers.com.

#### Development

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

#### Stack

Frontend:

- Gatsby
- Material UI
- Apollo

Backend:

- Express
- Mongoose
- Graphql Compose

#### Custom Frontend Features

- Prefetching dynamic resources
  - Upon typing in or selecting a teacher's name from the dropdown, the website will fetch and write the dynamic data needed for the page into the Apollo cache to avoid elements flashing in after you're already on the page.
- Infinite scroll integrated with graphql-compose-pagination
  - Smooth infinite scrolling that allows initial data to load quickly but additional data to be accessed easily.
- Deterministic review linking
  - A 'Copy Link' feature for reviews copies the first 10 characters of a SHA-256 hash of the review's timestamp, text, and teacher so the subhash is deterministic across versions and instances while being sufficiently collision-free.
