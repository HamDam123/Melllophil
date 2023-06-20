//API Module
const APIController = (function() {
    
    const clientId = "173ae8420144439b899f8af7ae18d4e9";
    const clientSecret = "4f290f272b614b84b8b4e6a1a756e7ce";

    // private methods
    const _getToken = async () => {

        try {
            const result = await fetch("https://accounts.spotify.com/api/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
              },
              body: "grant_type=client_credentials",
            });
        
            const data = await result.json();
            return data.access_token;
          } catch (error) {
            console.error(error);
            alert("Token Processing Error");
          }
    }

    const _getAlbum = async (token, albumName, albumArtist) => {
        
        const url = "https://api.spotify.com/v1/search?q=";
        const query = `album:${albumName} artist:${albumArtist}`;
        const encodedQuery = encodeURIComponent(query);
        const finalURL = `${url}${encodedQuery}&type=album&market=US&limit=1&offset=0`;
        try {
            const result = await fetch(finalURL, {
                method: "GET",
                headers: { Authorization: "Bearer " + token },
            });

            const data = await result.json();
            const data1 = data.albums.items;
            return data1;
        } catch (error) {
            console.error(error);
            alert("Album Search Error: Check Entries");
        }
    }

    const _getAlbumImageURL = async (token, albumName, albumArtist) => {
        try {
            const albums = await _getAlbum(token, albumName, albumArtist);
            const albumURL = albums[0].images[0].url; // Assuming you want the first album's image URL
            return albumURL;
          } catch (error) {
            console.error(error);
            alert("Album Search Error: Check Spelling");
          }
    }
    

    return {
        getToken() {
            return _getToken();
        },
        getAlbum(token, albumName, albumArtist){
            return _getAlbum(token, albumName, albumArtist);
        },
        getAlbumImageURL(token, albumName, albumArtist){
            return _getAlbumImageURL(token,albumName,albumArtist);
        }
    }
})();

// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        addAlbumSelect: "#add-album-popup-button",
        hfToken: "#hidden-token",
        albumNameInput: "#album-name-input",
        albumArtistInput: "#album-artist-input",
        addAlbumButton: "#add-album-button",
        popup: ".popup",
        popupCloseButton: ".popup .close-btn",
        popupSubmit: "#popup-submit"
    }

    //public methods
    return {

        //method to get input fields
        inputField() {
            return {
                albumSelect: document.querySelector(DOMElements.addAlbumSelect),
                albumNameInput: document.querySelector(DOMElements.albumNameInput),
                albumArtistInput: document.querySelector(DOMElements.albumArtistInput),
                addAlbumButton: document.querySelector(DOMElements.addAlbumButton),
                popup: document.querySelector(DOMElements.popup),
                popupCloseButton: document.querySelector(DOMElements.popupCloseButton),
                popupSubmitButton: document.querySelector(DOMElements.popupSubmit)
            }
        },

        resetSearchFields() {
            this.inputField().albumNameInput.value = "";
            this.inputField().albumArtistInput.value = "";
        },

        closePopup(){
            this.inputField().popup.classList.remove("active");
        },

        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) 
{

    // get input field object ref
    const DOMInputs = UICtrl.inputField();
    let token = "";
    let urlArray = [];
    let size = urlArray.length;

    //temp
    let section1 = document.querySelector("#section1-img");

    //load Token on page load
    const loadToken = async () => {
        //get the token
        token = await APICtrl.getToken();   
        //store the token onto the page
        UICtrl.storeToken(token_real);
    }


    DOMInputs.addAlbumButton.addEventListener("click", function(){
        DOMInputs.popup.classList.add("active");
    });

    DOMInputs.popupCloseButton.addEventListener("click", function(){
        DOMInputs.popup.classList.remove("active");
        //clear Search Fields
        UICtrl.resetSearchFields();
    });

    //popup add album button event listener
    DOMInputs.popupSubmitButton.addEventListener("click", async (e) => {
        let temp = true;
        try{
            // prevent page reset
            e.preventDefault();
            //retrieve Album URL
            const albumName = DOMInputs.albumNameInput.value;
            const artistName = DOMInputs.albumArtistInput.value;
            const albumImageURL = await APICtrl.getAlbumImageURL(token, albumName,artistName);
            section1.src = albumImageURL;
        }
        catch(error)
        {
            console.log(error);
        }
    });

    return {
        init() {
            console.log('App is starting');
            loadToken();
        }
    }

})(UIController, APIController);

// will need to call a method to load the token on page load
APPController.init();