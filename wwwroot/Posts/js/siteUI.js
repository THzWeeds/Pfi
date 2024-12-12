////// Author: Nicolas Chourot
////// 2024
//////////////////////////////




const periodicRefreshPeriod = 10;
const waitingGifTrigger = 2000;
const minKeywordLenth = 3;
const keywordsOnchangeDelay = 500;

let categories = [];
let selectedCategory = "";
let currentETag = "";
let periodic_Refresh_paused = false;
let currentPostsCount = 0;
let postsPanel;
let itemLayout;
let waiting = null;
let showKeywords = false;
let keywordsOnchangeTimger = null;

let isUserAnonyme = false;
let isBaseUser = false;
let isSuperUser = false;
let isAdmin = false;

Init_UI();
async function Init_UI() {
    postsPanel = new PageManager('postsScrollPanel', 'postsPanel', 'postSample', renderPosts);
    let isLoggedIn = Accounts_API.isLogged();

    $('#createPost').on("click", async function () {
        showCreatePostForm();
        if (isLoggedIn) {
            timeout(30);
        }
    });
    $('#abort').on("click", async function () {
        showPosts();
        if (isLoggedIn) {
            timeout(30);
        }
    });
    $('#aboutCmd').on("click", function () {
        showAbout();
    });
    $('#modifierProfileCmd').on("click", function () {
        console.log("modifierProfile");
        showUserEditForm();
        if (isLoggedIn) {
            timeout(30);
        }
    });
    $('#gererUserCmd').on("click", function () {
        showGererUser();
        if (isLoggedIn) {
            timeout(30);
        }
    });
    $('#signupCmd').on("click", function () {
        showSignUpForm();
        if (isLoggedIn) {
            timeout(30);
        }
    });
    $("#showSearch").on('click', function () {
        toogleShowKeywords();
        showPosts();
        if (isLoggedIn) {
            timeout(30);
        }
    });

    installKeywordsOnkeyupEvent();
    await showPosts();
    start_Periodic_Refresh();

    initTimeout(60, function () {
        Accounts_API.Logout();
        if (!Accounts_API.error) {
            sessionStorage.clear();
            sessionStorage.setItem("sessionExpired", "true");
            showConnectForm();
            noTimeout();
        }
    });
    if (isLoggedIn) {
        timeout(30);
    }

}






/////////////////////////// Search keywords UI //////////////////////////////////////////////////////////

function installKeywordsOnkeyupEvent() {
    $("#searchKeys").on('keyup', function () {
        clearTimeout(keywordsOnchangeTimger);
        keywordsOnchangeTimger = setTimeout(() => {
            cleanSearchKeywords();
            showPosts(true);
        }, keywordsOnchangeDelay);
    });
    $("#searchKeys").on('search', function () {
        showPosts(true);
    });
}
function cleanSearchKeywords() {
    /* Keep only keywords of 3 characters or more */
    let keywords = $("#searchKeys").val().trim().split(' ');
    let cleanedKeywords = "";
    keywords.forEach(keyword => {
        if (keyword.length >= minKeywordLenth) cleanedKeywords += keyword + " ";
    });
    $("#searchKeys").val(cleanedKeywords.trim());
}
function showSearchIcon() {
    $("#hiddenIcon").hide();
    $("#showSearch").show();
    if (showKeywords) {
        $("#searchKeys").show();
    }
    else
        $("#searchKeys").hide();
}
function hideSearchIcon() {
    $("#hiddenIcon").show();
    $("#showSearch").hide();
    $("#searchKeys").hide();
}
function toogleShowKeywords() {
    showKeywords = !showKeywords;
    if (showKeywords) {
        $("#searchKeys").show();
        $("#searchKeys").focus();
    }
    else {
        $("#searchKeys").hide();
        showPosts(true);
    }
}

/////////////////////////// Views management ////////////////////////////////////////////////////////////

