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
        const resultDiv = createElement('div', {class: "mt-3 w-75 mx-auto h-auto",id: 'data-container'});


        actionContainer.appendChild(table);
        buttonContainer.appendChild(addRowButton);
        buttonContainer.appendChild(createButton);
        actionContainer.appendChild(buttonContainer);
        actionContainer.appendChild(resultDiv);

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
                        id: parseInt(inputs[0].value) || null,
                        name: inputs[1].value || '',
                        age: parseInt(inputs[2].value) || null,
                        major: inputs[3].value || '',
                        enrolled: inputs[4].checked || false,
                    };
                });

            try {
                const response = await fetch('/students-create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(students),
                });

                if (response.ok) {
                    const resp = await fetch(`/students`, { method: 'GET' });
                    if (resp.ok) {
                        const updatedStudents = await resp.json();
                        renderTable(updatedStudents);
                        alert('Students created successfully!');
                    } else {
                        alert('Failed to fetch updated students.');
                    }
                } else {
                    alert('Failed to create students.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    if (action === 'read') {
        const filterInput = createElement('input', { class: "my-3 w-50 mx-auto form-control", placeholder: 'Enter filter as JSON' });
        const readButton = createElement('button', {class: 'btn btn-secondary'}, 'Read Students');
        const resultDiv = createElement('div', {class: "mt-3 w-75 mx-auto h-auto",id: 'data-container'});

        actionContainer.appendChild(filterInput);
        actionContainer.appendChild(readButton);
        actionContainer.appendChild(resultDiv);

        readButton.addEventListener('click', async () => {
            try {
                const filter = filterInput.value || '{}';
                const response = await fetch(`/students`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ filter: filter })
                });

                const students = await response.json();
                renderTable(students);
            } catch (err) {
                console.log(err)
                alert('Invalid filter or request failed.');
            }
        });
    }

    if (action === 'update') {
        const resultDiv = createElement('div', {class: "mt-3 w-75 mx-auto h-auto", id: 'data-container'});
        const filterInput = createElement('textarea', { class: "my-3 w-50 mx-auto form-control", placeholder: 'Enter filter as JSON' });
        const updateButton = createElement('button', {class: 'btn btn-secondary'}, 'Find Students');
        const updateTable = createElement('div', {});

        actionContainer.appendChild(filterInput);
        actionContainer.appendChild(updateButton);
        actionContainer.appendChild(updateTable);
        actionContainer.appendChild(resultDiv)

        updateButton.addEventListener('click', async () => {
            try {
                const filter = filterInput.value || '{}';
                const response = await fetch(`/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filter: filter })
                });
                const students = await response.json();

                updateTable.innerHTML = '';
                if(students.length === 0){
                    updateTable.innerHTML = '<h3 class="mt-4">There is no student data by your filter!</h3>'
                }
                else {
                    students.forEach(student => {
                    const checkbox = createElement('input', {
                        type: 'checkbox',
                        class: 'my-3 me-3 p-2 rounded-1',
                        id: 'enroll'
                    });
                    checkbox.checked = !!student.enrolled

                    const updateBtn = createElement('button', {
                        class: 'btn btn-outline-success ms-2'
                    }, 'Update');

                    updateBtn.addEventListener('click', async () => {
                        student.name = row.querySelector('input#name').value;
                        student.age = parseInt(row.querySelector('input#age').value, 10);
                        student.major = row.querySelector('input#major').value;
                        student.enrolled = row.querySelector('input#enroll').checked;

                        delete student._id;

                        const updateResponse = await fetch(`/students/${student.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(student)
                        });

                        if (updateResponse.ok) {
                            const updatedStudent = await updateResponse.json();
                            alert(`Student ${updatedStudent.name} updated successfully!`);
                            const resp = await fetch('/students', {method: 'GET'});
                            const updatedStudents = await resp.json();
                            renderTable(updatedStudents)
                        } else {
                            alert('Failed to update student.');
                        }
                    });

                    const row = createElement('div', {},
                        createElement('input', { type: 'text', value: student.name, class: 'my-3 me-3 p-2 rounded-1', id: "name" }),
                        createElement('input', { type: 'number', value: student.age, class: 'my-3 me-3 p-2 rounded-1', id: "age" }),
                        createElement('input', { type: 'text', value: student.major, class: 'my-3 me-3 p-2 rounded-1', id: "major" }),
                        createElement('label', { for: 'enrolled', class: 'form-label me-2'}, 'Enrolled:'),
                        checkbox,
                        updateBtn
                    );

                    updateTable.appendChild(row);
                });
                }
            } catch (err) {
                alert('Failed to find students.');
            }
        });

    }

    if (action === 'delete') {
        const resultDiv = createElement('div', {class: "mt-3 w-75 mx-auto h-auto", id: 'data-container'});
        const idInput = createElement('input', { class: 'form-control w-50 me-3', type: 'number', placeholder: 'Enter ID to delete' });
        const deleteButton = createElement('button', {class: 'btn btn-outline-danger'}, 'Delete Student');
        const divContainer = createElement('div', {class: 'd-flex justify-content-center mt-4'})

        actionContainer.appendChild(resultDiv);
        divContainer.appendChild(idInput);
        divContainer.appendChild(deleteButton);
        actionContainer.appendChild(divContainer)

        getList();

        deleteButton.addEventListener('click', async () => {
            const id = parseInt(idInput.value, 10);
            if (isNaN(id) || id < 0) {
                alert('Please enter a valid student ID.');
                return;
            }

            try {
                const response = await fetch(`/students/${id}`, { method: 'DELETE' });
                if (response.ok) {
                    await getList();
                    alert('Student deleted successfully!');
                } else if (response.status === 404) {
                    alert('Student not found.');
                } else {
                    alert('Failed to delete student.');
                }
            } catch (err) {
                console.error('Error deleting student:', err);
                alert('An error occurred while deleting the student.');
            }
        });

        async function getList(){
            const resp = await fetch('/students', {method: 'GET'})
            const list = await resp.json();
            renderTable(list)
        }
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

async function isIdExists(id){
    try {
        const response = await fetch(`/isIdExists?id=${id}`);
        if (response.ok) {
            const result = await response.json();
            return result.result;
        } else {
            console.error(`Failed to check ID existence: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.error('Error in isIdExists:', error);
        return false;
    }
}