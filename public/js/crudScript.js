function createElement(tag, attributes = {}, ...children) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else {
            element.appendChild(child);
        }
    });
    return element;
}

// Initialize UI
const app = document.getElementById('app');
const select = createElement('select', {class: 'form-select w-50 mx-auto'},
    createElement('option', { value: ''}, 'Choose'),
    createElement('option', { value: 'create' }, 'Create'),
    createElement('option', { value: 'read' }, 'Read'),
    createElement('option', { value: 'update' }, 'Update'),
    createElement('option', { value: 'delete' }, 'Delete')
);
const actionContainer = createElement('div', { class: 'text-center', id: 'actionContainer' });

app.appendChild(select);
app.appendChild(actionContainer);

// Event listener for select change
select.addEventListener('change', () => {
    actionContainer.innerHTML = '';
    const action = select.value;

    if (action === 'create') {
        const table = createElement('table', {},
            createElement('thead', {},
                createElement('tr', {},
                    createElement('th', {}, 'ID'),
                    createElement('th', {}, 'Name'),
                    createElement('th', {}, 'Age'),
                    createElement('th', {}, 'Major'),
                    createElement('th', {}, 'Enrolled')
                )
            ),
            createElement('tbody', {},
                createElement('tr', {},
                    createElement('td', {}, createElement('input', { type: 'number', name: 'id' })),
                    createElement('td', {}, createElement('input', { type: 'text', name: 'name' })),
                    createElement('td', {}, createElement('input', { type: 'number', name: 'age' })),
                    createElement('td', {}, createElement('input', { type: 'text', name: 'major' })),
                    createElement('td', {}, createElement('input', { type: 'checkbox', name: 'enrolled' }))
                )
            )
        );
        const buttonContainer = createElement('div', { class: 'd-flex justify-content-between mt-3' })
        const addRowButton = createElement('button', {class: 'btn btn-secondary'}, 'Add Row');
        const createButton = createElement('button', {class: 'btn btn-outline-success'}, 'Create Students');

        actionContainer.appendChild(table);
        buttonContainer.appendChild(addRowButton);
        buttonContainer.appendChild(createButton);
        actionContainer.appendChild(buttonContainer);

        addRowButton.addEventListener('click', () => {
            const tbody = table.querySelector('tbody');
            const newRow = table.querySelector('tbody tr').cloneNode(true);
            tbody.appendChild(newRow);
        });

        createButton.addEventListener('click', async () => {
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            const students = rows.map(row => {
                const inputs = row.querySelectorAll('input');
                return {
                    id: parseInt(inputs[0].value),
                    name: inputs[1].value,
                    age: parseInt(inputs[2].value),
                    major: inputs[3].value,
                    enrolled: inputs[4].checked
                };
            });

            const response = await fetch('/students-create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(students),
            });

            if (response.ok) {
                alert('Students created successfully!');
            } else {
                alert('Failed to create students.');
            }
        });
    }

    if (action === 'read') {
        const filterInput = createElement('textarea', { class: "my-3 w-50 mx-auto form-control", placeholder: 'Enter filter as JSON' });
        const readButton = createElement('button', {class: 'btn btn-secondary'}, 'Read Students');
        const resultDiv = createElement('div', {class: "mt-3 w-75 mx-auto",id: 'data-container'})

        actionContainer.appendChild(filterInput);
        actionContainer.appendChild(readButton);
        actionContainer.appendChild(resultDiv);

        readButton.addEventListener('click', async () => {
            try {
                let response = ''
                if(filterInput.value === '') {
                    response = await fetch(`/students`, {method: 'GET'});
                } else {
                    response = await fetch(`/students`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json', // Specify the content type
                        },
                        body: JSON.stringify({ filter: filterInput.value })
                    });
                }

                const students = await response.json();
                renderTable(students);
            } catch (err) {
                console.log(err)
                alert('Invalid filter or request failed.');
            }
        });
    }

    if (action === 'update') {
        const filterInput = createElement('textarea', { class: "my-3 w-50 mx-auto form-control", placeholder: 'Enter filter as JSON' });
        const updateButton = createElement('button', {class: 'btn btn-secondary'}, 'Find Students');
        const updateTable = createElement('div', {});

        actionContainer.appendChild(filterInput);
        actionContainer.appendChild(updateButton);
        actionContainer.appendChild(updateTable);

        updateButton.addEventListener('click', async () => {
            try {
                const filter = JSON.parse(filterInput.value || '{}');
                const response = await fetch(`/students?${new URLSearchParams(filter)}`);
                const students = await response.json();

                updateTable.innerHTML = '';
                students.forEach(student => {
                    const row = createElement('div', {},
                        createElement('input', { type: 'text', value: student.name }),
                        createElement('input', { type: 'number', value: student.age }),
                        createElement('input', { type: 'text', value: student.major }),
                        createElement('button', {}, 'Update')
                    );
                    updateTable.appendChild(row);
                });
            } catch (err) {
                alert('Failed to find students.');
            }
        });
    }

    if (action === 'delete') {
        const idInput = createElement('input', { class: 'form-control w-50 me-3', type: 'text', placeholder: 'Enter ID to delete' });
        const deleteButton = createElement('button', {class: 'btn btn-outline-danger'}, 'Delete Student');
        const divContainer = createElement('div', {class: 'd-flex justify-content-center mt-4'})

        divContainer.appendChild(idInput);
        divContainer.appendChild(deleteButton);
        actionContainer.appendChild(divContainer)

        deleteButton.addEventListener('click', async () => {
            const id = idInput.value;
            const response = await fetch(`/students/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Student deleted successfully!');
            } else {
                alert('Failed to delete student.');
            }
        });
    }
});


function renderTable(data) {
    const container = document.getElementById('data-container');
    container.innerHTML = ''; // Clear previous content

    if (data.length === 0) {
        container.textContent = 'No data available.';
        return;
    }


    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Add table headers
    const headers = Object.keys(data[0]);
    const headerRow = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Add table rows
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);
}

const getFreeId = async () => {

};