function intialView() {
    $("#createPost").show();
    $("#hiddenIcon").hide();
    $("#hiddenIcon2").hide();
    $('#menu').show();
    $('#commit').hide();
    $('#abort').hide();
    $('#form').hide();
    $('#form').empty();
    $('#aboutContainer').hide();
    $('#connectContainer').hide();
    $('#errorContainer').hide();
    showSearchIcon();
}
async function showPosts(reset = false) {
    intialView();
    $("#viewTitle").text("Fil de nouvelles");
    periodic_Refresh_paused = false;
    await postsPanel.show(reset);
}
function hidePosts() {
    postsPanel.hide();
    hideSearchIcon();
    $("#createPost").hide();
    $('#menu').hide();
    periodic_Refresh_paused = true;
}
function showForm() {
    hidePosts();
    $('#form').show();
    $('#commit').show();
    $('#abort').show();
}
function showError(message, details = "") {
    hidePosts();
    $('#form').hide();
    $('#form').empty();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $('#abort').show();
    $("#viewTitle").text("Erreur du serveur...");
    $("#errorContainer").show();
    $("#errorContainer").empty();
    $("#errorContainer").append($(`<div>${message}</div>`));
    $("#errorContainer").append($(`<div>${details}</div>`));
}

function showConnectForm() {
    showForm();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $("#viewTitle").text("Connexion");
    renderConnectForm();
}
function showVerificationForm() {
    showForm();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $("#viewTitle").text("Verification");
    renderVerificationForm();
}
function showGererUser() {
    showForm();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $("#viewTitle").text("Connexion");
    renderGererUser();
}
function showSignUpForm() {
    showForm();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $("#viewTitle").text("Inscription");
    renderSignUpForm();
}

function showUserEditForm() {
    showForm();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#commit').hide();
    $("#viewTitle").text("Modifier");
    renderSignUpForm(Accounts_API.retrieveUser());
}

function showCreatePostForm() {
    showForm();
    $("#viewTitle").text("Ajout de nouvelle");
    renderPostForm();
}
function showEditPostForm(id) {
    showForm();
    $("#viewTitle").text("Modification");
    renderEditPostForm(id);
}
function showDeletePostForm(id) {
    showForm();
    $("#viewTitle").text("Retrait");
    renderDeletePostForm(id);
}
function showAbout() {
    hidePosts();
    $("#hiddenIcon").show();
    $("#hiddenIcon2").show();
    $('#abort').show();
    $("#viewTitle").text("À propos...");
    $("#aboutContainer").show();
}


//////////////////////////// Posts rendering /////////////////////////////////////////////////////////////

//////////////////////////// Posts rendering /////////////////////////////////////////////////////////////

