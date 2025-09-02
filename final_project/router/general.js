import express from 'express'
import books from"./booksdb.js";
const genl_routes = express.Router();



const getBooks = () => {
  return Promise.resolve(books);
};


// found bookn by ISBN
export const getByISBN = async(isbn) => {
  const book = books[isbn];
  if (book) {
    return book;
  } else {
    throw { status: 404, message: `Book with ISBN ${isbn} not found` };
  }
}


// found bookn by Key
const getByKey = async(key, value)=>{
  if(!key || !value) throw { status: 400, message: `Key or value not found` };
  const bookArray = Object.values(books);
  const book = bookArray.filter(b=> b[key] === value)
  if (book.length) {
    return book;
  } else {
    throw { status: 404, message: `No books found for ${key}="${value}"` };
  }
}



// #1-10
//  Get all books
genl_routes.get('/', async function (req, res) {
  getBooks()
  .then((bookList) => {
    res.status(200).json({ ...bookList });
  })
  .catch((error) => {
    res.status(500).send("Error retrieving book list");
  });
  
});


//#2
//  Get books by ISBN
genl_routes.get('/isbn/:isbn',async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getByISBN(isbn);
    res.status(200).json(book); 
  } catch (error) {
    res.status(error.status || 500).json({message: error.message || "Unknown error"} );
  }
 });


//#3 - #12
//  Get books by author
genl_routes.get('/author/:author',async function (req, res) {
    const author = req.params.author;
    try {
      const books = await getByKey('author', author);
      res.status(200).json({books:books})
    } catch (error) {
      res.status(error.status || 500).json({message: error.message || "Unknown error"} );
    }
});

//#4 - #13
//  Get books by title
genl_routes.get('/title/:title',async function (req, res) {
    const title = req.params.title;
    try {
      const books = await getByKey('title', title);
      res.status(200).json({books:books})
    } catch (error) {
      res.status(error.status || 500).json({message: error.message || "Unknown error"} );
    }
});


//#5
//  Get books review
genl_routes.get('/review/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const book = await getByISBN(isbn);
      res.status(200).json({...book.reviews})
    } catch (error) {
      res.status(error.status || 500).json( {message: error.message || "Unknown error"} );
    }
});


// #8
// add review
genl_routes.post('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const review = req.body?.review||'';
  const email = req.session?.authorization?.email;

  if (!email) return res.status(401).json({message:'You are not logged in'});
  if (!isbn) return res.status(400).json({message:'ISBN is missing'});

  const book = books[isbn];
  if (!book) return res.status(404).json({message:`Book with ISBN ${isbn} not found`});

  book.reviews ??= {};
  book.reviews[email] = review;

  return res.status(201).send('Review added')
});


// #8 
// update review
genl_routes.put('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const review = req.body?.review;
  const email = req.session?.authorization?.email;

  if (!email) return res.status(401).json({message:'You are not logged in'});
  if (!isbn) return res.status(400).json({message:'ISBN is missing'});

  const book = books[isbn];
  if (!book) return res.status(404).json({message:`Book with ISBN ${isbn} not found`});

  book.reviews ??= {};
  book.reviews[email] = review;

  return res.status(201).send(`Review updated`)
});


// #9 
// delete review
genl_routes.delete('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const email = req.session?.authorization?.email;

  if (!email) return res.status(401).json({message:'You are not logged in'});
  if (!isbn) return res.status(400).json({message:'ISBN is missing'});

  const book = books[isbn];
  if (!book) return res.status(404).json({message:`Book with ISBN ${isbn} not found`});
  if (!book.reviews || !(email in book.reviews)) {
    return res.status(404).send('No review from this user to delete');
  }

  delete book.reviews[email];
  return res.status(201).send('Review deleted')
});





export default genl_routes