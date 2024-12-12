
class Posts_API {
    static Host_URL() { return "https://boundless-faint-seeder.glitch.me"; }
    static POSTS_API_URL() { return this.Host_URL() + "/api/posts" };

    static initHttpState() {
        this.currentHttpError = "";
        this.currentStatus = 0;
        this.error = false;
    }
    static setHttpErrorState(xhr) {
        if (xhr.responseJSON)
            this.currentHttpError = xhr.responseJSON.error_description;
        else
            this.currentHttpError = xhr.statusText == 'error' ? "Service introuvable" : xhr.statusText;
        this.currentStatus = xhr.status;
        this.error = true;
    }
    static async HEAD() {
        Posts_API.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL(),
                type: 'HEAD',
                contentType: 'text/plain',
                complete: data => { resolve(data.getResponseHeader('ETag')); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async Get(id = null) {
        Posts_API.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + (id != null ? "/" + id : ""),
                complete: data => { resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON }); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async GetQuery(queryString = "") {
        Posts_API.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + queryString,
                complete: data => {
                    resolve({ ETag: data.getResponseHeader('ETag'), data: data.responseJSON });
                },
                error: (xhr) => {
                    Posts_API.setHttpErrorState(xhr); resolve(null);
                }
            });
        });
    }
    static async Save(data, create = true) {
        Posts_API.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: create ? this.POSTS_API_URL() : this.POSTS_API_URL() + "/" + data.Id,
                type: create ? "POST" : "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async SaveLike(data) {
        Posts_API.initHttpState();
        return new Promise(resolve => {
            $.ajax({
                url: this.Host_URL() + "/posts/savelike"+ "/" + data.Id,
                type: "PUT",
                contentType: 'application/json',
                data: JSON.stringify(data),
                success: (data) => { resolve(data); },
                error: (xhr) => { Posts_API.setHttpErrorState(xhr); resolve(null); }
            });
        });
    }
    static async Delete(id) {
        return new Promise(resolve => {
            $.ajax({
                url: this.POSTS_API_URL() + "/" + id,
                type: "DELETE",
                success: () => {
                    Posts_API.initHttpState();
                    resolve(true);
                },
                error: (xhr) => {
                    Posts_API.setHttpErrorState(xhr); resolve(null);
                }
            });
        });
    }

    
    static async AddLike(id) 
    {
        let post = await this.Get(id);
        post = post.data;
        console.log(post);
        post.Likes += 1;
        post.LikedUsers +=`${Accounts_API.getUserId()} \n`; 
        post.Image = post.Image.replace("http://localhost:5000/assetsRepository/","");
        console.log(post.Image);
        post = await this.SaveLike(post);
    }
    static async RemoveLike(id)
    {
        let post = await this.Get(id);
        post = post.data;
        post.Image = post.Image.replace("http://localhost:5000/assetsRepository/","");
        post.Likes -= 1;
        if (post.LikedUsers.indexOf(Accounts_API.getUserId()) != null)
        {
            post.LikedUsers = post.LikedUsers.replace(Accounts_API.getUserId(),"");
        }
        post = await this.SaveLike(post);
    }
}