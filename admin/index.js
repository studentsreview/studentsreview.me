const API_URL = window.location.origin;
const SITE_URL = 'https://studentsreview.me';
let TOKEN;

String.prototype.capitalize = function () {
    let str = this;
    str = str.charAt(0).toUpperCase().concat(str.slice(1));
    return str;
};

String.prototype.slugify = function () {
    let str = this;
    str = str.split(' ').map(word => word.toLowerCase()).join('-');
    return str;
};


const authenticationForm = d3.select('#authentication-form');
const passwordInput = d3.select('#password-input');

const reportsTable = d3.select('#reports-table');
const snackBar = d3.select('.mdl-snackbar');

function graphQLFetch(token, query, variables) {
    return fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'authorization': token
        },
        body: JSON.stringify({ query, variables })
    })
}

const LOAD_REPORTS = `
    query {
        findManyReport {
            _id
            timestamp
            reason
            review
        } 
    }
`;

const FIND_REVIEWS_BY_IDS = `
    query($ids: [String]!) {
        findManyReview (
            filter: {
                _operators:{
      	            _id: {
                        in: $ids
                    }
                }
            }
        ) {
            _id
            timestamp
            text
            rating
            teacher
        }
    }
`;

const REMOVE_REPORT = `
    mutation($id: MongoID!) {
        reportRemoveById(_id: $id) {
            recordId
        }
    }
`;

const REMOVE_REVIEW = `
    mutation($id: MongoID!) {
        reviewRemoveById(_id: $id) {
            recordId
        }
    }
`;

const REPORT_ACTIONS = [
    { name: 'Dismiss Report', handler: target => {
        const report = target.parentNode.parentNode.parentNode;
        graphQLFetch(TOKEN, REMOVE_REPORT, { id: report.__data__._id })
            .then(resp => resp.json())
            .then(json => {
                if (!json.errors) {
                    d3.select(report).remove();
                    displayMessage('Success!');
                } else {
                    for (let error of json.errors) {
                        displayMessage(error.message);
                    }
                }
            });
    } },
    { name: 'Delete Review',  handler: target => {
        const report = target.parentNode.parentNode.parentNode;
        const review = target.parentNode.parentNode.parentNode.querySelector('.review');
        graphQLFetch(TOKEN, REMOVE_REPORT, { id: report.__data__._id })
            .then(resp => resp.json())
            .then(json => {
                if (!json.errors) {
                    return graphQLFetch(TOKEN, REMOVE_REVIEW, { id: review.__data__._id });
                } else {
                    for (let error of json.errors) {
                        displayMessage(error.message);
                    }
                }
            })
            .then(resp => resp.json())
            .then(json => {
                if (!json.errors) {
                    d3.select(report).remove();
                    displayMessage('Success!',);
                } else {
                    for (let error of json.errors) {
                        displayMessage(error.message);
                    }
                }
            });
    } }
];

function displayMessage(message) {
    snackBar.node().MaterialSnackbar.showSnackbar({
        message,
        timeout: 2500
    });
}

authenticationForm
    .on('submit', () => {
        const e = d3.event;
        e.preventDefault();
        TOKEN = passwordInput.node().value;
        graphQLFetch(TOKEN, LOAD_REPORTS)
            .then(resp => resp.json())
            .then(json => {
                d3.select(passwordInput.node().parentNode)
                    .selectAll('.mdl-textfield__error')
                    .data(json.errors || [])
                    .join('span')
                    .attr('class', 'mdl-textfield__error')
                    .style('visibility', 'visible')
                    .text(d => d.message);

                const data = json.data;

                if (data.findManyReport) {
                    authenticationForm.style('display', 'none');
                    reportsTable.style('display', 'block');
                    reportsTable
                        .select('tbody')
                        .selectAll('tr')
                        .data(data.findManyReport.sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp)))
                        .enter().append('tr')
                        .call(rows => rows.selectAll('td')
                            .data(d => Object.entries(d))
                            .enter().append('td')
                            .attr('class', d => 'mdl-data-table__cell--non-numeric '.concat(d[0]))
                            .text(d => d[1])
                        )
                        .call(rows => rows.append('td')
                            .append('div')
                            .attr('class', 'report-actions-div')
                            .selectAll('button')
                            .data(REPORT_ACTIONS)
                            .enter().append('button')
                            .attr('class', 'mdl-button mdl-js-button mdl-button--raised')
                            .text(d => d.name)
                            .on('click', function(d) { d.handler(this); })
                        );

                    reportsTable
                        .selectAll('.timestamp')
                        .text(d => (new Date(d[1])).toLocaleDateString());

                    reportsTable
                        .selectAll('.reason')
                        .text(d => ({
                            'inappropriate': 'Inappropriate / Hateful Content',
                            'uninformative': 'Uninformative / Unconstructive Content'
                        })[d[1]])

                    reportsTable
                        .selectAll('.review')
                        .call(cells => {
                            graphQLFetch(TOKEN, FIND_REVIEWS_BY_IDS, { ids: cells.nodes().map(node => node.innerText) })
                                .then(res => res.json())
                                .then(json => {
                                    const data = json.data;

                                    cells
                                        .data(data.findManyReview.sort((a, b) =>
                                            cells.nodes().findIndex(node => node.innerText === a._id) -
                                            cells.nodes().findIndex(node => node.innerText === b._id))
                                        )
                                        .text('')
                                        .call(cells => cells.selectAll('p')
                                            .data(d => Object.entries(d))
                                            .enter().append('p')
                                            .html(d => {
                                                switch(d[0]) {
                                                    case 'timestamp':
                                                        return `<b>Date: </b> ${ (new Date(d[1])).toLocaleDateString() }`;
                                                    case 'teacher':
                                                        return `<b>Teacher: </b><a
                                                        href="${ SITE_URL.concat('/teachers/').concat(d[1].slugify()) }"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >${ d[1] }</a>`;
                                                    case 'rating':
                                                        return `<b>Rating: </b> ${ d[1] } Stars`;
                                                    case 'text':
                                                        return `<b>Text: </b> ${ d[1].length > 150 ? d[1].slice(0, 150).concat('…') : d[1] }`;
                                                }
                                            })
                                        )
                                        .call(cells => cells.append('a')
                                            .attr('target', '_blank')
                                            .attr('rel', 'noopener noreferrer')
                                            .attr('href', d => SITE_URL.concat('/teachers/').concat(d.teacher.slugify()).concat('#')
                                                .concat(sha256(d.timestamp.concat(d.text).concat(d.teacher)).substr(0, 10))
                                            )
                                            .text('View Full Review')
                                        );
                                });
                        });
                }
            })
    });
