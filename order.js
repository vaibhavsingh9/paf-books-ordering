const API_BASE_URL= "https://api.nytimes.com/svc/books/v3"
const API_KEY= "NlfGSd9Snu5V1uCXLggUcrzJZlCmtOTg"

var GLOBAL_BOOKS_LIST = [];

var CART_DATA = {};

const fetchBooks = async ()=>{
    var result = {};
    const response = await fetch(`${API_BASE_URL}/lists/full-overview.json?api-key=${API_KEY}`);
    if(response.ok) {
        const data = await response.json();
        if(data.status === "OK"){
            const modifiedData = data.results.lists.reduce((total, curr)=>{
                return [...total, ...curr.books];
            }, []);
            result = {
                okay: true,
                res: modifiedData
            }
        } else {
            result = {
                okay: false,
                res: []
            }
        }
    }
    return result
    
}

const fetchBookList = async () => {
    const {okay, res} = await fetchBooks();
    if(okay && res.length !== 0){
        GLOBAL_BOOKS_LIST = res;
        hydrateBookList(res);
    }
}

const hydrateBookList = (res) => {
    const hydrateData = res.map(value => BookListItem(value));
    var bookList = document.getElementById("book-list");
    if (bookList) {
        if(hydrateData.length === 0) {
            bookList.innerHTML = "No Book Found";    
        }else{
            bookList.innerHTML = hydrateData.join(" ");
        }
    } else {
        console.log("Element not found.");
    }
    var totalBooks = document.getElementById("total-books");
    if (totalBooks) {
        totalBooks.innerHTML = hydrateData.length;
    } else {
        console.log("Element not found.");
    }
}

const BookListItem = (data) => {
    return `<div class="card">
        <div class="card-body p-2 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center">
                <img src="${data.book_image}" alt="..." height="100" width="100"/>
                <span class="mx-2">${data.title}</span>
            </div>
            <div class="d-inline-block float-ends mx-2">
                <div class="input-group max-qty-width mx-auto">
                    <button class="btn btn-outline-primary p-2" type="button" onclick="addQtyListner('${data.title}')" >+</button>
                    <input type="number" class="form-control text-center qty-input-element p-2 qty-input-${data.title}" onchange="onQtyChange(event, '${data.title}')" min="0" max="5" id="qty-input-${data.title}">
                    <button class="btn btn-outline-secondary p-2" type="button"  onclick="minusQtyListner('${data.title}')">-</button>
                    <div>Maximum quantity is 5.</div>
                </div>
            </div>
        </div>
    </div>`
}

const hydrateCartList = () => {
    const hydrateData = Object.keys(CART_DATA).map(value => CartListItem(value));
    var cartList = document.getElementById("cart-list");
    if (cartList) {
        cartList.innerHTML = hydrateData.join(" ");
    } else {
        console.log("Element not found.");
    }
}

const CartListItem = (data) => {
    return `<div>${data} * ${CART_DATA[data]}</div>`
}

const onQtyChange = (event, title) => {
    if(event.target.value == "0"){
        delete CART_DATA[title];
        hydrateCartList();
    }else if(event.target.value >= 1 && event.target.value <= 5) {
        CART_DATA[title] = event.target.value;
        hydrateCartList();
    }else if(event.target.value > 5){
        var inputElement = document.getElementById(`qty-input-${title}`);
        inputElement.value = 5;
        CART_DATA[title] = 5;
        hydrateCartList();
    }else if(event.target.value < 1){
        var inputElement = document.getElementById(`qty-input-${title}`);
        inputElement.value = 1;
        CART_DATA[title] = 1;
        hydrateCartList();
    }
}

const searchListener = async () => {
    document.getElementById("search-form").addEventListener("submit", async function(event) {
        event.preventDefault();
        let formData = new FormData(this);
        let query = formData.get("searchQuery");
        const serachRes = await GLOBAL_BOOKS_LIST.filter((val)=> val.title.toLowerCase().indexOf(query.toLowerCase()) !== -1);
        hydrateBookList(serachRes);
    });
}

function clearForm() {
    document.getElementById("search-form")?.reset();
    hydrateBookList(GLOBAL_BOOKS_LIST);
}

function addQtyListner(name) {
    var inputElement = document.getElementById(`qty-input-${name}`);
    var currentValue = parseInt(inputElement.value);
    if(isNaN(currentValue)){
        inputElement.value = 1;
        CART_DATA[name] = 1;
        hydrateCartList();
    }else if(currentValue < 5) {
        var newValue = currentValue + 1;
        inputElement.value = newValue;
        CART_DATA[name] = newValue;
        hydrateCartList();
    }
}

function minusQtyListner(name) {
    var inputElement = document.getElementById(`qty-input-${name}`);
    var currentValue = parseInt(inputElement.value);
    if(currentValue && currentValue > 0) {
        var newValue = currentValue - 1;
        inputElement.value = newValue;
        if(newValue === 0){
            delete CART_DATA[name];
        }else{
            CART_DATA[name] = newValue;
        }
        hydrateCartList();
    }
}

document.addEventListener("DOMContentLoaded", function() {
    fetchBookList();
    searchListener();
});

