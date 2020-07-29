class DataService {
  constructor() {
    this.lists = [];

    this.addList = this.addList.bind(this);
    this.deleteList = this.deleteList.bind(this);
  }

  addList(name, list) {
    const newName = name === '' ? `List ${this.lists.length + 1}` : name;
    this.lists.push({ name: newName, list });
    return this.lists.slice();
  }

  deleteList(index) {
    this.lists.splice(index, 1);
    return this.lists.slice();
  }
}

export default DataService;
