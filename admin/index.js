const API_URL = 'http://localhost:8080';

const authenticationForm = d3.select('#authentication-form');
const passwordInput = d3.select('#password-input');

const reportsTable = d3.select('#reports-table');

authenticationForm
    .on('submit', () => {
        const e = d3.event;
        e.preventDefault();
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'authorization': passwordInput.node().value
            },
            body: JSON.stringify({
                query: `
                    query {
                        findManyReport {
                            timestamp
                            reason
                            review
                        } 
                    }
                `
            })
        })
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
                        .data(data.findManyReport)
                        .enter()
                        .append('tr')
                        .selectAll('td')
                        .data(d => Object.values(d))
                        .enter()
                        .append('td')
                        .text(d => d);
                }
            })
    });