function start_Periodic_Refresh() {
    setInterval(async () => {
        if (!periodic_Refresh_paused) {
            let etag = await Posts_API.HEAD();
            if (currentETag != etag) {
                currentETag = etag;
                await showPosts();
            }
        }
    },
        periodicRefreshPeriod * 1000);
} function start_Periodic_Refresh() {
    $("#reloadPosts").addClass('white');
    $("#reloadPosts").on('click', async function () {
        $("#reloadPosts").addClass('white');
        postsPanel.resetScrollPosition();
        await showPosts();
    })
    setInterval(async () => {
        if (!periodic_Refresh_paused) {
            let etag = await Posts_API.HEAD();
            // the etag contain the number of model records in the following form
            // xxx-etag
            let postsCount = parseInt(etag.split("-")[0]);
            if (currentETag != etag) {
                if (postsCount != currentPostsCount) {
                    console.log("postsCount", postsCount)
                    currentPostsCount = postsCount;
                    $("#reloadPosts").removeClass('white');
                } else
                    await showPosts();
                currentETag = etag;
            }
        }
    },
        periodicRefreshPeriod * 1000);
}
async function renderPosts(queryString) {
    let endOfData = false;
    queryString += "&sort=date,desc";
    compileCategories();
    if (selectedCategory != "") queryString += "&category=" + selectedCategory;
    if (showKeywords) {
        let keys = $("#searchKeys").val().replace(/[ ]/g, ',');
        if (keys !== "")
            queryString += "&keywords=" + $("#searchKeys").val().replace(/[ ]/g, ',')
    }
    addWaitingGif();
    let response = await Posts_API.GetQuery(queryString);
    let users = "";
    if (!Posts_API.error) {
        if (Accounts_API.isLogged())
        {
            users = await Accounts_API.GetAllUsers();
        }
        currentETag = response.ETag;
        let Posts = response.data;
        if (Posts.length > 0) {
            Posts.forEach(Post => {
                postsPanel.append(renderPost(Post,users));
            });
        } else
            endOfData = true;
        linefeeds_to_Html_br(".postText");
        highlightKeywords();
        attach_Posts_UI_Events_Callback();
    } else {
        showError(Posts_API.currentHttpError);
    }
    removeWaitingGif();
    return endOfData;
}
function renderPost(post, users) {
    let date = convertToFrenchDate(UTC_To_Local(post.Date));
    let likeCMD = "";
    if (Accounts_API.isLogged())
    {
        likeCMD = post.LikedUsers.includes(Accounts_API.getUserId()) ? `<span class="unlikeCmd cmdIconSmall fa-solid fa-thumbs-up" postId="${post.Id}" title="Retirer"></span> <span title="${post.LikedUsersName}">${post.Likes}</span>` : `<span class="likeCmd cmdIconSmall fa-regular fa-thumbs-up" postId="${post.Id}" title="Ajouter"></span> <span title="${post.LikedUsersName}">${post.Likes}</span>`;
    }
    let crudIcon =
        `
        <span class="editCmd cmdIconSmall fa fa-pencil" postId="${post.Id}" title="Modifier nouvelle"></span>
        <span class="deleteCmd cmdIconSmall fa fa-trash" postId="${post.Id}" title="Effacer nouvelle"></span>
        ${likeCMD}
        `;

    return $(`
        <div class="post" id="${post.Id}">
            <div class="postHeader">
                ${post.Category}
                ${crudIcon}
            </div>
            <div class="postTitle"> ${post.Title} </div>
            <img class="postImage" src='${post.Image}'/>
            <div class="postDate"> ${date} </div>
            <div postId="${post.Id}" class="postTextContainer hideExtra">
                <div class="postText" >${post.Text}</div>
            </div>
            <div class="postfooter">
                <span postId="${post.Id}" class="moreText cmdIconXSmall fa fa-angle-double-down" title="Afficher la suite"></span>
                <span postId="${post.Id}" class="lessText cmdIconXSmall fa fa-angle-double-up" title="Réduire..."></span>
            </div>         
        </div>
    `);
}
async function compileCategories() {
    categories = [];
    let response = await Posts_API.GetQuery("?fields=category&sort=category");
    if (!Posts_API.error) {
        let items = response.data;
        if (items != null) {
            items.forEach(item => {
                if (!categories.includes(item.Category))
                    categories.push(item.Category);
            })
            if (!categories.includes(selectedCategory))
                selectedCategory = "";
            updateDropDownMenu(categories);
        }
    }
}
function updateDropDownMenu() {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();


    let isLoggedIn = Accounts_API.isLogged();
    if (isLoggedIn) {


        DDMenu.append($(`
            <div class="dropdown-item" id="modifierProfileCmd">
                            <img src="${Accounts_API.getAvatar()}" alt="Avatar" class="UserAvatarXSmall"> ${Accounts_API.getUserName()}
                        </div>
            `));
        DDMenu.append($(`<div class="dropdown-divider"></div>`));

        let isAdmin = Accounts_API.isAdmin();
        if (isAdmin) {
            DDMenu.append($(`
                <div class="dropdown-item" id="gererUserCmd">
                                <i class="menuIcon fa fa-user-pen mx-2"></i> Gestions des usagers
                            </div>
                `));
            DDMenu.append($(`<div class="dropdown-divider"></div>`));
        }

        DDMenu.append($(`
            <div class="dropdown-item" id="modifierProfileCmd">
                            <i class="menuIcon fa fa-user-pen mx-2"></i> Modifier votre profil
                        </div>
            `));
        DDMenu.append($(`
            <div class="dropdown-item" id="logoutCmd">
                            <i class="menuIcon fa fa-sign-out mx-2"></i> Logout
                        </div>
            `));
    } else {
        DDMenu.append($(`
            <div class="dropdown-item" id="loginCmd">
                            <i class="menuIcon fa fa-sign-in mx-2"></i> Connexion
                        </div>
            `));
    }


    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="allCatCmd">
            <i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
        </div>
        `));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
            <div class="dropdown-item menuItemLayout category" id="allCatCmd">
                <i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
            </div>
        `));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
        <div class="dropdown-item menuItemLayout" id="aboutCmd">
            <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
        </div>
        `));
    $('#aboutCmd').on("click", function () {
        showAbout();
    });
    $('#loginCmd').on("click", function () {
        showConnectForm();
    });
    $('#modifierProfileCmd').on("click", function () {
        console.log("modifierProfile");
        showUserEditForm();
    });
    $('#logoutCmd').on("click", function () {
        Accounts_API.Logout();
        if (!Accounts_API.error) {
            sessionStorage.clear();
            showPosts();
            noTimeout();
        }
    });
    $('#gererUserCmd').on("click", function () {
        showGererUser();
    });
    $('#allCatCmd').on("click", async function () {
        selectedCategory = "";
        await showPosts(true);
        updateDropDownMenu();
    });
    $('.category').on("click", async function () {
        selectedCategory = $(this).text().trim();
        await showPosts(true);
        updateDropDownMenu();
    });
}
function attach_Posts_UI_Events_Callback() {

    linefeeds_to_Html_br(".postText");
    // attach icon command click event callback
    $(".likeCmd").off();
    $(".likeCmd").on("click", function () {
        Posts_API.AddLike($(this).attr("postId"));
    });
    $(".unlikeCmd").off();
    $(".unlikeCmd").on("click", function () {
        Posts_API.RemoveLike($(this).attr("postId"));
    });

    $(".editCmd").off();
    $(".editCmd").on("click", function () {
        showEditPostForm($(this).attr("postId"));
    });
    $(".deleteCmd").off();
    $(".deleteCmd").on("click", function () {
        showDeletePostForm($(this).attr("postId"));
    });
    $(".moreText").off();
    $(".moreText").click(function () {
        $(`.commentsPanel[postId=${$(this).attr("postId")}]`).show();
        $(`.lessText[postId=${$(this).attr("postId")}]`).show();
        $(this).hide();
        $(`.postTextContainer[postId=${$(this).attr("postId")}]`).addClass('showExtra');
        $(`.postTextContainer[postId=${$(this).attr("postId")}]`).removeClass('hideExtra');
    })
    $(".lessText").off();
    $(".lessText").click(function () {
        $(`.commentsPanel[postId=${$(this).attr("postId")}]`).hide();
        $(`.moreText[postId=${$(this).attr("postId")}]`).show();
        $(this).hide();
        $(`.postTextContainer[postId=${$(this).attr("postId")}]`).addClass('hideExtra');
        $(`.postTextContainer[postId=${$(this).attr("postId")}]`).removeClass('showExtra');
    })
}
function addWaitingGif() {
    clearTimeout(waiting);
    waiting = setTimeout(() => {
        postsPanel.itemsPanel.append($("<div id='waitingGif' class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
    }, waitingGifTrigger)
}
function removeWaitingGif() {
    clearTimeout(waiting);
    $("#waitingGif").remove();
}

/////////////////////// Posts content manipulation ///////////////////////////////////////////////////////

function linefeeds_to_Html_br(selector) {
    $.each($(selector), function () {
        let postText = $(this);
        var str = postText.html();
        var regex = /[\r\n]/g;
        postText.html(str.replace(regex, "<br>"));
    })
}
function highlight(text, elem) {
    text = text.trim();
    if (text.length >= minKeywordLenth) {
        var innerHTML = elem.innerHTML;
        let startIndex = 0;

        while (startIndex < innerHTML.length) {
            var normalizedHtml = innerHTML.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            var index = normalizedHtml.indexOf(text, startIndex);
            let highLightedText = "";
            if (index >= startIndex) {
                highLightedText = "<span class='highlight'>" + innerHTML.substring(index, index + text.length) + "</span>";
                innerHTML = innerHTML.substring(0, index) + highLightedText + innerHTML.substring(index + text.length);
                startIndex = index + highLightedText.length + 1;
            } else
                startIndex = innerHTML.length + 1;
        }
        elem.innerHTML = innerHTML;
    }
}
function highlightKeywords() {
    if (showKeywords) {
        let keywords = $("#searchKeys").val().split(' ');
        if (keywords.length > 0) {
            keywords.forEach(key => {
                let titles = document.getElementsByClassName('postTitle');
                Array.from(titles).forEach(title => {
                    highlight(key, title);
                })
                let texts = document.getElementsByClassName('postText');
                Array.from(texts).forEach(text => {
                    highlight(key, text);
                })
            })
        }
    }
}

//////////////////////// Forms rendering /////////////////////////////////////////////////////////////////

async function renderEditPostForm(id) {
    $('#commit').show();
    addWaitingGif();
    let response = await Posts_API.Get(id)
    if (!Posts_API.error) {
        let Post = response.data;
        if (Post !== null)
            renderPostForm(Post);
        else
            showError("Post introuvable!");
    } else {
        showError(Posts_API.currentHttpError);
    }
    removeWaitingGif();
}
async function renderDeletePostForm(id) {
    let response = await Posts_API.Get(id)
    if (!Posts_API.error) {
        let post = response.data;
        if (post !== null) {
            let date = convertToFrenchDate(UTC_To_Local(post.Date));
            $("#form").append(`
                <div class="post" id="${post.Id}">
                <div class="postHeader">  ${post.Category} </div>
                <div class="postTitle ellipsis"> ${post.Title} </div>
                <img class="postImage" src='${post.Image}'/>
                <div class="postDate"> ${date} </div>
                <div class="postTextContainer showExtra">
                    <div class="postText">${post.Text}</div>
                </div>
            `);
            linefeeds_to_Html_br(".postText");
            // attach form buttons click event callback
            $('#commit').on("click", async function () {
                await Posts_API.Delete(post.Id);
                if (!Posts_API.error) {
                    await showPosts();
                }
                else {
                    console.log(Posts_API.currentHttpError)
                    showError("Une erreur est survenue!");
                }
            });
            $('#cancel').on("click", async function () {
                await showPosts();
            });

        } else {
            showError("Post introuvable!");
        }
    } else
        showError(Posts_API.currentHttpError);
}
function newPost() {
    let Post = {};
    Post.Id = 0;
    Post.Title = "";
    Post.Text = "";
    Post.Image = "news-logo-upload.png";
    Post.Category = "";
    return Post;
}
function renderPostForm(post = null) {
    let create = post == null;
    if (create) post = newPost();
    $("#form").show();
    $("#form").empty();
    $("#form").append(`
        <form class="form" id="postForm">
            <input type="hidden" name="Id" value="${post.Id}"/>
            <input type="hidden" name="Likes" value="${post.Likes}"/>
             <input type="hidden" name="Date" value="${post.Date}"/>
            <label for="Category" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="Catégorie"
                required
                value="${post.Category}"
            />
            <label for="Title" class="form-label">Titre </label>
            <input 
                class="form-control"
                name="Title" 
                id="Title" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal"
                value="${post.Title}"
            />
            <label for="Url" class="form-label">Texte</label>
             <textarea class="form-control" 
                          name="Text" 
                          id="Text"
                          placeholder="Texte" 
                          rows="9"
                          required 
                          RequireMessage = 'Veuillez entrer une Description'>${post.Text}</textarea>

            <label class="form-label">Image </label>
            <div class='imageUploaderContainer'>
                <div class='imageUploader' 
                     newImage='${create}' 
                     controlId='Image' 
                     imageSrc='${post.Image}' 
                     waitingImage="Loading_icon.gif">
                </div>
            </div>
            <div id="keepDateControl">
                <input type="checkbox" name="keepDate" id="keepDate" class="checkbox" checked>
                <label for="keepDate"> Conserver la date de création </label>
            </div>
            <input type="submit" value="Enregistrer" id="savePost" class="btn btn-primary displayNone">
        </form>
    `);
    if (create) $("#keepDateControl").hide();

    initImageUploaders();
    initFormValidation(); // important do to after all html injection!

    $("#commit").click(function () {
        $("#commit").off();
        return $('#savePost').trigger("click");
    });
    $('#postForm').on("submit", async function (event) {
        event.preventDefault();
        let post = getFormData($("#postForm"));
        if (post.Category != selectedCategory)
            selectedCategory = "";
        if (create || !('keepDate' in post))
            post.Date = Local_to_UTC(Date.now());
        delete post.keepDate;
        if (post.Likes == null )
        {
            post.Likes = 0;
            post.LikedUsers = "";
            post.LikedUsersName = "";
        }
        post = await Posts_API.Save(post, create);
        if (!Posts_API.error) {
            await showPosts();
            postsPanel.scrollToElem(post.Id);
        }
        else
            showError("Une erreur est survenue! ", Posts_API.currentHttpError);
    });
    $('#cancel').on("click", async function () {
        await showPosts();
    });
}
function getFormData($form) {
    // prevent html injections
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    // grab data from all controls
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
//////////////////////// User /////////////////////////////////////////////////////////////////
function newConnect() {
    let connexion = {};
    connexion.Email = "";
    connexion.Password = "";
    return connexion;
}
function newSignUp() {
    let signUp = {};
    signUp.Name = "";
    signUp.Email = "";
    signUp.Password = "";
    signUp.Avatar = "no-avatar.png";
    signUp.Created = "";
    signUp.VerifyCode = "";
    signUp.Authorizations = {};
    return signUp;
}
async function renderGererUser(user = null) {
    const users = await Accounts_API.GetAllUsers();
    console.log(users);

    $("#form").show();
    $("#form").empty();

    users.forEach(user => {
        const isBlocked = user.Authorizations.readAccess === -1 && user.Authorizations.writeAccess === -1;
        const isPromoted = user.IsPromoted;

        // Determine the user role based on permissions
        let roleText = 'Usager de base'; // Default role
        if (user.Authorizations.readAccess >= 3 && user.Authorizations.writeAccess >= 3) {
            roleText = 'Administrateur';
        } else if (user.Authorizations.readAccess === 2) {
            roleText = 'Super usager';
        }

        // Append each user with a block, promote, and delete button
        $("#form").append(`
            <div>
                <div>
                    <span>${user.Name}</span>
                    <span class="user-role">(${roleText})</span>
                </div>
                <div>
                    <button class="block-user" data-user-id="${user.Id}" ${isBlocked ? 'disabled' : ''}>
                        ${isBlocked ? 'Blocked' : 'Block'}
                    </button>
                    <button class="promote-user" data-user-id="${user.Id}" ${isPromoted ? 'disabled' : ''}>
                        ${isPromoted ? 'Promoted' : 'Promote'}
                    </button>
                    <button class="delete-user" data-user-id="${user.Id}">Delete</button>
                </div>
            </div>
        `);
    });

    // Block Button Click Handler
    $(".block-user").on("click", async function () {
        const userId = $(this).data("user-id");

        // Block the user via the API
        let result = await Accounts_API.BlockUser({ Id: userId });

        // Re-render the user list to reflect the block action
        renderGererUser();
    });

    // Promote Button Click Handler
    $(".promote-user").on("click", async function () {
        const userId = $(this).data("user-id");

        // Promote the user via the API
        let result = await Accounts_API.PromoteUser({ Id: userId });

        // Re-render the user list to reflect the promotion action
        renderGererUser();
    });

    // Delete Button Click Handler
    $(".delete-user").on("click", async function () {
        const userId = $(this).data("user-id");

        // Call the delete API
        await Accounts_API.Delete(userId);

        // Re-render the user list after deletion
        renderGererUser();
    });

    // Cancel Button Click Handler
    $('#cancel').on("click", async function () {
        await showPosts();
    });
}

function renderVerificationForm() {
    $("#form").show();
    $("#form").empty();
    $("#form").append(`
      <form class="form centered" id="verificationForm">
        <label for="VerificationCode" class="form-label">Code de vérification</label>
        <input 
          class="form-control full-width"
          name="VerificationCode" 
          id="VerificationCode" 
          placeholder="Code de vérification"
          required
        />
        <input type="submit" value="Vérifier" id="verifyCode" class="btn btn-primary full-width ">
      </form>
    `);

    $('#verificationForm').on("submit", async function (event) {
        event.preventDefault();

        let verificationCode = $('#VerificationCode').val();

        let userId = sessionStorage.getItem("User");


        if (userId) {
            try {
                userId = JSON.parse(userId);
            } catch (error) {
                console.error("Error parsing user ID from session storage:", error);
                userId = null;
            }
        }

        let result = await Accounts_API.verifyCode(userId.Id, verificationCode);

        if (result.success) {
            timeout(30);
            await showPosts();
        } else {
            alert("Code de vérification incorrect. Veuillez réessayer.");
        }
    });
}

function renderConnectForm(user = null) {
    let create = user == null;
    if (create) user = newConnect();


    let sessionExpiredMessage = sessionStorage.getItem("sessionExpired") ?
        '<div class="text-danger" id="sessionExpiredMessage">Session expirer. Veuillez vous reconnecter.</div>' :
        '';

    sessionStorage.removeItem("sessionExpired");

    $("#form").show();
    $("#form").empty();
    $("#form").append(`
        ${sessionExpiredMessage}
        <form class="form centered" id="connectForm">
            <label for="Email" class="form-label">Connexion </label>
            <input 
                class="form-control full-width"
                name="Email" 
                id="Email" 
                placeholder="Email"
                required
                value="${user.Email || ''}"
            />
            <div id="error-message-email" class="text-danger"></div>
            <input 
                class="form-control full-width"
                type="password"
                name="Password" 
                id="Password" 
                placeholder="Password"
                required
                value="${user.Password || ''}"
            />
            <input type="submit" value="Se connecter" id="saveConnect" class="btn btn-primary full-width ">
        </form>
        <div id="signupCmd">
            <span class="btn btn-primary full-width "> Inscription </span>
        </div>
    `);

    $('#connectForm').on("submit", async function (event) {
        event.preventDefault();

        let email = $('#Email').val();
        let password = $('#Password').val();
        let loginInfo = { Email: email, Password: password };

        let result = await Accounts_API.postLogin(loginInfo);

        if (!result.success) {
            if (result.status === 481) {
                $('#error-message-email').text("Courriel introuvable");
                $('#error-message-password').text("");
            } else if (result.status === 482) {
                $('#error-message-password').text("Mot de passe incorrect");
                $('#error-message-email').text("");
            } else {
                console.log("Unexpected error:", result.error);
            }
        } else {
            if (result.data && result.data.Access_token) {
                sessionStorage.setItem("Token", result.data.Access_token);
                sessionStorage.setItem("User", JSON.stringify(result.data.User));


                if (Accounts_API.isLogged() && result.data.User.VerifyCode != "verified") {
                    showVerificationForm();
                }
                else {
                    timeout(30);
                    await showPosts();
                }
            } else {
                console.log("An unexpected error occurred.");
            }
        }
    });

    $('#cancel').on("click", async function () {
        await showPosts();
    });

    $('#signupCmd').on("click", function () {
        showSignUpForm();
    });
}


function renderSignUpForm(user = null) {
    console.log("Signup Form");
    let create = user == null;
    if (create) user = newSignUp();
    $("#form").show();
    $("#form").empty();
    $("#form").append(`
        <form class="form centered" id="signUpForm">
            <label for="Email" class="form-label">Courriel </label>
            <input 
                class="form-control full-width Email"
                name="Email" 
                id="Email" 
                placeholder="Email"
                required
                RequireMessage="Veuillez entrer un Email"
                InvalidMessage="Le titre comporte un caractère Email"
                value="${user.Email}"
            />
            <input 
                class="form-control full-width Email"
                name="VerifyEmail" 
                id="VerifyEmail" 
                placeholder="Vérification"
                required
                RequireMessage="Veuillez entrer un Email"
                InvalidMessage="Le titre comporte un caractère Email"
                value="${user.Email}"
            />
            <div id="error-message-email" class="text-danger"></div>
            <label for="Password" class="form-label"> Mot de passe </label>
            <input 
                class="form-control full-width"
                name="Password" 
                id="Password" 
                placeholder="Mot de passe"
                required
                RequireMessage="Veuillez entrer un mot de passe"
                InvalidMessage="Le titre comporte un caractère Email"
                value=""
            />
             <input 
                class="form-control full-width"
                name="VerifyPassword" 
                id="VerifyPassword" 
                placeholder="Vérification"
                required
                RequireMessage="Veuillez entrer un mot de passe"
                InvalidMessage="Le titre comporte un caractère Email"
                value=""
            />
            <div id="error-message-password" class="text-danger"></div>
            <label for="Name" class="form-label"> Nom </label>
            <input 
                class="form-control full-width"
                name="Name" 
                id="Name" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le titre comporte un caractère illégal"
                value="${user.Name}"
            />
            <label class="form-label">Avatar </label>
            <div class='imageUploaderContainer'>
                <div class='imageUploader' 
                     newImage='${create}' 
                     controlId='Avatar' 
                     imageSrc='${user.Avatar}' 
                     waitingImage="Loading_icon.gif">
                </div>
            </div>
            <input type="submit" value="Créer" id="saveUser" class="btn btn-primary full-width ">
            
        </form>
        
        

    `);

    if (!create) {
        $("#form").append(` 
            <input type="button" value="Effacer ce compte" id="deleteUser" class="btn btn-primary full-width">
            `);
    }
    $("#form").append(` 
        <input type="button" value="Annuler" id="cancel" class="btn btn-primary full-width">
        `);
    if (create) $("#keepDateControl").hide();

    initImageUploaders();
    addConflictValidation(Accounts_API.API_URL() + "/accounts/conflict", "Email", "saveUser");
    initFormValidation();
    $('#cancel').on("click", async function (event) {
        await showPosts();
    });

    $('#signUpForm').on("submit", async function (event) {
        event.preventDefault();
        let userform = getFormData($("#signUpForm"));
        let error = false;
        
        if (userform.Email != userform.VerifyEmail) {
            error = true;
            $('#error-message-email').text("Les courriels entré ne sont pas identiques");
            //showError("Une erreur est survenue! ", "Les courriels entré ne sont pas identiques");
        }
        else {
            $('#error-message-email').empty();
        }
        if (userform.Password != userform.VerifyPassword) {
            error = true;
            $('#error-message-password').text("Les mots de passes ne sont pas identiques");
            //showError("Une erreur est survenue! ", "Les mots de passes ne sont pas identiques");
        }
        else {
            $('#error-message-password').empty();
        }
        let userSubmit = {};
        userSubmit.Name = userform.Name;
        userSubmit.Email = userform.Email;
        userSubmit.Password = userform.Password;
        userSubmit.Avatar = userform.Avatar;
        console.log(user);
        // if (!create)
        // {
        //     if (userform.Password =="" || userform.Password == null)
        //     {
        //         userSubmit.Password = user.Password;
                
        //     }
        //     if (userform.Avatar =="" || userform.Avatar == null)
        //     {
        //         userSubmit.Avatar = user.Avatar;
                
        //     }
        // }
        if (!error) {
            let account = await Accounts_API.Save(userSubmit, create);
            if (!Accounts_API.error) {
                sessionStorage.setItem("User", JSON.stringify(account));
                await showPosts();
            }
            else
                showError("Une erreur est survenue! ", Accounts_API.currentHttpError);
        }

        return;
    });
    $('#cancel').on("click", async function () {
        await showPosts();
    });
    $('#deleteUser').on("click", async function () {
        showDeleteUserForm()
    });
}

function showDeleteUserForm() {
    showForm();
    $("#form").empty();
    $("#viewTitle").text("Effacer le compte");
    renderDeleteUserForm();
}

async function renderDeleteUserForm() {
    
    let user = Accounts_API.getUserId();
    $("#form").append(`
        <label for="deleteUser" class="form-label">Voulez-vous effacer votre compte</label>
        <input type="submit" value="Effacer" id="deleteUser" class="btn btn-primary full-width ">
        <input type="button" value="annuler" id="cancel" class="btn btn-primary full-width">
    `);
    
    $('#deleteUser').on("click", async function () {
        await Accounts_API.Delete(user);
        if (!Accounts_API.error) {
            Accounts_API.Logout();
            await showPosts();
        }
        else {
            console.log(Accounts_API.currentHttpError)
            showError("Une erreur est survenue!");
        }
    });
    $('#cancel').on("click", async function () {
        await showPosts();
    });
}