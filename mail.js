class ContactMessageManager {
    constructor() {
        this.firebaseConfig = {
            apiKey: "AIzaSyCU1c450z9faIaOAVFdPZxgmh0E8TXnHP4",
            authDomain: "projet-66c48.firebaseapp.com",
            databaseURL: "https://projet-66c48-default-rtdb.firebaseio.com",
            projectId: "projet-66c48",
            storageBucket: "projet-66c48.appspot.com",
            messagingSenderId: "935023142081",
            appId: "1:935023142081:web:7df2305a0fcf283e396040",
        };

        firebase.initializeApp(this.firebaseConfig);
        this.contactFormDB = firebase.database().ref("contactForm");
        this.bindEvents();
        this.fetchMessages();
    }

    bindEvents() {
        document.getElementById("addTaskBtn").addEventListener("click", () => {
            this.showForm();
        });
    }

    fetchMessages() {
        this.contactFormDB.on('value', snapshot => {
            this.updateMessagesTable(snapshot);
        });
    }

    updateMessagesTable(snapshot) {
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = '<tr><th>Completed</th><th>Task</th><th>Description</th><th>Due Date</th><th>Actions</th></tr>';

        snapshot.forEach(childSnapshot => {
            const { completed, task, description, dueDate } = childSnapshot.val();
            const messageId = childSnapshot.key;

            messagesList.innerHTML += `<tr id="${messageId}" class="${completed ? 'completed' : ''}">
                <td><div class="circle ${completed ? 'checked' : ''}" onclick="messageManager.toggleCompleted('${messageId}')"></div></td>
                <td>${task}</td>
                <td>${description}</td>
                <td>${dueDate}</td>
                <td>
                    <button class="btn btn-primary" onclick="messageManager.editMessage('${messageId}', '${task}', '${description}', '${dueDate}', ${completed})"><i class="ri-edit-2-fill"></i></button>
                    <button class="btn btn-danger" onclick="messageManager.deleteMessage('${messageId}')"><i class="ri-delete-bin-fill"></i></button>
                </td>
            </tr>`;
        });
    }

    toggleCompleted(id) {
        const messageRef = this.contactFormDB.child(id);
        messageRef.once('value', snapshot => {
            const { completed } = snapshot.val();
            messageRef.update({ completed: !completed });
        });
    }

    deleteMessage(id) {
        this.contactFormDB.child(id).remove();
    }

    editMessage(id, task, description, dueDate, completed) {
        this.showForm({ id, task, description, dueDate, completed });
    }

    async showForm(data = {}) {
        const { id, task = '', description = '', dueDate = '', completed = false } = data;

        const { value: formValues } = await Swal.fire({
            title: id ? 'Edit Task' : 'Add New Task',
            html:
                `<input id="swal-input-task" class="swal2-input" placeholder="Task" value="${task}">
                <textarea id="swal-input-description" class="swal2-textarea" placeholder="Description">${description}</textarea>
                <input type="date" id="swal-input-date" class="swal2-input" value="${dueDate}">`,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Submit',
            cancelButtonText: 'Cancel',
            preConfirm: () => {
                return [
                    document.getElementById('swal-input-task').value,
                    document.getElementById('swal-input-description').value,
                    document.getElementById('swal-input-date').value
                ];
            }
        });

        if (formValues) {
            const [task, description, dueDate] = formValues;
            if (id) {
                this.updateMessage(id, task, description, dueDate, completed);
            } else {
                this.saveMessage(task, description, dueDate);
            }
        }
    }

    saveMessage(task, description, dueDate) {
        const newContactForm = this.contactFormDB.push();
        newContactForm.set({
            task: task,
            description: description,
            dueDate: dueDate,
            completed: false
        });
    }

    updateMessage(id, task, description, dueDate, completed) {
        this.contactFormDB.child(id).update({
            task: task,
            description: description,
            dueDate: dueDate,
            completed: completed
        });
    }
}

const messageManager = new ContactMessageManager();
