const Model = require('.');

class Book extends Model {
  constructor() {
    super();
    this.entity_name = 'buku';
    this.fields = [
      ...this.fields,
      { name: 'name', label: 'nama buku' }, 'year', 'author', 'summary', 'publisher', 'pageCount', 'readPage', 'reading',
    ];
    this.init();
  }

  validateInsert(book) {
    const validation = {};
    try {
      if (book.readPage > book.pageCount) {
        throw new Error(`Gagal menambahkan ${this.entity_name}. readPage tidak boleh lebih besar dari pageCount`);
      }
      this.fields.map((field) => {
        if (field.read_only) {
          return true;
        }
        if (book[field.name] === undefined) {
          throw new Error(`Gagal menambahkan ${this.entity_name}. Mohon isi ${field.label}`);
        }
        return true;
      });
    } catch (err) {
      validation.error = err.message;
    }
    return validation;
  }

  validateUpdate(book) {
    const validation = {};
    try {
      if (book.readPage > book.pageCount) {
        throw new Error(`Gagal memperbarui ${this.entity_name}. readPage tidak boleh lebih besar dari pageCount`);
      }
      this.fields.map((field) => {
        if (field.name === 'id') {
          return true;
        }
        if (field.read_only) {
          return true;
        }
        if (book === null || book[field.name] === undefined) {
          throw new Error(`Gagal memperbarui ${this.entity_name}. Mohon isi ${field.label}`);
        }
        return true;
      });
    } catch (err) {
      validation.error = err.message;
      if (err instanceof TypeError) {
        validation.error = 'Gagal memperbarui buku. Id tidak ditemukan';
      }
    }
    return validation;
  }
}

module.exports = Book;
