const { nanoid } = require('nanoid');
const db = require('../db');

class Model {
  constructor(data) {
    this.data = data;
    this.fields = [
      {
        name: 'id',
        read_only: true,
      },
      {
        name: 'insertedAt',
        read_only: true,
      },
      {
        name: 'updatedAt',
        read_only: true,
      },
    ];
    this.entity_name = 'entity';
  }

  set(name, value) {
    this.fields = this.fields.map((field) => {
      const newField = field;
      if (field.name === name) {
        newField.value = value;
      }
      return newField;
    });
  }

  get(name) {
    const find = this.fields.filter((field) => field.name === name);
    return find[0].value;
  }

  assignAttributes(object) {
    Object.keys(object).map((field) => (
      this.set(field, object[field])
    ));
  }

  init() {
    this.fields = this.fields.map((field) => (
      {
        name: (field.name || field),
        label: (field.label || field),
        value: ((this.data && this.data[field.name]) || null),
        read_only: field.read_only || false,
      }
    ));
  }

  validateUpdate(object) {
    const validation = {};
    try {
      this.fields.map((field) => {
        if (field.name === 'id') {
          return true;
        }
        if (field.read_only) {
          return true;
        }
        if (object[field.name] === undefined) {
          throw new Error(`Gagal memperbarui ${this.entity_name}. Mohon isi ${field.label}`);
        }
        return true;
      });
    } catch (err) {
      validation.error = err.message;
      if (err instanceof TypeError) {
        validation.error = err.message;
      }
    }
    return validation;
  }

  validateInsert(object) {
    const validation = {};
    try {
      this.fields.map((field) => {
        if (object[field.name] === undefined) {
          throw new Error(`Gagal menambahkan ${this.entity_name}. Mohon isi ${field.label}`);
        }
        return true;
      });
    } catch (err) {
      validation.error = err.message;
    }
    return validation;
  }

  save(id, entity) {
    const validated = this.validateUpdate(entity);
    this.error = validated.error;
    const index = db[this.entity_name].findIndex((object) => (object.id === id));
    entity.insertedAt = this.get('insertedAt');
    if (!this.error) {
      const data = {};
      this.fields.map((field) => {
        data[field.name] = entity[field.name];
        this.set(field.name, entity[field.name]);
        return true;
      });
      data.id = id;
      data.updatedAt = new Date().toISOString();
      db[this.entity_name][index] = data;
      this.assignAttributes(data);
      return data;
    }
    return entity;
  }

  create(entity) {
    const validated = this.validateInsert(entity);
    this.error = validated.error;
    if (!this.error) {
      const data = {};
      this.fields.map((field) => {
        data[field.name] = entity[field.name];
        this.set(field.name, entity[field.name]);
        return true;
      });
      data.id = nanoid(12);
      data.insertedAt = new Date().toISOString();
      data.updatedAt = data.insertedAt;
      db[this.entity_name].push(data);
      this.assignAttributes(data);

      return data;
    }
    return entity;
  }

  findAll() {
    const entities = db[this.entity_name];
    return entities;
  }

  findById(id) {
    const results = db[this.entity_name].filter((object) => (object.id === id));
    if (results.length > 0) {
      return results[0];
    }
    return null;
  }

  delete(id) {
    const index = db[this.entity_name].findIndex((object) => (object.id === id));
    if (index !== -1) {
      db[this.entity_name].splice(index, 1);
      return true;
    }
    return false;
  }
}

module.exports = Model;
