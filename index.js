import express from "express"
import bodyParser from "body-parser"
import axios from "axios"

const app = express();
const port = 3000;

app.set("view engine", "ejs")
app.use(express.static("public"))
app.use(bodyParser.urlencoded({urlencoded: true}))

app.get("/", (req, res) => {
    res.render("index.ejs", {
        bookTitle: null,
        bookDescription: null,
        bookGenre: null,
        bookThumbnail: null
      })
})

// {
//     kind: "books#volumes",
//     totalItems: 2000,
//     items: [
//       {
//         kind: "books#volume",
//         id: "xyz123",
//         volumeInfo: {
//           title: "The Book Title",
//           authors: ["Author Name"],
//           publisher: "Publisher Name",
//           publishedDate: "2003-01-01",
//           description: "A great story about...",
//           categories: ["Romance"],
//           imageLinks: {
//             thumbnail: "http://image-url.jpg"
//           },
//           infoLink: "https://books.google.com/..."
//         },
//         ...
//       },
//       ...
//     ]
//   }  // this is response.data
app.post("/", async(req, res) => {
    try{
        const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
            params: {
                q: `subject:${req.body.genre}`,
                maxResults: 30,
            }
        });
        
        const items = response.data.items;
    
        // if there is no response
        if(!items || items.length === 0) {
            console.log("No books found for this genre");
            res.render("index.ejs",{
                bookTitle: null,
                bookDescription: null,
                bookGenre: null,
                bookThumbnail: null
              })
            return;
        }
        const randomBook = items[Math.floor(Math.random()* items.length)];
        const info = randomBook.volumeInfo;
    
        const data = {
            bookTitle: info.title,
            bookDescription: info.description || "No description available for this book.",
            bookGenre: info.categories || "No about available",
            // bookThumbnail: info.imageLinks.thumbnail
            // we have ot make sure that if the link doesn not work,
            // it won't crash, therefore use ?.
            bookThumbnail: info.imageLinks?.thumbnail || "https://media.gettyimages.com/id/474982168/video/magic-book-with-animation-glowing-letters.jpg?s=640x640&k=20&c=YXBNvzQt4Ex4O9cRgUDEkLczc-hCPJJuhcumhIJBOoM=",//if that does not work this picture will appear.
        }
        res.render("index.ejs", data)

    } catch(error) {
        console.error("Failed to make request: ", error.message);
        req.status(500).send("Failed to fetch the activity. Please try again");
    }
});

app.listen(port, () => {
    console.log(`server running on port :${port}`);
});