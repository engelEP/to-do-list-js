(function () {
    const module = {
        apiKey: "7b535fab-0d93-420a-ab09-18a93fb357de",
        url: "https://todos.simpleapi.dev/api/",
        homeUrl: "/",
        loginUrl: "/pages/login.html",
        signUpUrl: "/pages/singUp.html",
        list: [],
        init: function () {

            this.cacheDOM();
            this.bindingEvents();

            if(localStorage.getItem("userData")){

                if(window.location.pathname !== this.homeUrl){
                    window.location.href = this.homeUrl;   
                }

                const { name } = JSON.parse(localStorage.getItem('userData'));

                this.todoUser.innerHTML = name;
                this.checkMode.checked = this.getMode();
                this.changeMode(this.checkMode.checked);
                this.loadTask();

            } else if(![this.loginUrl, this.signUpUrl].includes(window.location.pathname)) {
                
                window.location.href = this.loginUrl;

            }
        },
        cacheDOM: function () {

            switch (window.location.pathname) {
                
                case this.homeUrl:

                    this.buttonAddTask = document.getElementById('button-add-task');
                    this.inputTask = document.getElementById('input-task');
                    this.listContainer = document.getElementById('list-container');
                    this.checkMode = document.getElementById('switchCheck');
                    this.typeButton = document.querySelector('#button-add-task span');
                    this.count = document.getElementById('count-todo');
                    this.mode = document.getElementById('mode');
                    this.saveButton = document.querySelector('#button-add-task span');
                    this.logoutButton = document.getElementById('button-logout');
                    this.todoUser = document.getElementById('todo-user');
                    
                    break;
                
                case this.loginUrl:

                    this.formLogin = document.getElementById('form-login');
                    this.emailLogin = document.getElementById('input-email-login');
                    this.passwordLogin = document.getElementById('input-password-login');
                
                    break;

                case this.signUpUrl:

                    this.formSignUp = document.getElementById('form-signUp');
                    this.nameSignUp = document.getElementById('input-name-signUp');
                    this.emailSignUp = document.getElementById('input-email-signUp');
                    this.passwordSignUp = document.getElementById('input-password-signUp');

                    break;

                default:
                    break;
            }

        },
        handlerButton: async function () {
            const editId = parseInt(this.listContainer.getAttribute('data-id'));
            if(editId){
                const inputTaskEdit = document.querySelector(`li[data-id="${editId}"] .ToDoList-input`);

                if(inputTaskEdit.value){
                    const text = document.querySelector(`li[data-id="${editId}"] .ToDoList-text`);
                    const todo = {
                        description: inputTaskEdit.value,
                        completed: document.querySelector(`li[data-id="${editId}"] .ToDoList-checkBox`).checked,
                    }

                    this.updateTask(editId, todo);
                    this.typeButton.innerHTML = "Submit";
    
                    text.innerHTML = inputTaskEdit.value;
                    inputTaskEdit.value = "";
                    this.inputTask.disabled = false;
    
                    this.resetEditStyle(editId);
                    this.listContainer.dataset.id = "";
                    this.inputTask.focus();
                }

                return;
            }

            if(this.inputTask.value){

                const newTask = await this.setTask(this.inputTask.value);

                if(newTask){
                    this.listContainer.appendChild(this.createTask(newTask, this.listContainer));
                    this.inputTask.value = "";
                    this.countTodo();
                }
            }  
        },
        bindingEvents: function () {

            switch (window.location.pathname) {

                case this.homeUrl:
                    
                    this.buttonAddTask.addEventListener('click', () => {
                        this.handlerButton();
                    });
        
                    this.inputTask.addEventListener('keypress', (e) => {
                        if(e.key === "Enter"){
                            this.handlerButton();
                        }
                    });
        
                    this.listContainer.addEventListener('keypress', (e) => {
                        if(e.key === "Enter"){
                            this.handlerButton();
                        }
                    });
        
                    this.checkMode.addEventListener('change', () => {
                        this.changeMode(this.checkMode.checked);
                        this.setMode(this.checkMode.checked);
                    });
                    
                    window.addEventListener('keypress', (e) => {
                        if(e.key === "Enter"){
                            this.inputTask.focus();
                        }
                    });

                    this.logoutButton.addEventListener('click', () => {
                        
                        this.logout();

                    });

                    break;
                case this.loginUrl:

                    this.formLogin.addEventListener('submit', (e) => {
                        e.preventDefault();
                        if(this.emailLogin.value && this.passwordLogin.value){
                            this.login(this.emailLogin.value, this.passwordLogin.value);
                        }
                    });

                    break;

                case this.signUpUrl:

                    this.formSignUp.addEventListener('submit', (e) => {
                        e.preventDefault();

                        if(this.nameSignUp.value && this.emailSignUp.value  && this.passwordSignUp.value){

                            this.signUp(this.nameSignUp.value, this.emailSignUp.value, this.passwordSignUp.value);
                            
                        }
                    });

                    break;
                    
                default:
                    break;
            }
        },
        createTask: function ({id, description, completed}) {

            const item = document.createElement('li');
            const containerTask = document.createElement('div');
            const checkBox = document.createElement('input');
            const text = document.createElement('p');
            const editInput = document.createElement('input');
            const containerControls = document.createElement('div');
            const buttonEdit = document.createElement('button');
            const buttonDelete = document.createElement('button');
            const iconEdit = document.createElement('i');
            const iconDelete = document.createElement('i');
        
            item.className = "ToDoList-task";
        
            containerTask.className = "col-9 d-flex";
            checkBox.type = "checkbox";
            checkBox.className = "ToDoList-checkBox form-check-input rounded-circle";
            checkBox.checked = completed;
            text.className = "ToDoList-text";
            editInput.className = "ToDoList-input edit d-none";
        
            containerControls.className = "ToDoList-controls col-3";
            buttonEdit.className = "Button Button-edit";
            iconEdit.className = "fa-solid fa-pen-to-square";
            buttonDelete.className = "Button Button-delete";
            iconDelete.className = "fa-solid fa-trash";
            
            text.innerHTML = description;
        
            containerTask.appendChild(checkBox);
            containerTask.appendChild(text);
            containerTask.appendChild(editInput);
            buttonEdit.appendChild(iconEdit);
            buttonDelete.appendChild(iconDelete);
            containerControls.append(buttonEdit);
            containerControls.appendChild(buttonDelete);
            item.appendChild(containerTask);
            item.appendChild(containerControls);
        
            item.dataset.id = id;

            checkBox.addEventListener('change', (e) => {
                const id = parseInt(e.target.closest('.ToDoList-task').getAttribute('data-id'));
                const todo = {
                    description: document.querySelector(`li[data-id="${id}"] .ToDoList-text`).innerHTML,
                    completed: document.querySelector(`li[data-id="${id}"] .ToDoList-checkBox`).checked,
                }
                this.updateTask(id, todo);
            });

            buttonDelete.addEventListener('click', (e) => {
                this.listContainer.removeChild(e.target.closest('.ToDoList-task'));
                this.deleteTask(parseInt(e.target.closest('.ToDoList-task').getAttribute('data-id')));
            });

            buttonEdit.addEventListener('click', (e) => {
                const id = e.target.closest('.ToDoList-task').getAttribute('data-id');
                const inputTaskEdit = document.querySelector(`li[data-id="${id}"] .ToDoList-input`);
                const text = document.querySelector(`li[data-id="${id}"] .ToDoList-text`);
                
                if(this.listContainer.getAttribute('data-id')){
                    this.resetEditStyle(this.listContainer.getAttribute('data-id'));
                }
        
                this.listContainer.dataset.id = id;
                inputTaskEdit.value = text.innerHTML;
                inputTaskEdit.dataset.id = id;
                
                this.addEditStyle(this.listContainer.getAttribute('data-id'));
                
                inputTaskEdit.focus();
                this.saveButton.innerHTML = "Save";
                this.inputTask.disabled = true;
            });

            return item
        },
        setTask: async function (newTodo) {  

            if(localStorage.getItem('userData')){

                const { id, token } = JSON.parse(localStorage.getItem('userData'));

                const newTask = {  
                    description: newTodo,
                    completed: false,
                    meta: {}
                };
    
                try {
                    const { data, status } = await axios.post(`${this.url}/users/${id}/todos?apikey=${this.apiKey}`, newTask, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
    
                    if(status === 200){
                        this.list = [...this.list, data];
                        return data;
                    }  
    
                } catch ({ message }) {
                    alert(message);
                }
            }
        },
        updateTask: async function (todoId, { description, completed }) {

            if(localStorage.getItem('userData')){

                const textTask = document.querySelector(`li[data-id="${todoId}"] .ToDoList-text`);
                const { id, token } = JSON.parse(localStorage.getItem('userData'));
    
                const todo = {
                    description,
                    completed,
                    meta: {},
                }
    
                try {   
                    const { status } = await axios.put(`${this.url}/users/${id}/todos/${todoId}?apikey=${this.apiKey}`, todo, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
    
                    if(status === 200){
    
                        const updateList = this.list.map((item) => {
    
                            if(item.id === id){
                                item.description = description;
                                item.completed = completed;
                            }
                            
                            return item;
                        });
    
                        this.list = updateList;
    
                        textTask.innerHTML = description;
                        
                    }
    
                } catch (error) {
                    alert(error);
                }

            }
        },
        deleteTask: async function (todoId) {
            if(localStorage.getItem('userData')){
                
                const { id, token } = JSON.parse(localStorage.getItem('userData'));

                try {
                    const { status }  = await axios.delete(`${this.url}/users/${id}/todos/${todoId}?apikey=${this.apiKey}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if(status === 200){

                        const newList = this.list.filter((item) => {
                            return item.id !== id;
                        });
    
                        this.list = newList;
    
                        this.countTodo();
                    }
    
                } catch (error) {
                    alert(error);
                }

            }
            
        },
        loadTask: async function () {

            if(localStorage.getItem('userData')){

                const { id, token } = JSON.parse(localStorage.getItem('userData'));
    
                try {
                    const { data, status } = await axios.get(`${this.url}/users/${id}/todos?apikey=${this.apiKey}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    if(status === 200){
                        this.list = data;
    
                        this.list?.forEach(element => {
                            this.listContainer.appendChild(this.createTask(element, this.listContainer));
                        });
                        
                        this.countTodo();
                    }
                    
                } catch (error) {
                    alert(error);
                }
            }

        },
        countTodo: function() {
            this.count.innerHTML = `(${this.list.length})`;
        },
        resetEditStyle: function (id) {
            const buttonDelete = document.querySelector(`li[data-id="${id}"] .Button-delete`);
            const inputTaskEdit = document.querySelector(`li[data-id="${id}"] .ToDoList-input`);
            const text = document.querySelector(`li[data-id="${id}"] .ToDoList-text`);
        
            inputTaskEdit.classList.add('d-none');
            text.classList.remove('d-none');
            buttonDelete.disabled = false;  
        },
        addEditStyle: function (id) {
            const buttonDelete = document.querySelector(`li[data-id="${id}"] .Button-delete`);
            const inputTaskEdit = document.querySelector(`li[data-id="${id}"] .ToDoList-input`);
            const text = document.querySelector(`li[data-id="${id}"] .ToDoList-text`);
        
            inputTaskEdit.classList.remove('d-none');
            text.classList.add('d-none');
            buttonDelete.disabled = true;
        },
        setMode: function (state) {
            localStorage.setItem("mode", state)
        },
        getMode: function () {
            return localStorage.getItem("mode") ? JSON.parse(localStorage.getItem("mode")) : false
        },
        changeMode: function (state) {
            state ? this.mode.classList.add('DarkMode') : this.mode.classList.remove('DarkMode');
        },
        login: async function (email, password) {

            const user = {
                email,
                password
            }

            try {
                const { request: { status }, data } = await axios.post(`${this.url}/users/login?apikey=${this.apiKey}`, user);

                if(status === 200){
                    localStorage.setItem("userData", JSON.stringify(data));
                    
                    if(window.location.pathname !== this.homeUrl){
                        window.location.href = this.homeUrl
                    }
                }
                
            } catch ({ response: { data: { message } } }) {
                alert(message);
            }

        },
        signUp: async function (name, email, password) {

            const user = {
                email,
                name,
                password
            }

            try {

                const { status } = await axios.post(`${this.url}/users/register?apikey=${this.apiKey}`, user);
                
                if(status === 200){
                    window.location.href = this.loginUrl;
                }
                
            } catch ({ response: { data: { message } } }) {
                alert(message);
            }

        },
        logout: async function () {

            if(localStorage.getItem('userData')){

                const { token } = JSON.parse(localStorage.getItem('userData'));

                try {
                    
                    const state = await axios.post(`${this.url}/users/logout?apikey=${this.apiKey}`, "", {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if(state){
                        localStorage.removeItem("userData");
                        window.location.href = this.loginUrl;
                    }
    
                } catch ({ response }) {
                    alert(response);
                }
            }
        }
    }
    module.init();
})()

