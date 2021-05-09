const Book = require('./models/books');

const addBookHandler = (request, h) => {
  const book = new Book();
  book.create(request.payload);
  if (book.error) {
    const response = h.response({
      status: 'fail',
      message: book.error,
    });
    response.code(400);
    return response;
  }
  const response = h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: { bookId: book.get('id') },
  });
  response.code(201);
  return response;
};

const updateBookHandler = (request, h) => {
  const book = new Book();
  const find = book.findById(request.params.id);
  if (!find) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  book.save(request.params.id, request.payload);
  if (book.error) {
    const response = h.response({
      status: 'fail',
      message: book.error,
    });
    response.code(400);
    return response;
  }
  const response = h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  });
  response.code(200);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const bookModel = new Book();
  let books = bookModel.findAll();
  console.log(request.query);
  books = books.filter((book) => {
    console.log(book);
    if (request.query.reading === '0') {
      return !book.reading;
    }
    if (request.query.reading === '1') {
      return book.reading;
    }
    if (request.query.finished === '0') {
      return book.readPage < book.pageCount;
    }
    if (request.query.finished === '1') {
      return book.readPage >= book.pageCount;
    }
    if (request.query.name) {
      return book.name.toLowerCase().indexOf(request.query.name.toLowerCase()) > -1;
    }
    return true;
  }).map((book) => ({ id: book.id, name: book.name, publisher: book.publisher }));

  const response = h.response({
    status: 'success',
    data: { books },
  });
  response.code(200);
  return response;
};

const findBookById = (request, h) => {
  const bookModel = new Book();
  const book = bookModel.findById(request.params.id);
  if (book == null) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }
  book.finished = book.readPage >= book.pageCount;
  const response = h.response({
    status: 'success',
    data: { book },
  });
  response.code(200);
  return response;
};

const deleteBookById = (request, h) => {
  const bookModel = new Book();
  const result = bookModel.delete(request.params.id);
  if (result) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler, getAllBooksHandler, findBookById, deleteBookById, updateBookHandler,
};
