var list = document.getElementById("student-list");
var form = document.getElementById("student-form");
var editingId = null;
var students = JSON.parse(localStorage.getItem("students")) || [];

function sub(event) {
    event.preventDefault();
    var skills = [];
    var boxes = document.querySelectorAll('input[name="skill"]:checked');
    for (var i = 0; i < boxes.length; i++) {
        skills.push(boxes[i].value);
    }
    var student = {
        id: Date.now(),
        name: document.getElementById("name").value,
        register: document.getElementById("register").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("number").value,
        department: document.getElementById("department").value,
        skills: skills,
        admissionDate: document.getElementById("admission-date").value
    };

    if (editingId === null) {
        students.push(student);
    } else {
        student.id = editingId;
        for (var j = 0; j < students.length; j++) {
            if (students[j].id === editingId) {
                students[j] = student;
            }
        }
        editingId = null;
        document.getElementById("submit-btn").textContent = "Submit";
    }

    localStorage.setItem("students", JSON.stringify(students));
    showStudents();
    form.reset();
}

function showStudents() {
    list.innerHTML = "";

    var searchText = document.getElementById("search").value.toLowerCase();
    var dept = document.getElementById("filter-department").value;

    var shown = 0;

    for (var i = 0; i < students.length; i++) {
        var s = students[i];

        var okName = s.name.toLowerCase().includes(searchText);
        var okDept = dept === "" || s.department === dept;

        if (okName && okDept) {
            shown++;
            list.innerHTML += `
                <tr>
                    <td>${s.register}</td>
                    <td>${s.name}</td>
                    <td>${s.email}</td>
                    <td>${s.phone}</td>
                    <td>${s.department}</td>
                    <td>${(s.skills || []).join(", ")}</td>
                    <td>${s.admissionDate}</td>
                    <td>
                        <button class="edit-btn" onclick="editStudent(${s.id})">Edit</button>
                        <button class="delete-btn" onclick="del(${s.id})">Delete</button>
                    </td>
                </tr>
            `;
        }
    }

    if (shown === 0) {
        var message = students.length === 0
            ? "No students yet. Add one using the form."
            : "No students match your search or filter.";
        list.innerHTML = `<tr><td colspan="8">${message}</td></tr>`;
    }
}

function del(id) {
    if (confirm("Delete this student?")) {
        students = students.filter(function (s) {
            return s.id !== id;
        });
        localStorage.setItem("students", JSON.stringify(students));
        showStudents();
    }
}

function editStudent(id) {
    var s = students.find(function (item) {
        return item.id === id;
    });

    document.getElementById("name").value = s.name;
    document.getElementById("register").value = s.register;
    document.getElementById("email").value = s.email;
    document.getElementById("number").value = s.phone;
    document.getElementById("department").value = s.department;
    document.getElementById("admission-date").value = s.admissionDate;

    var boxes = document.querySelectorAll('input[name="skill"]');
    for (var i = 0; i < boxes.length; i++) {
        boxes[i].checked = (s.skills || []).includes(boxes[i].value);
    }

    editingId = id;
    document.getElementById("submit-btn").textContent = "Update";
}

function cancelEdit() {
    editingId = null;
    document.getElementById("submit-btn").textContent = "Submit";
}

showStudents();