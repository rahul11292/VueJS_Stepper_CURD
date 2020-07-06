Vue.use(Vuetable);


Vue.component("step-navigation-step", {
    template: "#step-navigation-step-template",

    props: ["step", "currentstep"],


    computed: {
        indicatorclass() {
            return {
                active: this.step.id == this.currentstep,
                complete: this.currentstep > this.step.id
            };
        }
    }
});

Vue.component("step-navigation", {
    template: "#step-navigation-template",

    props: ["steps", "currentstep"],

});

Vue.component("step", {
    template: "#step-template",

    props: ["step", "stepcount", "currentstep", "user", "isedit", "idtoedit"],

    computed: {
        active() {
            return this.step.id == this.currentstep;
        },

        firststep() {
            return this.currentstep == 1;
        },

        laststep() {
            return this.currentstep == this.stepcount;
        },

        stepWrapperClass() {
            return {
                active: this.active
            };
        }
    },

    methods: {
        nextStep() {
            this.$emit("step-change", this.currentstep + 1);
        },

        lastStep() {
            this.$emit("step-change", this.currentstep - 1);
        },
        submit() {
            if (this.isedit) {
                this.$http.put('https://jsonplaceholder.typicode.com/users/' + this.idtoedit, this.user)
                    .then(
                        res => {
                            console.log(res, "Successfully EDITED")
                            this.ClearFields()
                            this.Toaster(res, "Successfully EDITED")

                        }, err => {
                            console.log("Error")
                        }
                    )
            } else {

                this.$http.post('https://jsonplaceholder.typicode.com/users', this.user)
                    .then(
                        res => {
                            console.log(res, "ADDED")
                            this.ClearFields()
                            this.Toaster(res, "Successfully ADDED")
                        }, err => {
                            console.log("Error")
                        }
                    )
            }


        },
        ClearFields() {
            this.$emit("currentstep", 1);
            this.$emit("iseditchange", false);
            this.$emit("idtoedit", null);
            this.user.name = ""
            this.user.email = ""
            this.user.username = ""
            this.user.address.street = ""
            this.user.address.suite = ""
            this.user.address.city = ""
            this.user.address.zipcode = null
            this.user.phone = null
            this.user.company.name = ""
            this.user.website = ''


        },
        Toaster(response, msg) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = `<h3>${msg}</h3> <h5>Response</h5><p class="response">${JSON.stringify(response.body)}</p>`
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
        }
    }
});

new Vue({
    el: "#app",
    components: {
        'vuetable-pagination': Vuetable.VuetablePagination
    },
    data: {

        currentstep: 1,
        fields: ['name', 'email', 'username', 'phone', 'company', 'address', 'website', '__slot:actions'],
        steps: [{
                id: 1,
                title: "Personal Details",
                icon_class: "fa fa-user-circle-o"
            },
            {
                id: 2,
                title: "Comapny Details",
                icon_class: "fa fa-th-list"
            }
        ],

        user: {
            name: "",
            username: "",
            email: "",
            address: {
                street: "",
                suite: "",
                city: "",
                zipcode: "",
            },
            phone: "",
            website: "",
            company: {
                name: "",
                catchPhrase: "Default",
                bs: "Default"
            }

        },

        isedit: false,
        idtoedit: null
    },

    methods: {
        stepChanged(step) {
            this.currentstep = step;
        },
        onPaginationData(paginationData) {
            this.$refs.pagination.setPaginationData(paginationData)
        },
        onChangePage(page) {
            this.$refs.vuetable.changePage(page)
        },
        editRow(rowData) {
            this.isedit = true
            this.currentstep = 1
            console.log(JSON.parse(JSON.stringify(rowData)))
            var editUserData = JSON.parse(JSON.stringify(rowData))
            this.idtoedit = editUserData.id
            this.user.name = editUserData.name
            this.user.email = editUserData.email
            this.user.username = editUserData.username
            this.user.address.street = editUserData.address.split(", ")[0]
            this.user.address.suite = editUserData.address.split(", ")[1]
            this.user.address.city = editUserData.address.split(", ")[2]
            this.user.address.zipcode = Number(editUserData.address.split(", ")[3].split("-").join(''))
            this.user.phone = editUserData.phone.split(' x')[0]
            this.user.company.name = editUserData.company
            this.user.website = editUserData.website

        },
        editChanged() {
            this.isedit = false;
        },
        editIdChanged() {
            this.idtoedit = null;
        },
        changeStepOnEdit() {
            this.currentstep = 1;
        },

        deleteRow(rowData) {
            var deleteUser = JSON.parse(JSON.stringify(rowData))

            var result = confirm(`Sure You want to delete user "${deleteUser.name}"?`);
            if (result) {
                this.$http.delete('https://jsonplaceholder.typicode.com/users/' + deleteUser.id)
                    .then(
                        res => {
                            console.log(res, "susseccfully Deleted")
                            this.Toaster(deleteUser.name, "Successfully Deleted")

                        }, err => {
                            console.log("Error")
                        }
                    )
            }


        },
        Toaster(response, msg) {
            var x = document.getElementById("snackbar");
            x.className = "show";
            x.innerHTML = `<h3>${msg} ${response}</h3>`
            setTimeout(function() { x.className = x.className.replace("show", ""); }, 3000);
        },
        transform: function(data) {
            var transformed = {}

            transformed.pagination = {
                total: data.total,
                per_page: data.per_page,
                current_page: data.current_page,
                last_page: data.last_page,
                next_page_url: data.next_page_url,
                prev_page_url: data.prev_page_url,
                from: data.from,
                to: data.to
            }

            transformed.mydata = []

            for (var i = 0; i < data.length; i++) {
                transformed.mydata.push({
                    id: data[i].id,
                    name: data[i].name,
                    email: data[i].email,
                    username: data[i].username,
                    phone: data[i].phone,
                    company: data[i].company.name,
                    website: data[i].website,
                    address: data[i].address.street + ', ' + data[i].address.suite + ', ' + data[i].address.city + ', ' + data[i].address.zipcode
                })
            }

            return transformed
        }

    },

});