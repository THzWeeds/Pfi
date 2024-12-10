class Accounts_API {
    static API_URL() {
        return "http://localhost:5000";
    }

    static initHttpState() {
        this.currentHttpError = "";
        this.currentStatus = 0;
        this.error = false;
    }

    static setHttpErrorState(response) {
        if (response.responseJSON) {
            this.currentHttpError = response.responseJSON.error_description;
        } else {
            this.currentHttpError = response.statusText === 'error' ? "Service introuvable" : response.statusText;
        }
        this.currentStatus = response.status;
        this.error = true;
    }

    static async postLogin(loginInfo) {
        this.initHttpState(); // Reset HTTP state for new request
        try {
            let response = await fetch(this.API_URL() + "/token", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });

            if (!response.ok) {
                this.setHttpErrorState(response);
                return { success: false, status: response.status, error: this.currentHttpError };
            }

            let data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error("Network error:", error);
            return { success: false, error: "Network error occurred" };
        }
    }

    static isAdmin()
    {
        return this.retrieveUser().isAdmin;
    }
    static getAvatar()
    {
      return this.retrieveUser().Avatar;  
    }
    static getUserName()
    {
        return this.retrieveUser().Name;
    }
    static isLogged() {
        return sessionStorage.getItem("User") && sessionStorage.getItem("Token");
    }
    static retrieveUser()
    {
        return JSON.parse(sessionStorage.getItem("User"));
    }
    static getUserId()
    {
        return this.retrieveUser().Id;
    }
    static getToken()
    {
        return sessionStorage.getItem("Token");
    }
    static async Logout() {
        Accounts_API.initHttpState();
    
        let userId = this.getUserId();
    
        if (!userId) {
            console.error("User ID is required for logout.");
            return null; 
        }
    
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() + `/accounts/logout?userId=${userId}`, 
                complete: data => {
                    resolve({
                        ETag: data.getResponseHeader('ETag'),
                        data: data.responseJSON
                    });
                },
                error: xhr => {
                    Accounts_API.setHttpErrorState(xhr);
                    resolve(null);
                }
            });
        });
    }
    
    static async GetAllUsers(id = null) {
        Accounts_API.initHttpState();
        let token = this.getToken();
        return new Promise(resolve => {
            $.ajax({
                url: this.API_URL() +"/accounts" + (id != null ? "/" + id : ""),
                headers: {"authorization" : token},
                complete: data => { resolve(data); },
                error: (xhr) => { Accounts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }

    static async Save(data, create = true)
    {
        Accounts_API.initHttpState();
        data.Id = this.getUserId();
        let token = this.getToken();
        return new Promise(resolve => {
            $.ajax({
                url:create ? this.API_URL() + "/accounts/register":this.API_URL() + "/accounts/modify/",
                headers: {"authorization" : token},
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: (data) => { resolve(data); },
                error: (xhr) => { Accounts_API.setHttpErrorState(xhr); resolve(null); }
            });


        });
    }

}


