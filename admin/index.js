const API_URL = 'http://localhost:8080';
const SITE_URL = 'http://localhost:8000';
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
                        .selectAll('td')
                        .data(d => Object.entries(d))
                        .enter().append('td')
                        .attr('class', d => 'mdl-data-table__cell--non-numeric '.concat(d[0]))
                        .text(d => d[1]);

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
                        .call(reviewCells => {
                            graphQLFetch(TOKEN, FIND_REVIEWS_BY_IDS, { ids: reviewCells.nodes().map(node => node.innerText) })
                                .then(res => res.json())
                                .then(json => {
                                    const data = json.data;

                                    reviewCells
                                        .data(data.findManyReview.sort((a, b) =>
                                            reviewCells.nodes().findIndex(node => node.innerText === a._id) -
                                            reviewCells.nodes().findIndex(node => node.innerText === b._id))
                                        )
                                        .text('')
                                        .call(reviewCells => reviewCells.selectAll('p')
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
                                        .call(reviewCells => reviewCells.append('a')
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
